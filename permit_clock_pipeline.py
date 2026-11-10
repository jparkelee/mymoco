#!/usr/bin/env python3
"""
Permit Clock: build the permit wait-time file for the dashboard.

What it does, in plain words:
  1. Downloads Montgomery County residential building permits from the county's
     open data site (dataMontgomery, dataset m88u-pqki) through its free API.
  2. For each permit, counts the days between the day it was filed ("addeddate")
     and the day it was issued ("issueddate").
  3. Sorts each permit into a plain-English project type (deck, addition, ...).
  4. Writes permits_clean.csv with exactly the columns the dashboard reads.

Usage:
  python permit_clock_pipeline.py                       # real data, filed since 2023-01-01
  python permit_clock_pipeline.py --since 2024-01-01    # pick another start date
  python permit_clock_pipeline.py --from-json saved.json  # use an API download you saved
  python permit_clock_pipeline.py --demo                # make the made-up sample instead

Only the Python standard library is used. For faster downloads, get a free app
token on data.montgomerycountymd.gov and set SOCRATA_APP_TOKEN before running.
"""

import argparse
import csv
import json
import math
import os
import random
import sys
import time
from collections import Counter
from datetime import date, datetime, timedelta
from statistics import median
from urllib.parse import urlencode
from urllib.request import Request, urlopen

API_URL = "https://data.montgomerycountymd.gov/resource/m88u-pqki.json"
FIELDS = ["permitno", "status", "addeddate", "issueddate", "applicationtype",
          "worktype", "usecode", "city", "zip", "declaredvaluation"]
OUT_COLUMNS = ["permit_no", "applied_date", "issued_date", "status", "work_type",
               "use_code", "project_type", "city", "zip", "valuation", "wait_days"]


# ---------------------------------------------------------------- download ---

def fetch_permits(since, token=None, page_size=50_000, pause=0.5):
    """Page through the API: ask for 50,000 rows at a time until a page comes back short."""
    rows, offset = [], 0
    while True:
        query = {
            "$select": ",".join(FIELDS),
            "$where": f"addeddate >= '{since}T00:00:00'",
            "$order": ":id",
            "$limit": page_size,
            "$offset": offset,
        }
        headers = {"X-App-Token": token} if token else {}
        with urlopen(Request(API_URL + "?" + urlencode(query), headers=headers), timeout=180) as resp:
            page = json.load(resp)
        rows.extend(page)
        print(f"  downloaded {len(rows):,} permits", file=sys.stderr)
        if len(page) < page_size:
            return rows
        offset += page_size
        time.sleep(pause)


# ---------------------------------------------------------------- cleaning ---

def project_type(worktype, usecode):
    """Turn the county's work and use codes into a project name a homeowner would say.
    Order matters: the first rule that matches wins."""
    w, u = (worktype or "").upper(), (usecode or "").upper()
    if "DEMOL" in w:
        return "Demolition"
    if "ACCESSORY APARTMENT" in u or "ACCESSORY DWELLING" in u:
        return "Accessory apartment"
    if "POOL" in u:
        return "Pool"
    if "DECK" in u or "PORCH" in u:
        return "Deck or porch"
    if any(k in u for k in ("SHED", "GARAGE", "CARPORT")):
        return "Shed or garage"
    if "CONSTRUCT" in w and any(k in u for k in ("SINGLE FAMILY", "TOWNHOUSE", "DWELLING")):
        return "New home"
    if w.startswith("ADD"):
        return "Addition"
    if "ALTER" in w:
        return "Remodel"
    if any(k in w for k in ("REPAIR", "RESTORE", "REPLACE")):
        return "Repair"
    return "Other"


def to_date(value):
    return date.fromisoformat(value[:10]) if value else None


def clean(raw):
    """One API row in, one dashboard row out (or None plus the reason it was dropped)."""
    applied, issued = to_date(raw.get("addeddate")), to_date(raw.get("issueddate"))
    if applied is None:
        return None, "no filing date"
    if issued is not None and issued < applied:
        return None, "issued before it was filed"
    try:
        valuation = round(float(raw.get("declaredvaluation") or 0))
    except ValueError:
        valuation = ""
    return {
        "permit_no": raw.get("permitno", ""),
        "applied_date": applied.isoformat(),
        "issued_date": issued.isoformat() if issued else "",
        "status": (raw.get("status") or "").strip().title(),
        "work_type": raw.get("worktype", ""),
        "use_code": raw.get("usecode", ""),
        "project_type": project_type(raw.get("worktype"), raw.get("usecode")),
        "city": (raw.get("city") or "").strip().title() or "Unknown",
        "zip": (raw.get("zip") or "")[:5],
        "valuation": valuation,
        "wait_days": (issued - applied).days if issued else "",
    }, None


# ----------------------------------------------------------------- summary ---

def summarize(rows, dropped):
    """Print a quick sanity check: the same headline numbers the dashboard shows for 'All'."""
    as_of = max(date.fromisoformat(r["issued_date"] or r["applied_date"]) for r in rows)
    last_year = [r for r in rows if r["issued_date"]
                 and date.fromisoformat(r["issued_date"]) > as_of - timedelta(days=365)]
    review = [r["wait_days"] for r in last_year if r["wait_days"] > 0]
    still_waiting = [r for r in rows if not r["issued_date"]]
    print(f"\nRows written: {len(rows):,}   Data runs through: {as_of}")
    for reason, n in dropped.most_common():
        print(f"  dropped {n:,}: {reason}")
    if last_year:
        same_day = 1 - len(review) / len(last_year)
        print(f"Issued in the last 12 months: {len(last_year):,}")
        print(f"  issued the same day: {same_day:.0%}")
    if review:
        print(f"  typical (median) wait when review was needed: {median(review):.0f} days")
    print(f"Still waiting (filed, not issued): {len(still_waiting):,}")
    other = Counter((r["work_type"], r["use_code"]) for r in rows if r["project_type"] == "Other")
    if other:
        print("\nMost common codes landing in 'Other' (add rules to project_type() for these):")
        for (w, u), n in other.most_common(10):
            print(f"  {n:6,}  {w} / {u}")


# --------------------------------------------- made-up sample (--demo only) ---
# Everything below only makes the prototype's sample. Its numbers are assumptions,
# not facts about Montgomery County: each project type gets a chance of same-day
# approval and a typical review time, waits drift about 30% longer from 2023 to
# late 2026, and spring filings wait a little longer.

DEMO_PROJECTS = {  # share, same-day chance, typical review days, spread, codes, typical valuation
    "New home":            (0.07, 0.00, 100, 0.55, [("CONSTRUCT", "SINGLE FAMILY DWELLING"), ("CONSTRUCT", "TOWNHOUSE")], 420_000),
    "Addition":            (0.12, 0.04, 60, 0.60, [("ADD", "SINGLE FAMILY DWELLING"), ("ADD", "TOWNHOUSE")], 110_000),
    "Remodel":             (0.24, 0.35, 28, 0.70, [("ALTER", "SINGLE FAMILY DWELLING"), ("ALTER", "TOWNHOUSE")], 40_000),
    "Deck or porch":       (0.14, 0.30, 24, 0.65, [("CONSTRUCT", "DECK"), ("ADD", "PORCH")], 16_000),
    "Repair":              (0.18, 0.65, 12, 0.80, [("RESTORE AND / OR REPAIR", "SINGLE FAMILY DWELLING"), ("REPLACE", "SINGLE FAMILY DWELLING")], 7_000),
    "Pool":                (0.04, 0.08, 40, 0.60, [("CONSTRUCT", "SWIMMING POOL")], 70_000),
    "Shed or garage":      (0.06, 0.45, 18, 0.70, [("CONSTRUCT", "SHED"), ("CONSTRUCT", "GARAGE")], 14_000),
    "Accessory apartment": (0.03, 0.02, 85, 0.55, [("ALTER", "ACCESSORY APARTMENT"), ("CONSTRUCT", "ACCESSORY APARTMENT")], 140_000),
    "Demolition":          (0.04, 0.25, 22, 0.60, [("DEMOLISH", "SINGLE FAMILY DWELLING")], 18_000),
    "Other":               (0.08, 0.45, 16, 0.80, [("INSTALL", "RETAINING WALL"), ("OTHER", "MISCELLANEOUS")], 9_000),
}
DEMO_AREAS = {  # share of permits, ZIP codes, review-time factor
    "SILVER SPRING": (0.19, ["20901", "20902", "20903", "20904", "20905", "20906", "20910"], 1.00),
    "BETHESDA": (0.12, ["20814", "20816", "20817"], 1.04),
    "ROCKVILLE": (0.09, ["20850", "20851", "20852", "20853"], 1.00),
    "GAITHERSBURG": (0.07, ["20877", "20878", "20879", "20882"], 0.98),
    "GERMANTOWN": (0.07, ["20874", "20876"], 0.97),
    "POTOMAC": (0.07, ["20854"], 1.05),
    "CHEVY CHASE": (0.06, ["20815"], 1.15),
    "OLNEY": (0.04, ["20832"], 1.00),
    "KENSINGTON": (0.04, ["20895"], 1.10),
    "CLARKSBURG": (0.04, ["20871"], 1.04),
    "TAKOMA PARK": (0.03, ["20912"], 1.12),
    "BURTONSVILLE": (0.02, ["20866"], 0.98),
    "DAMASCUS": (0.02, ["20872"], 1.06),
    "DERWOOD": (0.02, ["20855"], 1.00),
    "MONTGOMERY VILLAGE": (0.02, ["20886"], 0.97),
    "POOLESVILLE": (0.01, ["20837"], 1.08),
    "BROOKEVILLE": (0.01, ["20833"], 1.03),
    "SANDY SPRING": (0.01, ["20860"], 1.02),
    "BOYDS": (0.01, ["20841"], 1.05),
    "GARRETT PARK": (0.01, ["20896"], 1.10),
}
DEMO_FILINGS_PER_MONTH = 520
DEMO_SEASON = [0.80, 0.85, 1.10, 1.25, 1.25, 1.20, 1.10, 1.05, 1.00, 0.95, 0.85, 0.75]  # Jan..Dec


def make_demo_records(start=date(2023, 1, 1), as_of=date(2026, 10, 30), seed=7):
    """Raw rows shaped exactly like the API's answer, so they go through the same clean()."""
    rng = random.Random(seed)
    projects, areas = list(DEMO_PROJECTS), list(DEMO_AREAS)
    p_weights = [DEMO_PROJECTS[p][0] for p in projects]
    a_weights = [DEMO_AREAS[a][0] for a in areas]
    span = (as_of - start).days
    records, serial = [], 0
    month = start
    while month <= as_of:
        nxt = (month.replace(day=28) + timedelta(days=4)).replace(day=1)
        days = [month + timedelta(d) for d in range((min(nxt, as_of + timedelta(1)) - month).days)]
        weekdays = [d for d in days if d.weekday() < 5] or days
        n = round(DEMO_FILINGS_PER_MONTH * DEMO_SEASON[month.month - 1] * rng.uniform(0.93, 1.07)
                  * len(days) / 30.4)
        for _ in range(n):
            serial += 1
            filed = rng.choice(weekdays)
            proj = rng.choices(projects, p_weights)[0]
            area = rng.choices(areas, a_weights)[0]
            _, same_day, typical, spread, codes, value = DEMO_PROJECTS[proj]
            _, zips, area_factor = DEMO_AREAS[area]
            if rng.random() < same_day:
                wait = 0
            else:
                drift = 1 + 0.30 * (filed - start).days / span
                spring = 1.08 if filed.month in (4, 5, 6, 7) else 1.0
                wait = max(1, min(720, round(rng.lognormvariate(
                    math.log(typical * drift * spring * area_factor), spread))))
            issued = filed + timedelta(days=wait)
            filed_at = datetime(filed.year, filed.month, filed.day, rng.randint(8, 15), rng.randint(0, 59))
            if issued > as_of:
                issued_at, status = None, "OPEN"
            else:
                issued_at = datetime(issued.year, issued.month, issued.day, 16, 30) if wait else filed_at + timedelta(hours=1)
                status = "FINALED" if (as_of - issued).days > 150 and rng.random() < 0.7 else "ISSUED"
            worktype, usecode = rng.choice(codes)
            records.append({
                "permitno": f"SMP-{serial:06d}",
                "status": status,
                "addeddate": filed_at.isoformat(timespec="milliseconds"),
                "issueddate": issued_at.isoformat(timespec="milliseconds") if issued_at else None,
                "applicationtype": "BUILDING RESIDENTIAL PERMIT",
                "worktype": worktype,
                "usecode": usecode,
                "city": area,
                "zip": rng.choice(zips),
                "declaredvaluation": str(round(rng.lognormvariate(math.log(value), 0.6), -2)),
            })
        month = nxt
    return records


# -------------------------------------------------------------------- main ---

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--since", default="2023-01-01", help="first filing date to download (YYYY-MM-DD)")
    ap.add_argument("--from-json", help="read a saved API download instead of calling the API")
    ap.add_argument("--demo", action="store_true", help="make the made-up sample instead of real data")
    ap.add_argument("--out", help="output CSV path")
    args = ap.parse_args()

    if args.demo:
        raw = make_demo_records()
        out = args.out or "permits_sample.csv"
    elif args.from_json:
        with open(args.from_json) as f:
            raw = json.load(f)
        out = args.out or "permits_clean.csv"
    else:
        print(f"Downloading permits filed since {args.since} ...", file=sys.stderr)
        raw = fetch_permits(args.since, os.environ.get("SOCRATA_APP_TOKEN"))
        out = args.out or "permits_clean.csv"

    rows, dropped = [], Counter()
    for record in raw:
        row, reason = clean(record)
        if row:
            rows.append(row)
        else:
            dropped[reason] += 1
    rows.sort(key=lambda r: (r["applied_date"], r["permit_no"]))

    with open(out, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=OUT_COLUMNS, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)
    summarize(rows, dropped)
    print(f"\nWrote {out}")


if __name__ == "__main__":
    main()

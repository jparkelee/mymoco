#!/usr/bin/env python3
"""
MoCo data pipeline: build real data for My MoCo, the Permit Clock and the Fairness Check.

Run it on your own computer (it needs internet). Plain Python, nothing to install.
Keep permit_clock_pipeline.py in the same folder: this script reuses its cleaning rules.

  python pipeline/moco_data_pipeline.py inspect311   # step 0: print the 311 file's real column names
  python pipeline/moco_data_pipeline.py all          # build everything into data/ (what the nightly job runs)

Outputs, all in --out-dir (default data/):
  permits_clean.csv       Permit Clock
  requests_311_clean.csv  Fairness Check
  mymoco_data.json        My MoCo and Neighborhood Alerts
  meta.json               when the data was last updated

Safety: a file is only replaced if the new download looks healthy. If a download comes back empty
or with less than half the rows of the file it would replace, the run stops with an error, the
old file stays in place, and GitHub emails you that the run failed.
Optional: set SOCRATA_APP_TOKEN (free from data.montgomerycountymd.gov) for faster downloads.
"""

import argparse
from datetime import datetime, timezone
from pathlib import Path
import csv
import json
import os
import sys
import time
from collections import Counter, defaultdict
from datetime import date, timedelta
from urllib.parse import urlencode
from urllib.request import Request, urlopen

import permit_clock_pipeline as permits_pipe  # same folder

PORTAL = "https://data.montgomerycountymd.gov/resource/{}.json"
PERMITS_ID = "m88u-pqki"   # Residential Permit
MC311_ID = "xtyh-brr2"     # MC311 Service Requests (since July 2012, updated daily)

# The 311 file's exact column names aren't published in the catalog, so the script looks for the
# first name on each list that exists. If one is missed, `inspect311` shows the real names and you
# can pass them with --opened/--closed/--category/--area/--zip/--sla.
CANDIDATES = {
    "opened": ["created_date", "opened", "open_date", "sr_created_date", "date_opened", "created"],
    "closed": ["close_date", "closed_date", "closed", "date_closed", "sr_closed_date"],
    "category": ["solution", "sr_type", "type", "request_type", "service_request_type", "area"],
    "area": ["city", "sr_city", "location_city", "incident_city"],
    "zip": ["zip", "zip_code", "zipcode", "sr_zip"],
    "sla": ["attached_solution_sla_days", "solution_sla_days", "sla_days", "sla"],
}
# Plain-English request types the pages use; anything else keeps the county's own name.
CATEGORY_RULES = [
    ("pothole", "Pothole"), ("streetlight", "Streetlight out"), ("street light", "Streetlight out"),
    ("sidewalk", "Sidewalk repair"), ("storm drain", "Storm drain clog"), ("inlet", "Storm drain clog"),
    ("tree", "Tree down or hazard"), ("abandoned vehicle", "Abandoned vehicle"),
    ("trash", "Missed trash or recycling"), ("recycling", "Missed trash or recycling"),
    ("signal", "Traffic signal problem"),
]
OUT = Path("data")
MIN_SHARE_OF_PREVIOUS = 0.5   # refuse a new file with fewer than half the old file's rows


def safe_write_csv(name, rows, columns):
    """Write to a temporary file, check it against the file it would replace, then swap it in."""
    path = OUT / name
    if not rows:
        sys.exit(f"Refusing to write {name}: the download came back empty. Keeping the old file.")
    try:
        replacing_real_data = json.load(open(OUT / "meta.json")).get("kind") == "county"
    except (OSError, ValueError):
        replacing_real_data = False
    if path.exists() and replacing_real_data:   # the starter sample can always be replaced
        with open(path) as f:
            old = max(sum(1 for _ in f) - 1, 0)
        if old > 1000 and len(rows) < old * MIN_SHARE_OF_PREVIOUS:
            sys.exit(f"Refusing to write {name}: {len(rows):,} rows vs {old:,} before. Keeping the old file.")
    tmp = path.with_suffix(".tmp")
    write_csv(tmp, rows, columns)
    os.replace(tmp, path)


FALLBACK_TARGET_DAYS = {"Pothole": 7, "Streetlight out": 10, "Sidewalk repair": 60, "Storm drain clog": 14,
                        "Tree down or hazard": 10, "Abandoned vehicle": 15, "Missed trash or recycling": 2,
                        "Traffic signal problem": 3}


def get(dataset, query, token=None):
    url = PORTAL.format(dataset) + "?" + urlencode(query)
    headers = {"X-App-Token": token} if token else {}
    with urlopen(Request(url, headers=headers), timeout=180) as resp:
        return json.load(resp)


def page_all(dataset, query, token=None, page_size=50_000):
    rows, offset = [], 0
    while True:
        page = get(dataset, {**query, "$limit": page_size, "$offset": offset, "$order": ":id"}, token)
        rows.extend(page)
        print(f"  {dataset}: {len(rows):,} rows", file=sys.stderr)
        if len(page) < page_size:
            return rows
        offset += page_size
        time.sleep(0.5)


def pick_columns(sample_keys, overrides):
    chosen = {}
    for role, names in CANDIDATES.items():
        chosen[role] = overrides.get(role) or next((n for n in names if n in sample_keys), None)
    return chosen


def plain_category(raw):
    low = (raw or "").lower()
    return next((label for key, label in CATEGORY_RULES if key in low), (raw or "Unknown").strip())


# ------------------------------------------------------------------ steps ---

def step_inspect311(args):
    row = get(MC311_ID, {"$limit": 1}, args.token)[0]
    print("MC311 columns and one example value:")
    for k, v in row.items():
        print(f"  {k:40s} {str(v)[:60]}")
    print("\nDetected:", json.dumps(pick_columns(set(row), vars_overrides(args)), indent=2))


def step_permits(args):
    raw = permits_pipe.fetch_permits(args.since, args.token)
    rows, dropped = [], Counter()
    for record in raw:
        row, reason = permits_pipe.clean(record)
        (rows.append(row) if row else dropped.update([reason]))
    rows.sort(key=lambda r: (r["applied_date"], r["permit_no"]))
    safe_write_csv("permits_clean.csv", rows, permits_pipe.OUT_COLUMNS)
    permits_pipe.summarize(rows, dropped)


def step_requests311(args):
    keys = set(get(MC311_ID, {"$limit": 1}, args.token)[0])
    col = pick_columns(keys, vars_overrides(args))
    missing = [r for r in ("opened", "closed", "category", "area") if not col[r]]
    if missing:
        sys.exit(f"Couldn't find columns for {missing}. Run `inspect311`, then pass e.g. --opened <name>.")
    print("Using columns:", col, file=sys.stderr)
    raw = page_all(MC311_ID, {"$select": ",".join(c for c in col.values() if c),
                              "$where": f"{col['opened']} >= '{args.since}T00:00:00'"}, args.token)
    out, unmapped = [], Counter()
    for i, r in enumerate(raw):
        opened, closed = permits_pipe.to_date(r.get(col["opened"])), permits_pipe.to_date(r.get(col["closed"]))
        if not opened or (closed and closed < opened):
            continue
        category = plain_category(r.get(col["category"]))
        if category not in FALLBACK_TARGET_DAYS:
            unmapped[category] += 1
            if not args.all_types:
                continue
        try:
            target = round(float(r.get(col["sla"]))) if col["sla"] and r.get(col["sla"]) else FALLBACK_TARGET_DAYS.get(category, "")
        except ValueError:
            target = FALLBACK_TARGET_DAYS.get(category, "")
        out.append({"opened_date": opened.isoformat(),
                    "closed_date": closed.isoformat() if closed else "", "category": category,
                    "area": (r.get(col["area"]) or "Unknown").strip().title(),
                    "days_to_close": (closed - opened).days if closed else "", "target_days": target})
    safe_write_csv("requests_311_clean.csv", out, list(out[0]) if out else [])
    size_mb = (OUT / "requests_311_clean.csv").stat().st_size / 1e6
    print(f"Wrote requests_311_clean.csv ({len(out):,} rows, {size_mb:.1f} MB).")
    if size_mb > 40:
        print("Warning: over 40 MB. Use a later --since date so the Fairness Check stays fast.")
    if unmapped:
        label = "Skipped" if not args.all_types else "Kept under the county's own names"
        print(f"{label}: request types without a plain-English rule (add them to CATEGORY_RULES to include):")
        for name, k in unmapped.most_common(12):
            print(f"  {k:7,}  {name}")


def step_mymoco(args):
    """Same shape as the prototype's data: wait-time summaries plus recent permit events by block."""
    def q(xs, p):
        s = sorted(xs); i = (len(s) - 1) * p; lo = int(i); hi = min(lo + 1, len(s) - 1)
        return round(s[lo] + (s[hi] - s[lo]) * (i - lo))

    permits = list(csv.DictReader(open(OUT / "permits_clean.csv")))
    as_of = max(date.fromisoformat(r["issued_date"] or r["applied_date"]) for r in permits)
    groups = defaultdict(lambda: {"all": 0, "rev": []})
    for r in permits:
        if r["issued_date"] and date.fromisoformat(r["issued_date"]) > as_of - timedelta(days=365):
            for key in [(r["project_type"], r["city"]), (r["project_type"], "All")]:
                groups[key]["all"] += 1
                if int(r["wait_days"]) > 0:
                    groups[key]["rev"].append(int(r["wait_days"]))
    permit_summary = {f"{p}|{c}": {"n": g["all"], "same_day": round(1 - len(g["rev"]) / g["all"], 2),
                                   "p25": q(g["rev"], .25), "p50": q(g["rev"], .5), "p90": q(g["rev"], .9)}
                      for (p, c), g in groups.items() if len(g["rev"]) >= 8}

    reqs = list(csv.DictReader(open(OUT / "requests_311_clean.csv")))
    waits = defaultdict(list)
    for r in reqs:
        if r["closed_date"] and date.fromisoformat(r["closed_date"]) > as_of - timedelta(days=365):
            for key in [(r["category"], r["area"]), (r["category"], "All")]:
                waits[key].append(int(r["days_to_close"]))
    request_summary = {f"{c}|{a}": {"n": len(v), "p50": q(v, .5), "p90": q(v, .9)} for (c, a), v in waits.items() if len(v) >= 8}

    # Recent permits as neighborhood events, by block only (never a full address or a name).
    since = (as_of - timedelta(days=44)).isoformat()
    recent = page_all(PERMITS_ID, {"$select": "permitno,addeddate,issueddate,stno,stname,suffix,city,zip,worktype,usecode",
                                   "$where": f"addeddate >= '{since}T00:00:00'"}, args.token)
    events = []
    for r in recent:
        filed = permits_pipe.to_date(r.get("addeddate"))
        try:
            block = f"{int(r.get('stno', '0')) // 100 * 100} block of {(r.get('stname') or '').title()} {(r.get('suffix') or '').title()}".strip()
        except ValueError:
            block = (r.get("stname") or "").title()
        kind = permits_pipe.project_type(r.get("worktype"), r.get("usecode"))
        demolition = kind == "Demolition"
        events.append({"id": r.get("permitno"), "date": filed.isoformat(), "type": "Demolition" if demolition else "Building permit",
                       "title": f"Permit filed: {kind.lower()}", "block": block, "area": (r.get("city") or "").title(),
                       "zip": (r.get("zip") or "")[:5], "level": "notice" if demolition else "info"})
    events.sort(key=lambda e: e["date"], reverse=True)
    updated = datetime.now(timezone.utc).isoformat(timespec="seconds")
    out = {"kind": "county", "updated": updated, "as_of": as_of.isoformat(), "permits": permit_summary, "requests": request_summary, "events": events,
           "note": "Events cover building and demolition permits only; inspections, liquor licenses and housing code cases come next."}
    if not permit_summary or not request_summary:
        sys.exit("Refusing to write mymoco_data.json: no permit or request summaries. Keeping the old file.")
    tmp = OUT / "mymoco_data.tmp"
    json.dump(out, open(tmp, "w"), separators=(",", ":"))
    os.replace(tmp, OUT / "mymoco_data.json")
    json.dump({"kind": "county", "updated": updated, "permits": len(permits), "requests": len(reqs)}, open(OUT / "meta.json", "w"))
    print(f"Wrote mymoco_data.json: {len(permit_summary)} permit groups, {len(request_summary)} request groups, {len(events)} events.")


# ---------------------------------------------------------------- helpers ---

def write_csv(path, rows, columns):
    with open(path, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=columns, lineterminator="\n")
        w.writeheader()
        w.writerows(rows)


def vars_overrides(args):
    return {k: getattr(args, k) for k in CANDIDATES if getattr(args, k, None)}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("step", choices=["inspect311", "permits", "requests311", "mymoco", "all"])
    ap.add_argument("--since", default=(date.today() - timedelta(days=730)).isoformat(), help="first date to download (YYYY-MM-DD); default two years back")
    ap.add_argument("--out-dir", default="data", help="folder for the output files (default data/)")
    ap.add_argument("--all-types", action="store_true", help="keep every 311 request type, not just the ones the pages use")
    for role in CANDIDATES:
        ap.add_argument(f"--{role}", help=f"311 column to use for {role}")
    args = ap.parse_args()
    args.token = os.environ.get("SOCRATA_APP_TOKEN")
    global OUT
    OUT = Path(args.out_dir)
    OUT.mkdir(parents=True, exist_ok=True)
    steps = {"inspect311": [step_inspect311], "permits": [step_permits], "requests311": [step_requests311],
             "mymoco": [step_mymoco], "all": [step_permits, step_requests311, step_mymoco]}[args.step]
    for step in steps:
        step(args)


if __name__ == "__main__":
    main()

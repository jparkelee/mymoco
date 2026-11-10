# My MoCo

What’s changing on your street in Montgomery County, Maryland, from the county’s open data.

This folder is a complete website. Every night, GitHub downloads the county’s newest permit and 311 data, checks it, saves it here, and republishes the site. You don’t have to update anything by hand.

| Page | File | What it shows |
| --- | --- | --- |
| My MoCo | `index.html` + `app.js` | A personal briefing for your address |
| Neighborhood Alerts | `alerts.html` + `alerts.js` | Every recent change near you |
| Permit Clock | `permit-clock.html` | How long building permits take |
| Fairness Check | `fairness-check.html` | How fast 311 problems get fixed, area by area |

Until the first nightly run, the pages show **sample data**, and say so. After it, they show county data with the date it was updated.

---

## Set it up (about an hour, no coding)

### 1. Create a GitHub account
Go to [github.com](https://github.com) and sign up. The free plan is all you need.

### 2. Create a repository (your project’s home)
1. Click **+** in the top right, then **New repository**.
2. Name it `mymoco`.
3. Choose **Public**. (Free automatic publishing needs a public project.)
4. Click **Create repository**.

### 3. Upload the files
1. On the new repository’s page, click **uploading an existing file**.
2. Open this `mymoco` folder on your computer, select **everything inside it**, and drag it onto the page.
3. Scroll down and click **Commit changes**.

**Important: check that the hidden `.github` folder came along.** Your repository’s file list should show a `.github` folder. Macs and Windows hide folders that start with a dot, so it’s easy to miss. If it’s not there, add the two files by hand:

1. Click **Add file**, then **Create new file**.
2. In the name box, type `.github/workflows/nightly.yml` (typing the slashes creates the folders).
3. Open `nightly.yml` from this folder in any text editor, copy everything, and paste it in.
4. Click **Commit changes**.
5. Repeat for `.github/workflows/deploy.yml`.

On a Mac, press **Cmd + Shift + .** in Finder to show hidden folders. On Windows, in File Explorer choose **View**, then **Show**, then **Hidden items**.

### 4. Turn on the website
1. In your repository, click **Settings**, then **Pages** in the left menu.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.

### 5. Optional but recommended: add a county app token
A free token makes downloads faster and less likely to be slowed down.

1. Sign up at [data.montgomerycountymd.gov](https://data.montgomerycountymd.gov), open your profile’s developer settings, and create an app token.
2. In your repository, go to **Settings**, then **Secrets and variables**, then **Actions**.
3. Click **New repository secret**. Name it `SOCRATA_APP_TOKEN` and paste the token. It stays hidden from everyone, including you, after saving.

### 6. Run the first update
1. Click the **Actions** tab. If GitHub asks, click to enable workflows.
2. Click **Nightly data update** on the left, then **Run workflow**, then the green **Run workflow** button.
3. Wait for the green check mark. The first run takes several minutes.

### 7. Visit your site
Your site is at `https://YOUR-USERNAME.github.io/mymoco/`. The exact address also appears under **Settings**, then **Pages**.

From now on, it updates itself every morning.

---

## If something goes wrong

**A run failed (red X, and GitHub emailed you).** Click the failed run, then the step with the red X, and read the last lines.

- *“Couldn’t find columns for …”*: the county’s 311 file uses different column names than expected. Run the workflow again and choose **inspect311** under “What to run.” It prints the real names. Then edit `pipeline/moco_data_pipeline.py` and add the right name to the matching list in `CANDIDATES` near the top.
- *“Refusing to write … Keeping the old file.”*: today’s download looked broken (empty, or less than half the usual size). Your site keeps yesterday’s data. This usually fixes itself the next night. If it repeats for days, check whether the county changed something.
- *A permission error on “Save the new data”*: go to **Settings**, then **Actions**, then **General**, and under **Workflow permissions** choose **Read and write permissions**.

**The site says “County data last updated … Today’s update didn’t run yet.”** The data is more than two days old. Check the Actions tab for failed runs. GitHub also pauses scheduled jobs in public projects with no activity for 60 days. The nightly saves count as activity, but if updates stopped, open the Actions tab and re-enable the workflow.

**A page says “Today’s data didn’t load.”** Refresh. If it persists, check that the `data` folder exists in your repository.

---

## Changing things

- **Wording on a page:** open the file in your repository (for example `app.js` for My MoCo’s text, which has every sentence in English and Spanish), click the pencil icon, edit, and click **Commit changes**. The site republishes automatically in a minute or two.
- **Run the update right now:** Actions tab, **Nightly data update**, **Run workflow**.
- **Change the update time:** edit the `cron` line in `.github/workflows/nightly.yml`. It uses UTC time.
- **Use your own web address:** buy a domain, then follow GitHub’s guide under **Settings**, then **Pages**, then **Custom domain**.

## How it works

```
.github/workflows/nightly.yml   the schedule: runs every morning
pipeline/moco_data_pipeline.py  downloads county data and checks it
pipeline/permit_clock_pipeline.py  the permit cleaning rules it reuses
data/                           fresh files the pipeline saves each night
index.html, alerts.html, ...    the pages, which read the data files
assets/                         shared styles, the chart library and a small chart helper
```

The free-text box on My MoCo uses simple keyword matching on this site. The smarter version that reads descriptions with Claude needs an Anthropic API key and a small server to keep it secret; that’s an optional later step.

Data: [dataMontgomery](https://data.montgomerycountymd.gov), Montgomery County’s open data portal. This is an independent project, not run by Montgomery County.

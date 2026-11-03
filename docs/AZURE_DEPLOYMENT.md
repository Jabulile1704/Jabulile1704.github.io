# Deploying this portfolio to Azure Static Web Apps

A step-by-step guide for deploying `Jabulile1704.github.io` to Azure
Static Web Apps (SWA), wired to GitHub so every push to `main` redeploys
automatically.

Written for an **Azure for Students** subscription.

---

> ## ⚠️ Parked: blocked by subscription region policy
>
> **This guide cannot currently be completed on the Azure for Students
> subscription it was written for.** Attempting to create the Static Web App
> fails at the final step with:
>
> ```
> RequestDisallowedByAzure
> This policy maintains a set of best available regions where your
> subscription can deploy resources.
> ```
>
> The cause is a hard region collision. Azure for Students subscriptions are
> restricted by a Microsoft-managed platform policy to roughly five regions,
> which vary per subscription, and Static Web Apps only runs in roughly five
> regions of its own. For this subscription the two sets do not intersect at
> all:
>
> | Static Web Apps runs in | This subscription allows |
> |---|---|
> | Central US | centralindia |
> | East US 2 | italynorth |
> | West US 2 | switzerlandnorth |
> | West Europe | uaenorth |
> | East Asia | brazilsouth |
>
> All five Static Web Apps regions were tested and all five failed, so this is
> not a misconfiguration — the service is not offered anywhere this
> subscription may deploy.
>
> Note the error code is `RequestDisallowedByAzure`, **not**
> `RequestDisallowedByPolicy`. It is enforced by the Azure platform for student
> and free offers, so there is no Azure Policy assignment to view, edit or
> exempt — the Policy blade typically shows nothing, or shows *Compliant*.
>
> **To unblock this guide**, the subscription has to change:
>
> - **Upgrade to Pay-As-You-Go** (*Subscriptions → Upgrade*) is the route that
>   reportedly lifts the region policy. Note the trade-off: Azure for Students
>   has no credit card and stops hard when the credit is spent, so you cannot
>   be charged. Pay-As-You-Go puts a billable card on file and removes that
>   safety net. The Static Web Apps **Free** plan itself remains $0.
> - **An institutional subscription** via Azure Dev Tools / Education Hub, if
>   your university participates, may carry no region restriction.
> - **A support request** for additional regions. Sources disagree on whether
>   this is ever granted for student offers; free to file, but do not plan
>   around it.
>
> Once the subscription allows one of the five Static Web Apps regions, this
> guide works as written from section 3 onward.
>
> **Meanwhile the portfolio is deployed on GitHub Pages**, and the
> `BASE_PATH` mechanism described in section 1 is what keeps the build portable
> between a subdirectory host and a domain-root host. That part is live and in
> use — only the Azure half is parked.
>
> **Note:** section 9 and the final section reference
> `public/staticwebapp.config.json`. That file has been removed from the repo,
> since it does nothing on GitHub Pages and was being served publicly. Recreate
> it from the contents listed at the end of this guide if you resume the Azure
> path.

---

## 0. What you are about to build

```
  You push to GitHub main
            │
            ▼
  GitHub Actions runs  ──►  npm ci && npm run build  ──►  dist/
            │
            ▼
  Azure/static-web-apps-deploy uploads dist/ to Azure
            │
            ▼
  https://<random-name>.azurestaticapps.net   ← your live site
```

Azure Static Web Apps is built for exactly this: a static frontend (HTML, CSS,
JS) served from a global CDN. Your portfolio is a Vite + React app that compiles
down to static files, so it is a perfect fit.

**Cost on the Free plan: R0 / $0.** The Free plan is not billed at all — it does
not consume your student credit. You get 100 GB bandwidth per month, 250 MB of
app storage, 2 custom domains and up to 10 apps per subscription. There is no
overage billing on Free; if you exceed a quota the app is throttled rather than
charged. See the quota table linked at the bottom.

---

## 1. Understand the one change that was needed in the code

This is worth understanding before you click anything, because it is the single
most common reason a Vite site deploys to Azure and shows a **blank white page**.

A host may serve your site from a *subdirectory*. GitHub Pages did, while this
repo was a project site:

```
https://jabulile1704.github.io/JM-Mashibini-Website-Portfolio-/
                                └──────── subdirectory ────────┘
```

The repo has since been renamed to `Jabulile1704.github.io`, making it a **user
site**, which Pages serves from the domain root — the same way Azure Static Web
Apps serves it:

```
https://something-123.azurestaticapps.net/
```

Vite bakes the asset paths into `index.html` at build time, controlled by the
`base` option. The old config hardcoded the Pages subdirectory, so an Azure
build would have produced:

```html
<script src="/JM-Mashibini-Website-Portfolio-/assets/index-abc.js">
```

...and Azure would have returned 404 for that path. White page, no error on
screen, only a failed request in the browser console.

`vite.config.js` now reads the base from an environment variable:

```js
base: process.env.BASE_PATH || '/',
```

- **Azure**, and **Pages as a user site**, set nothing → base is `/` ✅
- **A subdirectory host** sets `BASE_PATH=/<repo-name>/` ✅

Both deployments keep working. You can verify this yourself at any time:

```bash
npm run build && grep assets dist/index.html
```

---

## 2. Merge the deploy config into `main`

Azure will build from `main`, so the config has to be there **before** you
connect Azure. If you connect first, your very first build will produce the
broken white page described above.

```bash
git switch main
git merge deploy/azure-static-web-apps
git push origin main
```

---

## 3. Create the Static Web App in the Azure Portal

1. Go to **https://portal.azure.com** and sign in with your student account.

2. Confirm you are on the right subscription. Click your avatar (top right) →
   **Switch directory** if you have more than one. Then search
   **Subscriptions** and check that **Azure for Students** is listed and
   **Active**. Note the remaining credit while you are there.

3. In the top search bar type **Static Web Apps** and open it.

4. Click **+ Create**.

5. Fill in the **Basics** tab:

   | Field | Value | Why |
   |---|---|---|
   | Subscription | `Azure for Students` | Your student subscription |
   | Resource group | **Create new** → `rg-portfolio` | A folder that groups related Azure resources. Deleting it deletes everything inside, which makes cleanup easy. |
   | Name | `jm-mashibini-portfolio` | Becomes part of the default URL |
   | Plan type | **Free** | $0, no credit used |
   | Region | pick the closest offered, e.g. **West Europe** | See the note below |
   | Source | **GitHub** | This is the GitHub connection you asked for |

   **About the region:** the dropdown only lists regions where SWA runs
   (typically West US 2, Central US, East US 2, West Europe, East Asia). There
   is no South Africa region for Static Web Apps. This matters less than it
   sounds — the region only holds the build/management infrastructure, while
   your actual files are served from Azure's **global CDN**, so visitors in
   South Africa are served from a nearby edge node regardless. If a region is
   greyed out or you get a policy error, see Troubleshooting.

6. Click **Sign in with GitHub** and authorise Azure. Then select:

   | Field | Value |
   |---|---|
   | Organization | `Jabulile1704` |
   | Repository | `Jabulile1704.github.io` |
   | Branch | `main` |

7. On **Build Details**, this is the part that matters most:

   | Field | Value |
   |---|---|
   | Build Presets | **React** |
   | App location | `/` |
   | Api location | *(leave empty)* |
   | Output location | `dist` |

   `App location` is where your `package.json` lives (repo root). `Output
   location` is the folder Vite writes to, **relative to App location** — for
   Vite that is `dist`, not `build`. Picking the React preset may prefill
   `build`; change it to `dist`.

8. **Review + create** → **Create**. Deployment takes about a minute.

---

## 4. What Azure just did to your repo

This is the "connected to GitHub" part, and it happens automatically:

1. Azure generated a workflow file and **committed it to your `main` branch**:
   `.github/workflows/azure-static-web-apps-<random-words>.yml`
2. Azure added a repository secret called
   `AZURE_STATIC_WEB_APPS_API_TOKEN_<RANDOM_WORDS>` — the deployment token that
   lets GitHub Actions push to your Azure app.
3. That commit immediately triggered the first deployment.

Pull it down so your local clone matches:

```bash
git pull origin main
```

---

## 5. Watch the first deployment

Go to your repo → **Actions** tab. You will see a run called
**Azure Static Web Apps CI/CD**. Open it and watch the `Build and Deploy Job`.

Or from the terminal:

```bash
gh run watch
```

Green tick = deployed.

---

## 6. Open your live site

In the Azure Portal, open your Static Web App. The **URL** on the Overview page
is your live site, something like:

```
https://polite-sand-0a1b2c3d4.6.azurestaticapps.net
```

Check these specifically:

- The transit-map page renders (not a white page)
- Your photo `jabulile.jpg` loads
- The CV PDF link downloads
- Open DevTools → Console and confirm there are no 404s on `/assets/...`

---

## 7. Make the pipeline reproducible (recommended next step)

The workflow Azure generated builds your app on Azure's own build service
(Oryx), which chooses a Node version for you. Your `package.json` asks for
`node >=20.19.0`, and Oryx resolves ranges inconsistently — so a future Oryx
change could alter your Node version without you touching anything.

Building in GitHub Actions instead gives you an explicit, pinned Node version
and the exact same command you run locally. Open the generated
`.github/workflows/azure-static-web-apps-<random-words>.yml` and change the
`build_and_deploy_job` steps to:

```yaml
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: true
          lfs: false

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Build
        run: |
          npm ci
          npm run build

      - name: Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_<RANDOM_WORDS> }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "dist"
          api_location: ""
          output_location: ""
          skip_app_build: true
```

Three things changed, and they go together:

- `skip_app_build: true` — do not run Oryx, the files are already built
- `app_location: "dist"` — now points at the **built output**, not the source
- `output_location: ""` — empty, because `app_location` is already the output

Keep the existing `azure_static_web_apps_api_token` line exactly as Azure
generated it — the `<RANDOM_WORDS>` suffix is specific to your app. Leave the
`close_pull_request_job` at the bottom of the file untouched.

---

## 8. Free preview environments for pull requests

The generated workflow already includes this, and it is genuinely useful. Open a
pull request against `main` and Azure builds it to a separate temporary URL,
posting the link as a comment on the PR. You review the real site before
merging. Closing the PR tears the environment down — that is what
`close_pull_request_job` is for. The Free plan allows 3 of these at a time.

---

## 9. Optional: a custom domain

Free plan allows 2 custom domains. In your Static Web App → **Custom domains**
→ **+ Add**, then create the DNS record Azure shows you at your registrar
(`CNAME` for `www`, or `TXT` + `ALIAS`/`A` for a root domain). HTTPS
certificates are issued and renewed by Azure automatically, at no cost.

---

## 10. Retiring GitHub Pages (only when you are ready)

Both deployments work right now, which is deliberate — keep Pages as a fallback
until you trust the Azure URL. When you want Azure to be the only home:

```bash
git rm .github/workflows/deploy-github-pages.yml
git commit -m "Retire GitHub Pages workflow in favour of Azure Static Web Apps"
git push origin main
```

Then in your repo **Settings → Pages**, set Source to **None**, and delete the
now-unused `gh-pages` branch. Once Pages is gone, `BASE_PATH` is never set and
the `base` option in `vite.config.js` can be simplified back to `'/'`.

---

## Troubleshooting

**Blank white page, 404s on `/assets/...` in the console**
The `base` path is wrong — Azure built with the Pages subdirectory baked in.
Confirm `vite.config.js` uses `process.env.BASE_PATH || '/'` and that the Azure
workflow does **not** set `BASE_PATH`.

**"Failed to find a default file in the app artifacts folder (dist)"**
`output_location` is wrong. For Vite it is `dist`. If you switched to
`skip_app_build: true`, then `app_location` must be `dist` and `output_location`
must be empty.

**Region is greyed out, or "RequestDisallowedByPolicy" on create**
Azure for Students subscriptions sometimes carry a policy restricting regions.
Try a different region from the dropdown. If all fail, check **Subscriptions →
Azure for Students → Policies** to see which regions are permitted, and pick
one that is also offered by Static Web Apps.

**"Quota exceeded" / cannot create the app**
Free plan allows 10 Static Web Apps per subscription. Delete an unused one, or
delete its whole resource group.

**The Actions run fails with a Node or engine error**
Apply the change in section 7 — it pins Node to 22 explicitly instead of
letting Oryx guess from your `engines` range.

**Deployment succeeds but the site is stale**
Azure's CDN caches aggressively. Hard-reload with `Cmd+Shift+R`. The
`staticwebapp.config.json` in `public/` sets immutable caching only for
`/assets/*`, whose filenames are content-hashed, so a new build always produces
new filenames.

---

## What the extra config file does

`public/staticwebapp.config.json` is copied into `dist/` by Vite at build time,
which puts it at the root of what Azure serves — where Azure looks for it.

- `navigationFallback` — serves `index.html` for unknown paths, so client-side
  routes work if you ever add a router. `exclude` keeps real asset requests
  returning a genuine 404 instead of HTML.
- `mimeTypes` — makes sure the CV serves as `application/pdf`.
- `globalHeaders` — two cheap security headers.
- `routes` — long-lived caching for the content-hashed files in `/assets/`.

---

## Reference

- [Azure Static Web Apps quotas](https://learn.microsoft.com/azure/static-web-apps/quotas)
- [Build configuration for Azure Static Web Apps](https://learn.microsoft.com/azure/static-web-apps/build-configuration)
- [Configuration file reference](https://learn.microsoft.com/azure/static-web-apps/configuration)
- [Custom domains](https://learn.microsoft.com/azure/static-web-apps/custom-domain)

---

## Appendix: the removed `staticwebapp.config.json`

Recreate this at `public/staticwebapp.config.json` if you resume the Azure
path. Vite copies it from `public/` into `dist/`, which puts it at the root of
what Azure serves — where Azure looks for it.

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/assets/*", "*.{css,js,jpg,jpeg,png,svg,webp,ico,pdf,woff,woff2}"]
  },
  "mimeTypes": {
    ".pdf": "application/pdf",
    ".webmanifest": "application/manifest+json"
  },
  "globalHeaders": {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "routes": [
    {
      "route": "/assets/*",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    }
  ]
}
```

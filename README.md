# LearnAIRight

**Brand (applied 16 Oct 2026): LearnAIRight** — display name "Learn AI Right". A multi-page hub for AI fluency for teams and independent professionals, with practical tips and **real, sourced** success stories. Positioning is site-perspective and workflow-first: repeatable workflows with measured outcomes, not hype.

**Palette (documented choice):** keeping the existing warm charcoal (`#0f0e0c`) + amber (`#f59e0b`/amber-400) palette, now re-labelled as LearnAIRight's palette — amber = the "right/correct" highlight/check accent on charcoal, clean and readable. No logo/typeface lockup yet — final logo to be confirmed. The folder on disk retains its internal name (unchanged; `package.json` name is `learnairight`).

> Independent guide — not affiliated with or endorsed by xAI/Grok. Do not use "Grok"/"Grokbot" in the domain or logo.

> **Status: READY WHEN YOU ARE.** Built and verified locally. **Not deployed, not public, no real payments, no emails sent.** Sponsor + premium flows are intake/mock until launch is approved and real keys are added.

## Pages
| Route | What it is |
|---|---|
| `/` | Home — hero, sponsor placeholder, featured tips/stories, premium CTA |
| `/tips` | Free AI tips (prompting, workflows, real-world use) + premium teasers |
| `/stories` | 11 curated success stories, each with summary, outcome, takeaway, and source link |
| `/about` | About — positioning, method, and standards |
| `/pricing` | Free vs Premium + sponsor slots (placeholder/example) + sponsor inquiry form |
| `/premium` | Gated premium guides (Grokbot workflows, prompt library, automation blueprints) |
| `/admin/sponsors` | **Admin (password-gated)** — review sponsor requests, all `pending_approval` |
| `/modules` | Training modules ladder (see below) — free Module 1, 7-day trial, Single Pass, All-Access |
| `/modules/[slug]` | One module: video placeholder(s), written guide, downloadable exercise (gated server-side) |
| `/signup` / `/login` | Learner accounts (local/mock, salted scrypt password hashes) |
| `/admin/subscribers` | **Admin (password-gated)** — trial/purchase records from `data/subscribers.json` |
| `/admin/login` | Admin sign-in (password → httpOnly session cookie, 7 days) |
| `/checkout/success`, `/checkout/cancel` | Post-checkout pages |
| `POST /api/sponsors` | Stores sponsor inquiry in `data/sponsors.json` |
| `POST /api/checkout` | Stripe Checkout session, or mock redirect when keys absent |
| `POST /api/stripe/webhook` | Webhook stub (verifies signature only when keys configured; TODO entitlement logic marked) |
| `POST /api/premium/mock-activate` | Dev-only mock premium cookie |

## Run locally
```bash
cd /workspace/tru-ai-hub   # internal folder name unchanged; brand/package name is learnairight
npm install
cp .env.example .env.local   # optional in mock mode; fill later for Stripe test mode
npm run dev                  # http://localhost:3000
npm run build && npm start   # production build check
```
No env vars are required to run in mock mode — except `ADMIN_PASSWORD` if you want to open the admin area (see Admin auth below).

## Success stories — sources (verified Oct 2026, do not fabricate additions)
All 11 live in `src/data/stories.ts` with source name/date/URL on each card:
1. Klarna AI assistant — https://www.klarna.com/international/press/klarna-ai-assistant-handles-two-thirds-of-customer-service-chats-in-its-first-month/
2. GitHub Copilot 55.8% study — https://arxiv.org/html/2302.06590v1
3. Morgan Stanley — https://openai.com/index/morgan-stanley/
4. Reddit CRM builder — https://www.reddit.com/r/ChatGPT/comments/1gf7i0h/i_am_in_awe_at_what_i_have_been_able_to/
5. Reddit "saved my business" — https://www.reddit.com/r/ChatGPT/comments/1ghomac/chat_gpt_saved_my_business/
6. Reddit 20 hrs/week — https://www.reddit.com/r/aipromptprogramming/comments/1k2sbw8/how_i_saved_20_hours_a_week_in_my_business_using/
7. Reddit n8n freelancer — https://www.reddit.com/r/automation/comments/1jsbaks/i_automated_most_of_my_freelance_workflow_with/
8. Beach Cities Builder — https://theaismallbusiness.com/use-cases/automate-subcontractor-invoice-filing-and-rebuild-local-seo-pages-with-chatgpt/
9. Dream Code Labs week experiment — https://www.dreamcodelabs.com/blog/i-asked-ai-to-run-my-business-for-a-week
10. Gary Sheng blogging — https://wiki.garysheng.com/docs/guides/writing/the-ai-assisted-art-of-blogging-gary-shengs-efficient-workflow-explained
11. Enid HS / Khanmigo — https://blog.khanacademy.org/how-enid-high-school-transformed-their-math-classrooms-with-ai-a-case-study/


## Training modules (added Oct 2026 — local/mock, NOT deployed)
Ladder in `src/data/modules.ts` (edit titles/prices/content there). Placeholder pricing — to be confirmed:
1. **AI for Beginners** — FREE, open to everyone (no account needed), 2 video slots.
2. **Prompting Like a Manager** — paid; also the free-trial module (see below).
3. **AI Workflows for Your Shop / Business** — paid.
4. **Automate the Boring Stuff** — paid.
5. **Grokbot Deep Dive** — paid (independent guide, not affiliated with xAI).

- **Single Module Pass ~$29** (placeholder): unlocks one chosen paid module. **All-Access Bundle ~$99** (placeholder): all modules **plus Premium** (`/premium` accepts bundle accounts as well as the legacy mock premium cookie).
- Each module page has clearly marked **video placeholder slots** ("Video coming soon — embed URL to be configured" — no fake embeds), a real written guide, and a **downloadable Markdown exercise worksheet** served by `/api/modules/[slug]/download`, which re-checks access server-side on every request (403 when locked).
- Locked paid modules show outcomes + a greyed-out lesson list (title + lock + **"Included in All-Access · or $29 Single Pass"** only) + buy/trial CTAs — never guide bodies, steps, or the exercise (verified by grepping the locked response for guide text).
- **Conversion tweaks (Oct 2026):** Module 1 Lesson 1 is **instant — no account** (first video slot + first guide section + in-page exercise start). Only (a) the Module 1 exercise **download** (`/api/modules/[slug]/download` returns 401 `needsAuth` for anonymous on the free module; any logged-in account may download), (b) **saved progress/prompts**, and (c) the Module 2 trial require a free account. No credit card anywhere until (mock) purchase.
- **First-win checklist** on Module 1 (`FirstWinChecklist`, ~10–15 min, 5 steps): watch Lesson 1 → copy the starter prompt (`starterPrompt` in `modules.ts`) → adapt it in-page → **save it to the account** → Module 2 trial CTA. Anonymous ticks/draft persist only in `localStorage`; logged-in saves go server-side via `POST /api/modules/progress` into `user.firstWin` in `data/users.json` and show under **"My saved prompts"** on `/modules`, ending in the "You saved your first working prompt" state.

### Accounts, trial, and mock purchases (no real payments)
- `/signup` + `/login`: email + password (min 8 chars), hashed with Node `crypto.scrypt` + random salt (never plaintext), stored in `data/users.json` (**gitignored — contains emails**). Session = `learnairight_user` httpOnly cookie, HMAC-signed like the admin cookie (secret: optional `USER_SESSION_SECRET`, falling back to `ADMIN_PASSWORD`, then a local-dev-only constant — set a real one before launch).
- **Free trial:** signed-in users hit "Start your free trial" → `POST /api/trial/start` sets `trialEndsAt` = now + 7 days and unlocks **Module 2 only**. No account = Module 1 only.
- **Mock checkout:** `POST /api/modules/purchase` records entitlements on the user (`entitlements[]` for single, `bundle: true` for all-access) and appends a row to `data/subscribers.json` (**gitignored**). The UI labels this "Mock checkout — no card, no charge" everywhere. If Stripe keys are ever present this route currently **refuses (501)** rather than faking a charge — wire real Stripe Products there first (suggested names: "LearnAIRight Single Module Pass", "LearnAIRight All-Access Bundle") and grant entitlements from the webhook (TODO marked in the route).
- **Admin:** `/admin/subscribers` (same `ADMIN_PASSWORD` gate as sponsors; links between the two admin pages) lists email, plan (`trial` / `single:<slug>` / `bundle` / `premium`), mock amount, status, start/expiry. Empty state until someone signs up. **These JSON files must move to a real database before launch** (same note as sponsors).
- Decisions still needed: final module prices ($29/$99 placeholders), final module titles/order, real video URLs for every placeholder slot, Stripe product names/prices, and a real DB + email/password-reset flow before public launch.

## Sponsors (intake/display only — no charging)
- Form on `/pricing` → `POST /api/sponsors` → appended to `data/sponsors.json` with `status: "pending_approval"`.
- `/admin/sponsors` lists requests and is **password-gated** (see Admin auth below). Anyone without the session is redirected to `/admin/login`, and `GET /api/sponsors` returns 401 unauthenticated.
- Placeholder/example sponsor slots are clearly labelled AVAILABLE/EXAMPLE. Nothing auto-publishes; the site operator must manually approve and add a sponsor to the site.

## Admin auth (sponsor admin)

- **Env var:** `ADMIN_PASSWORD` — the only secret needed. Never hardcode it; never commit a real value.
- **How it works:** `src/proxy.ts` (Next.js 16 proxy, formerly middleware) redirects unauthenticated `/admin/*` requests to `/admin/login`. Submitting the password to `POST /api/admin/login` checks it server-side (timing-safe compare) and sets an `learnairight_admin` **httpOnly** cookie containing an HMAC-SHA256-signed expiry token derived from `ADMIN_PASSWORD` (the cookie never contains the password). The admin page and `GET /api/sponsors` re-verify that cookie server-side before any sponsor data is read. `POST /api/admin/logout` clears it. Sessions last 7 days.
- **Fail closed:** if `ADMIN_PASSWORD` is unset, `/admin/login` shows "Admin not configured", `/admin/sponsors` shows no data, and `GET /api/sponsors` returns 503. Sponsor emails cannot leak.
- **Local dev:** put `ADMIN_PASSWORD=<strong-random>` in `.env.local` (gitignored; generate with `openssl rand -base64 32`), restart `npm run dev`, then visit http://localhost:3000/admin/sponsors and sign in.
- **Production (Vercel):** set `ADMIN_PASSWORD` in Project → Settings → Environment Variables (Production) **before** real traffic, then redeploy. This is a simple single-password gate for the stub stage — upgrade to real user auth (e.g. NextAuth) before scaling.

## Premium + Stripe (placeholder/mock until keys are added)
- `src/lib/stripe.ts` reads `STRIPE_SECRET_KEY` / `STRIPE_PRICE_ID`. `sk_test_placeholder…` values are treated as **not configured** → mock mode.
- Mock mode: checkout button → `/checkout/success?mock=1`; "mock unlock" sets an `learnairight_premium` httpOnly cookie so gated content can be previewed. **No money moves.**
- To go live (site operator only): create Stripe account + recurring Product/Price, put TEST keys in `.env.local`, `stripe listen --forward-to localhost:3000/api/stripe/webhook`, test, then implement webhook entitlement (replace cookie with DB-backed user entitlements — TODOs marked in `src/app/api/stripe/webhook/route.ts`), add real auth, then swap to live keys.

## Deploy (only on explicit approval — do NOT deploy before)
1. Push to a private GitHub repo. 2. Import into Vercel, framework = Next.js. 3. Set env vars from `.env.example` in Vercel (production). 4. Add custom domain in Vercel + DNS. 5. Point Stripe webhook to `https://YOURDOMAIN/api/stripe/webhook`. 6. Set `ADMIN_PASSWORD` in Vercel env vars (gates `/admin/*`; see Admin auth). Managed DB (e.g. Postgres/Supabase) should replace `data/sponsors.json`, `data/users.json`, and `data/subscribers.json` before real traffic.

## Decisions still needed
- **Branding:** name is **LearnAIRight / "Learn AI Right"** (applied Oct 2026). Still to decide: final logo/typeface. Colors: charcoal + amber retained as the LearnAIRight palette (see top of README). Domain/social handles NOT yet registered; register learnairight.com (+ .ai defensive) and claim handles only on approval.
- **Pricing:** Premium $/mo & $/yr (currently $9/$79 placeholders) and sponsor rates (currently $150/$75/$250 placeholders).
- **Domain + hosting:** domain choice; Vercel assumed.
- **Stripe:** when to create account, test vs live keys, tax/refund policy.
- **Admin/auth & database:** single-password admin gate is implemented (see Admin auth); decide later whether to upgrade to full user auth. Managed DB choice still needed before public launch; legal pages (privacy/terms) still needed.

## File structure
```
src/app/{page,tips,stories,about,pricing,premium,modules,modules/[slug],signup,login,admin/{login,sponsors,subscribers},checkout/{success,cancel},api/{sponsors,admin/{login,logout},auth/{signup,login,logout},trial/start,modules/{purchase,progress,[slug]/download},checkout,stripe/webhook,premium/mock-activate}}
src/components/{Nav,Footer,SponsorForm,CheckoutButton,MockUnlock,ModuleActions,AuthForm,FirstWinChecklist}.tsx
src/data/{stories,tips,modules}.ts   src/lib/{stripe,sponsors,admin-auth,users,user-auth}.ts   src/proxy.ts   data/{sponsors,users,subscribers}.json (all gitignored)   .env.example
```

## Push to GitHub (one-time setup)

This repo has been pushed to https://github.com/trumanlively-coder/learnairight (public, `main`). The instructions below are kept for reference / a fresh machine.

1. Create a free account at https://github.com/signup (skip this if you already have one).
2. In a terminal on this machine / in this project folder, log in once:
   ```bash
   gh auth login   # choose GitHub.com → HTTPS → login with a web browser
   ```
3. Create the repo and push (run from the project folder):
   ```bash
   gh repo create learnairight --public --source=. --remote=origin --push
   ```
   Alternative if `gh` is unavailable: create an empty repo named `learnairight` at https://github.com/new (no README/gitignore — this project already has them), then run:
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/learnairight.git
   git push -u origin main
   ```
4. After that, normal updates are just: `git add . && git commit -m "your message" && git push`

Do not deploy to Vercel yet — that is a separate, later step requiring explicit approval.

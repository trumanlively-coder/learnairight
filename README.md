# LearnAIRight — Learn AI Right, with Tru

**Brand (applied 16 Oct 2026): LearnAIRight** — display name "Learn AI Right — with Tru". A multi-page hub by **Tru** teaching people to use AI correctly — especially Grokbot — with practical tips and **real, sourced** success stories. Tru is the person/face behind it: a Las Vegas barber who builds AI tools — that's his story (see About), not the master brand, so the brand can reach a national/international audience.

**Palette (documented choice):** keeping the existing warm charcoal (`#0f0e0c`) + amber (`#f59e0b`/amber-400) palette, now re-labelled as LearnAIRight's palette — amber = the "right/correct" highlight/check accent on charcoal, clean and readable. No logo/typeface lockup yet — Tru to confirm final logo. Folder on disk stays `/workspace/tru-ai-hub` (internal only; `package.json` name is now `learnairight`).

> Independent guide — not affiliated with or endorsed by xAI/Grok. Do not use "Grok"/"Grokbot" in the domain or logo.

> **Status: READY WHEN YOU ARE.** Built and verified locally. **Not deployed, not public, no real payments, no emails sent.** Sponsor + premium flows are intake/mock until Tru approves launch and adds real keys.

## Pages
| Route | What it is |
|---|---|
| `/` | Home — hero, sponsor placeholder, featured tips/stories, premium CTA |
| `/tips` | Free AI tips (prompting, workflows, real-world use) + premium teasers |
| `/stories` | 12 curated success stories, each with summary, outcome, takeaway, and source link |
| `/about` | About Tru (placeholder bio — replace with real story/photo/shop details) |
| `/pricing` | Free vs Premium + sponsor slots (placeholder/example) + sponsor inquiry form |
| `/premium` | Gated premium guides (Grokbot workflows, prompt library, automation blueprints) |
| `/admin/sponsors` | **Admin stub (no auth yet!)** — review sponsor requests, all `pending_approval` |
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
No env vars are required to run in mock mode.

## Success stories — sources (verified Oct 2026, do not fabricate additions)
All 12 live in `src/data/stories.ts` with source name/date/URL on each card:
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
12. Barber Station (Claire Lawrence) — https://www.sstaffs.gov.uk/news/2025/local-barber-shop-owner-thrives-business-growth-support

## Sponsors (intake/display only — no charging)
- Form on `/pricing` → `POST /api/sponsors` → appended to `data/sponsors.json` with `status: "pending_approval"`.
- `/admin/sponsors` lists requests. **Auth is a stub** — before launch add real protection (password/session/NextAuth/Vercel) or anyone with the URL could view emails.
- Placeholder/example sponsor slots are clearly labelled AVAILABLE/EXAMPLE. Nothing auto-publishes; Tru must manually approve and add a sponsor to the site.

## Premium + Stripe (placeholder/mock until Tru adds keys)
- `src/lib/stripe.ts` reads `STRIPE_SECRET_KEY` / `STRIPE_PRICE_ID`. `sk_test_placeholder…` values are treated as **not configured** → mock mode.
- Mock mode: checkout button → `/checkout/success?mock=1`; "mock unlock" sets an `learnairight_premium` httpOnly cookie so Tru can preview gated content. **No money moves.**
- To go live (Tru only): create Stripe account + recurring Product/Price, put TEST keys in `.env.local`, `stripe listen --forward-to localhost:3000/api/stripe/webhook`, test, then implement webhook entitlement (replace cookie with DB-backed user entitlements — TODOs marked in `src/app/api/stripe/webhook/route.ts`), add real auth, then swap to live keys.

## Deploy (when Tru explicitly approves — do NOT deploy before)
1. Push to a private GitHub repo. 2. Import into Vercel, framework = Next.js. 3. Set env vars from `.env.example` in Vercel (production). 4. Add custom domain in Vercel + DNS. 5. Point Stripe webhook to `https://YOURDOMAIN/api/stripe/webhook`. 6. Protect `/admin/*`. Managed DB (e.g. Postgres/Supabase) should replace `data/sponsors.json` before real traffic.

## Decisions Tru needs to make
- **Branding:** name is now **LearnAIRight / "Learn AI Right — with Tru"** (applied Oct 2026). Still to decide: final logo/typeface, Tru's photo, shop name & booking link. Colors: charcoal + amber retained as the LearnAIRight palette (see top of README). Domain/social handles NOT yet registered — see availability research reported to Tru 16 Oct 2026; register learnairight.com (+ .ai defensive) and claim handles only on Tru's approval.
- **Pricing:** Premium $/mo & $/yr (currently $9/$79 placeholders) and sponsor rates (currently $150/$75/$250 placeholders).
- **Domain + hosting:** domain choice; Vercel assumed.
- **Stripe:** when to create account, test vs live keys, tax/refund policy.
- **Admin/auth & database** choice before public launch; legal pages (privacy/terms) still needed.

## File structure
```
src/app/{page,tips,stories,about,pricing,premium,admin/sponsors,checkout/{success,cancel},api/{sponsors,checkout,stripe/webhook,premium/mock-activate}}
src/components/{Nav,Footer,SponsorForm,CheckoutButton,MockUnlock}.tsx
src/data/{stories,tips}.ts   src/lib/{stripe,sponsors}.ts   data/sponsors.json   .env.example
```

## Push to GitHub (Tru — one-time, after you create your GitHub account)

This repo is initialized locally with an initial commit, but **not pushed yet** — no GitHub account was logged in on this machine, and creating an account needs your email and a password only you should know.

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

Do not deploy to Vercel yet — that's a separate, later step after Tru approves it.

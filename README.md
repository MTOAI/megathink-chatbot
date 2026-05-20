# MegaThink Chatbot 🤖

> AI-powered Course & Tutor Finder for [megathinkonline.com](https://www.megathinkonline.com)  
> **Stack:** Gemini 2.0 Flash · Next.js 14 · Vercel · GitHub Actions · Zero cost

---

## Quick Start (5 minutes)

```bash
git clone https://github.com/YOUR_USERNAME/megathink-chatbot.git
cd megathink-chatbot
npm install
cp .env.local.example .env.local
# → Add your GEMINI_API_KEY inside .env.local
npm run dev
# Open http://localhost:3000
```

---

## Project Structure

```
megathink-chatbot/
├── app/
│   ├── api/chat/route.ts    ← Gemini AI chat endpoint
│   ├── widget/page.tsx      ← Embeddable chat page (iframe target)
│   └── layout.tsx
├── components/
│   └── ChatWidget.tsx       ← Full chat UI component
├── data/
│   ├── tutors.json          ← Tutor database (from your Excel)
│   └── site.json            ← Crawled website content
├── scripts/
│   ├── convert_excel.py     ← Excel → JSON converter
│   └── crawl_site.py        ← Website content crawler
├── public/
│   └── embed.js             ← Drop-in WordPress embed script
├── .github/workflows/
│   └── crawl.yml            ← Weekly auto-crawl GitHub Action
├── vercel.json              ← CORS + iframe headers
└── .env.local.example       ← API key template
```

---

## Environment Variables

| Variable | Where to get it |
|---|---|
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) → Get API key (free) |

**Set in Vercel:** Project → Settings → Environment Variables → Add `GEMINI_API_KEY`

---

## Updating Tutor Data

When your tutor list changes:

```bash
pip install pandas openpyxl
python scripts/convert_excel.py path/to/your_tutors.xlsx
git add data/tutors.json
git commit -m "Update tutor list"
git push   # Vercel auto-deploys in ~30s
```

Your Excel columns should be:
`Name | Subjects | Curriculum | Level | Languages | Availability | Experience | Bio`

---

## Refreshing Site Content

```bash
pip install requests beautifulsoup4
python scripts/crawl_site.py
git add data/site.json && git commit -m "Refresh site data" && git push
```

Or let the GitHub Action do it every Monday automatically (already configured).

---

## Embedding on WordPress

### Option 1 — Auto floating bubble (recommended)

Add **one line** before `</body>` (Appearance → Theme Editor → footer.php, or use the *Insert Headers and Footers* plugin):

```html
<script
  src="https://YOUR-PROJECT.vercel.app/embed.js"
  data-chatbot-url="https://YOUR-PROJECT.vercel.app/widget"
  defer
></script>
```

### Option 2 — Inline iframe on a page

```html
<iframe
  src="https://YOUR-PROJECT.vercel.app/widget"
  width="100%"
  height="600"
  style="border:none;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.1);"
  title="Course & Tutor Finder"
></iframe>
```

---

## Deployment (Vercel)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Add environment variable: `GEMINI_API_KEY`
4. Click Deploy — done ✅

Every `git push` to `main` auto-deploys.

---

## Cost

| Service | Free Tier | Usage |
|---|---|---|
| Gemini 2.0 Flash | 1,500 req/day, 1M TPM | ✅ Well within limits |
| Vercel Hobby | 100 GB bandwidth/month | ✅ ~0.01 MB/session |
| GitHub | Unlimited repos + 2,000 Actions min/month | ✅ |
| **Total** | | **$0/month** |

---

## License

MIT — free to use and modify for Mega Think Online.

# Deploying Kai Ruchi

Three pieces have to live somewhere: the **database**, the **API**, and the
**frontend**. All three have a free tier that is enough for a college project.

---

## 1. Where to put the database

This is the part with no obvious answer, so here are the real options as of now.

| Host | Free tier | Catch | Verdict |
|---|---|---|---|
| **[Neon](https://neon.tech)** | 0.5 GB, always-on branch, no card | Scales to zero after 5 min idle — first query after a nap takes ~1s | **Use this.** Purpose-built serverless Postgres, one-click Vercel integration |
| [Supabase](https://supabase.com) | 500 MB, plus auth/storage you won't need | Project **pauses after 7 days of inactivity** and must be manually resumed — it will be paused on demo day | Fine if you use it weekly |
| [Railway](https://railway.app) | $5 one-time trial credit | Not a free tier; runs out | Only for a short-lived demo |
| [Render](https://render.com) | Free Postgres | **Deleted after 30 days.** | Avoid — your project will outlive it |
| [Aiven](https://aiven.io) | 5 GB free Postgres | Slower cold region choices | Reasonable backup option |

### Setting up Neon

1. Sign in at [neon.tech](https://neon.tech) with GitHub.
2. **Create project** → name it `kai-ruchi`, pick the region closest to you
   (`ap-southeast-1` for India).
3. Copy the connection string from the dashboard. It looks like:

   ```
   postgresql://user:pass@ep-cool-name-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

4. SQLAlchemy needs the driver named explicitly, so change the scheme to
   `postgresql+psycopg2://`:

   ```
   postgresql+psycopg2://user:pass@ep-cool-name-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

5. Point your local backend at it and load the schema and catalogue **once**:

   ```bash
   cd backend
   # temporarily set DATABASE_URL in .env to the Neon URL
   .venv/Scripts/python -m alembic upgrade head
   .venv/Scripts/python -m app.seed
   ```

   Migrations and seeding always run from your machine — there is no build step on
   the host that does it for you.

---

## 2. Deploy the API

The backend runs on Vercel's Python runtime (`backend/api/index.py` is the
entrypoint, `backend/vercel.json` routes everything to it).

```bash
cd backend
vercel --prod
```

When prompted, keep the project separate from the frontend — name it something like
`kai-ruchi-api`.

Then set its environment variables:

```bash
vercel env add DATABASE_URL production
vercel env add SECRET_KEY production
vercel env add CORS_ORIGINS production
```

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Neon URL, with `postgresql+psycopg2://` |
| `SECRET_KEY` | `python -c "import secrets; print(secrets.token_urlsafe(48))"` |
| `CORS_ORIGINS` | Your frontend URL, e.g. `https://kai-ruchi.vercel.app` |
| `ENVIRONMENT` | `production` |
| `AUTO_FULFILMENT` | `true` (leave on so tracking moves during a demo) |

Redeploy after adding them (`vercel --prod`), then confirm:

```bash
curl https://kai-ruchi-api.vercel.app/health
```

You want `{"status":"ok","database":"connected", ...}`.

> **Alternative:** if you would rather run a normal long-lived server,
> [Render](https://render.com) works with build command
> `pip install -r requirements.txt` and start command
> `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Free web services sleep after
> 15 minutes and take ~30s to wake, so the first page load in a demo will be slow.

---

## 3. Deploy the frontend

```bash
cd frontend
vercel --prod
```

Set one variable:

```bash
vercel env add NEXT_PUBLIC_API_URL production
```

…with the API URL from step 2 (no trailing slash):

```
https://kai-ruchi-api.vercel.app
```

Redeploy so the build picks it up. `NEXT_PUBLIC_*` variables are baked in at build
time, so **adding the variable is not enough on its own — you must redeploy.**

---

## 4. Check it end to end

1. Open the frontend URL. The home page should show real products, not the
   "the kitchen isn't answering" panel.
2. Sign in with `meera@example.com` / `kairuchi123`.
3. Add something to the cart, check out, pay on the demo sheet.
4. Open the order and watch the tracking timeline advance over the next half hour.

---

## Troubleshooting

**"The kitchen isn't answering"** — the frontend cannot reach the API. Check
`NEXT_PUBLIC_API_URL` is set *and* that you redeployed afterwards.

**CORS errors in the console** — add your exact frontend origin to `CORS_ORIGINS` on
the API and redeploy it. Any `*.vercel.app` preview URL is already allowed by a regex
in `main.py`.

**`/health` says `database: unavailable`** — usually the scheme. It must be
`postgresql+psycopg2://`, not `postgres://`, and Neon requires `?sslmode=require`.

**Products are missing but `/health` is fine** — the schema exists but the seed never
ran. Point your local `.env` at the production database and run
`python -m app.seed` once.

**Sessions drop after a redeploy** — `SECRET_KEY` changed, which invalidates every
issued JWT. Set it once as a real environment variable rather than letting the
default apply.

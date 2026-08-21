# Kai Ruchi

**கை ருசி · ಕೈ ರುಚಿ — "hand-taste."** The South Indian word for why the same recipe
tastes different depending on whose hands made it.

A full-stack e-commerce store for a homemade South Indian food business — masalas,
sun-cured pickles, overnight-fermented batters, small-batch snacks and made-to-order
sweets. Built as a college mini project.

| | |
|---|---|
| **Frontend** | Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Lenis |
| **Backend** | FastAPI · SQLAlchemy 2 · Pydantic v2 |
| **Database** | PostgreSQL 16, migrated with Alembic |
| **Auth** | JWT (HS256) + bcrypt |
| **Payments** | Simulated gateway (see [Payments](#payments-are-a-simulation)) |
| **Media** | Product photography and the hero film generated with Higgsfield |

---

## Everything it does

**Storefront** — home page with a video hero, five category shelves, bestsellers,
a "how it's made" sequence, and verified-purchase reviews.

**Catalogue** — 14 products across 5 categories. Filter by shelf, heat level, diet
and stock; sort six ways; paginate. Full-text search with type-ahead (`⌘K`).

**Product pages** — gallery, chilli heat meter, veg/non-veg mark, stock state,
ingredient list, shelf life, pairing note, reviews with a rating histogram, and
related products.

**Cart** — works signed-out (guest token) and signed-in. Signing in merges the
guest cart into the account instead of dropping it. Live free-delivery meter.

**Checkout** — address form with validation, saved-address prefill, choice of
simulated online payment or cash on delivery.

**Orders** — order history, a six-step tracking timeline, and guest tracking by
order number + email. Orders can be cancelled until they ship, which returns the
stock.

**Accounts** — sign up, sign in, edit profile, save and delete delivery addresses.

**Reviews** — one review per person per product, automatically marked *verified*
when that account has actually ordered it. Product ratings recompute on write.

**Contact** — a contact form that persists to the database, plus an FAQ.

### Deliberately not included

There is **no admin dashboard** — it is a mini project. Two things follow from that:

- Order status advances **on a timer** rather than from an ops console. A paid order
  walks itself along the tracking timeline over ~35 minutes so it can be demonstrated
  live. Tune it with `FULFILMENT_MINUTES`, or switch it off with `AUTO_FULFILMENT=false`.
- Catalogue changes are made by editing [`backend/app/seed.py`](backend/app/seed.py)
  and re-running the seed, which updates rows in place.

---

## Payments are a simulation

**No real payment is ever taken and no card details are ever collected.** With no
Razorpay keys configured the API reports `provider: "mock"`, the checkout opens a
clearly-badged demo sheet, and confirming simply tells our own API the order was paid.
There are deliberately **no credential fields anywhere** in that sheet — no card
number, no UPI ID, no bank login. There is also a "simulate a failed payment" button
so the error path can be demonstrated.

The real Razorpay integration is written and wired up (order creation + HMAC signature
verification in [`payment_service.py`](backend/app/services/payment_service.py)); it
only activates if you set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.

---

## Running it locally

You need **Python 3.12**, **Node 20+** and **PostgreSQL 16**.

### 1. Database

```bash
psql -U postgres -c "CREATE DATABASE kairuchi;"
```

### 2. Backend

```bash
cd backend
python -m venv .venv
.venv/Scripts/python -m pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` so `DATABASE_URL` matches your Postgres, and set a real `SECRET_KEY`:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Then create the schema and fill the catalogue:

```bash
.venv/Scripts/python -m alembic upgrade head
.venv/Scripts/python -m app.seed
.venv/Scripts/python -m uvicorn app.main:app --reload --port 8000
```

API docs at <http://127.0.0.1:8000/docs>, health check at `/health`.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>.

### Demo accounts

The seed creates six shoppers who have already written reviews. All share one password:

```
meera@example.com   ·   kairuchi123
```

The sign-in page has a **"Fill in demo credentials"** button so you don't have to type it.

---

## Deploying

See **[DEPLOYMENT.md](DEPLOYMENT.md)** — it covers where to host the database for free,
deploying the frontend and backend to Vercel, and the environment variables each side
needs.

---

## Project layout

```
kai-ruchi/
├── backend/
│   ├── alembic/               Migrations (versions/ holds the schema history)
│   ├── api/index.py           Vercel entrypoint
│   └── app/
│       ├── core/              Settings, DB session, security, DI
│       ├── models/            SQLAlchemy tables
│       ├── schemas/           Pydantic request/response models
│       ├── routers/           auth · users · categories · products · cart
│       │                      orders · payments · reviews · contact
│       ├── services/          Cart totals, fulfilment timeline, payments
│       ├── seed.py            The catalogue, demo users and reviews
│       └── main.py
└── frontend/
    ├── scripts/               Image optimisation
    └── src/
        ├── app/               17 routes (App Router)
        ├── components/
        │   ├── layout/        Nav, footer, preloader, Lenis, masala mesh
        │   ├── ui/            Buttons, hover kit, scroll kit, kolam, fields
        │   ├── product/       Cards, filters, reviews
        │   ├── cart/          Slide-out drawer
        │   ├── checkout/      Demo payment gateway
        │   └── order/         Tracking timeline
        ├── lib/               API client, types, formatting
        └── store/             Zustand stores for auth and cart
```

---

## Notes on the build

**Design.** The palette is taken off a South Indian kitchen shelf — byadgi chilli,
turmeric, banana leaf, temple indigo, jasmine. Surfaces are glass because a pickle jar
is glass and you shop by looking through it; buttons are clay because they should feel
pressable. Behind everything, five spice-coloured blobs drift in a "masala mesh," seen
blurred through every frosted surface. Dividers are **kolam** — the rice-flour pattern
drawn on a South Indian doorstep each morning — which is a real dot grid, so it earns
its place as a structural device rather than decoration.

**Type.** Bricolage Grotesque for display, Instrument Sans for body, Baloo Thambi 2
(designed alongside Tamil script) for the wordmark and accents.

**Motion.** Lenis drives every scroll. On top of it: a page preloader that draws a
kolam, scroll-linked word reveals, a marquee whose direction follows scroll velocity,
sticky stacking cards, parallax bands, magnetic buttons, 3D tilt with a moving
specular highlight, and letter-by-letter flip on nav hover. All of it respects
`prefers-reduced-motion`.

**Data fetching** is client-side on purpose: the deployed frontend renders its shell
and shows a clear "the kitchen isn't answering" state if the API is unreachable,
rather than failing to render at all.

**Images.** The 21 photographs were generated at 4K (~200 MB total) and compressed to
WebP at display size — 2.6 MB for the whole set, a 99% reduction. Re-run with
`node scripts/optimise-images.mjs`.

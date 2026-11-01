# Vintique

A community marketplace for buying and selling vintage & pre-loved fashion. Members list the clothes they no longer wear; other members browse, chat with sellers and buy. Every listing is a single, one-of-a-kind item.

Built with Next.js 16 (App Router), Material UI, Prisma, PostgreSQL and Better Auth, and runs with Docker.

## Features

**Buying**
- Shop with search, category filters, sorting and server-side pagination
- Product pages with size, condition, category and seller info
- Bag grouped by seller (each piece can be added once)
- Checkout with a shipping address: one order per seller, flat shipping per parcel. **Payment is simulated (test mode)**
- Orders page: follow purchases and confirm when they arrive

**Selling**
- Anyone with an account can list a piece for free: photo (drag & drop, up to 2 MB), title, brand, size, category, condition, price, description
- "Your listings" page with for-sale / sold tabs
- Sales show up on the Orders page with the buyer's address; the seller marks them as shipped
- Sellers can mark items sold outside the site, relist or delete them (not once they're part of an order)

**Messaging**
- "Message seller" on any listing opens a conversation about that piece
- Inbox with last message and unread counts, threads that refresh automatically, "Seen" receipts
- Unread badge in the header

**Accounts & moderation**
- Email + password sign-up and sign-in (Better Auth, sessions in httpOnly cookies)
- The account registered with `ADMIN_EMAIL` is an admin and can remove any listing

**Design**
- Glassmorphism UI with a vintage palette (parchment, oxblood, brass, olive), Cormorant Garamond + Inter
- Light and dark mode; follows the system setting by default, with no flash on load

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Route Handlers, Cache Components) |
| UI | React 19, Material UI 9 (CSS variables theme), Emotion |
| Auth | Better Auth (email/password, database sessions, scrypt) |
| Database | PostgreSQL 16 via Prisma 5 (migrations in `prisma/migrations`) |
| Runtime | Node 22, Docker, docker-compose |

## Run with Docker

1. Create a `.env` file in the repository root (it is git-ignored):
   ```
   BETTER_AUTH_SECRET=<generate with: openssl rand -base64 32>
   BETTER_AUTH_URL=http://localhost:3000
   ADMIN_EMAIL=admin@vintique.com
   ```
2. Start everything:
   ```bash
   docker-compose up -d --build
   ```

- App: http://localhost:3000
- Postgres: localhost:5433 (user `vintique`, password `vintique`). Port 5433 avoids clashing with a locally installed PostgreSQL
- Database migrations run automatically when the app container starts.

## Run locally (without the app container)

Start only the database with `docker-compose up -d db`, then create `vintique-next/.env`:
```
DATABASE_URL=postgresql://vintique:vintique@localhost:5433/vintique
BETTER_AUTH_SECRET=<generate with: openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3000
ADMIN_EMAIL=admin@vintique.com
```
```bash
cd vintique-next
npm install
npx prisma migrate dev
npm run dev
```
Stop the `app` container first if it is running, since both use port 3000.

## Scripts (in `vintique-next/`)

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type check |
| `npm test` | Run the test suite (needs the `db` container running) |
| `npm run test:watch` | Tests in watch mode |
| `npx prisma migrate dev` | Apply migrations / create a new one after editing the schema |
| `npx prisma studio` | Browse the database in the browser |

## API

All endpoints are under `/api`. Endpoints marked 🔒 need a signed-in session cookie.

| Method & path | Purpose |
|---|---|
| `GET/POST /api/auth/*` | Better Auth (sign-up, sign-in, sign-out, session) |
| `GET /api/products` | Listings for sale. Query: `page`, `limit`, `q`, `category`, `sort` (`newest`, `price-asc`, `price-desc`); `mine=1` 🔒 for your own listings |
| `POST /api/products` 🔒 | Create a listing |
| `GET /api/products/:id` | One listing with its seller |
| `PATCH /api/products/:id` 🔒 | Mark sold / relist (seller or admin) |
| `DELETE /api/products/:id` 🔒 | Delete a listing (seller or admin) |
| `POST /api/checkout` 🔒 | Buy the given product ids; creates one order per seller |
| `GET /api/orders?as=buyer\|seller` 🔒 | Your purchases or sales |
| `PATCH /api/orders/:id` 🔒 | `SHIPPED` (seller) or `COMPLETED` (buyer) |
| `GET /api/conversations` 🔒 | Inbox |
| `POST /api/conversations` 🔒 | Start or reopen a conversation about a listing |
| `GET /api/conversations/:id` 🔒 | A thread (marks incoming messages as read) |
| `POST /api/conversations/:id/messages` 🔒 | Send a message |
| `GET /api/conversations/unread` | Unread message count |

## Project structure

```
vintique/
├── .github/workflows/ci.yml    # CI (lint, types, tests, build) + CD (publish Docker image)
├── docker-compose.yml          # Postgres + app
├── .env                        # secrets for docker-compose (git-ignored)
└── vintique-next/
    ├── Dockerfile              # multi-stage, slim, non-root; runs migrations on start
    ├── tests/                  # Vitest integration tests
    ├── prisma/
    │   ├── schema.prisma       # data model
    │   └── migrations/         # SQL migrations, applied in order
    └── src/
        ├── app/                # pages and API route handlers (App Router)
        │   ├── api/            # REST endpoints
        │   ├── products/[id]/  # product page
        │   ├── checkout/  orders/  messages/  listings/  cart/
        │   └── login/  register/  admin/  about/  contact/
        ├── components/         # Header, Shell (layout), ProductCard, dialogs, forms
        ├── context/            # CartContext (bag in localStorage)
        ├── lib/                # auth, Prisma client, types, constants, helpers
        └── theme.ts            # MUI theme, palette and glass style
```

## Testing

`npm test` runs 30 integration tests with [Vitest](https://vitest.dev). They call the real API route handlers against a real PostgreSQL database, so they check the actual queries, transactions and permission rules. Only the session lookup is replaced, so each test can choose who is signed in.

- The tests use a separate `vintique_test` database (on the `db` container, port 5433), recreated from the migrations before each run, and refuse to run against a database whose name doesn't contain "test". Override with `TEST_DATABASE_URL`.
- Covered:
  - listing validation, browsing filters and pagination
  - ownership and admin rules
  - checkout, including two buyers purchasing the same item at the same moment
  - the order status flow
  - messaging privacy and unread counts

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`):

- **CI:** on every push and pull request, runs lint, type check, the tests (against a PostgreSQL service container) and a production build.
- **CD:** on pushes to `master`, once CI passes, builds the production Docker image and publishes it to GitHub Container Registry as `ghcr.io/edisban/vintique`, tagged `latest` and with the commit SHA.

Run the published image with your own database and secrets:
```bash
docker run -p 3000:3000   -e DATABASE_URL=postgresql://user:password@host:5432/vintique   -e BETTER_AUTH_SECRET=<secret> -e BETTER_AUTH_URL=http://localhost:3000   ghcr.io/edisban/vintique:latest
```
The container applies database migrations on start.

## Not built yet

- Real payments (the checkout step where a payment provider such as Stripe would charge the card is marked in `api/checkout/route.ts`)
- Image storage outside the database (photos are stored as base64 in Postgres)
- Real-time messaging (threads poll every few seconds)
- Email verification, password reset, reviews, favourites, multiple photos per listing

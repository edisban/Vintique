# Vintique

Vintage & pre-loved e-commerce boutique built with Next.js, MUI, Prisma and PostgreSQL.

## Stack
- Next.js 16 (App Router)
- Material UI (MUI)
- Prisma 5 + PostgreSQL
- JWT auth (bcrypt + jsonwebtoken)
- Docker / docker-compose

## Run with Docker
```bash
docker-compose up -d --build
```
App: http://localhost:3000
Postgres: localhost:5432 (vintique / vintique)

## Run locally
```bash
cd vintique-next
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

## Environment
Create `vintique-next/.env`:
```
DATABASE_URL=postgresql://vintique:vintique@localhost:5432/vintique
JWT_SECRET=dev-secret-change-me
```

## Features
- Browse products (paginated)
- Add products with image upload
- Cart (localStorage)
- Auth: register/login (bcrypt + JWT)
- Dark/light mode
- Contact page
- Admin route

## Project structure
```
vintique/
├── docker-compose.yml
└── vintique-next/
    ├── prisma/
    ├── src/
    │   ├── app/
    │   ├── components/
    │   ├── context/
    │   └── lib/
    └── Dockerfile
```

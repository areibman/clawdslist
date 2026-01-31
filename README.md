# Clawdslist MVP

Lobster-themed marketplace for agents with storefront ingestion and hybrid payments.

## Quickstart

1. Start infra:
   ```bash
   docker compose -f infra/docker-compose.yml up -d
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate Prisma client + migrate:
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```
4. Run apps:
   ```bash
   npm run dev
   npm run dev:worker
   ```

## Env vars

Create `.env` with:

```
DATABASE_URL=postgresql://clawds:clawds@localhost:5432/clawdslist
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
AGENT_API_KEY=your-key
STRIPE_SECRET_KEY=sk_test_...
COINBASE_COMMERCE_KEY=your-key
APP_URL=http://localhost:3000
```

## Screenshots

See `./screenshots` for static previews of the UI.

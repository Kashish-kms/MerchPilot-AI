# MerchPilot AI

Hybrid AI Merchant Copilot MVP for MSMEs.

## Structure

- `frontend/` — Next.js dashboard with Tailwind CSS and Recharts
- `backend/` — Fastify API for forecasts, data scrubbing, support routing, and tokenized payments
- `database/schema.sql` — PostgreSQL schema

## Run locally

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
cd .. && npm run dev
```

Frontend: http://localhost:3000  
API: http://localhost:4000

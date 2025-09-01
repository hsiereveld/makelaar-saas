# 🏠 Makelaar CRM SaaS Platform

Multi-tenant CRM for real estate agents with WordPress integration.

## Quick Start

1. Setup database at [neon.tech](https://neon.tech)
2. Add DATABASE_URL to .env.local
3. Run: npm run db:push
4. Run: npm run dev
5. Visit: http://localhost:3000

## Features

- Multi-tenant architecture
- Property management 
- Lead tracking
- WordPress plugin
- API for integrations

## Deployment

Push to GitHub and import in Vercel.

## API Endpoints

- GET /api/v1/{tenant}/properties
- POST /api/v1/{tenant}/properties
- GET /api/v1/{tenant}/contacts
- POST /api/v1/{tenant}/leads

## License

MIT

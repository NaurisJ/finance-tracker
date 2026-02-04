# FlowLedger

A personal finance tracker built with Next.js, NextAuth, and Prisma. FlowLedger helps you log income and expenses, edit transactions, and keep a clean ledger with real-time totals.

## Features
- Credential-based authentication
- CRUD transactions (create, list, update, delete)
- Per-user data isolation and authorization checks
- Clean dashboard with totals and activity list
- Responsive layout and modern UI

## Tech Stack
- Next.js (App Router)
- NextAuth (credentials)
- Prisma + PostgreSQL
- TypeScript
- Tailwind CSS

## Getting Started

### 1. Install dependencies
This project installs all required dependencies via npm based on the versions locked in `package-lock.json`.
```bash
npm install
```

### 2. Configure environment variables
Create a `.env` file in the project root:
```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### 3. Prisma setup
```bash
npx prisma generate
npx prisma migrate dev
```

### 4. Run the app
```bash
npm run dev
```

Open the app at:
```text
http://localhost:3000
```

## Scripts
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Lint
```

## Project Structure
```text
src/
  app/
    api/
      auth/           # NextAuth config
      me/             # Session endpoint
      register/       # User registration
      transactions/   # Transaction CRUD
    dashboard/        # Dashboard UI
    login/            # Login UI
    register/         # Register UI
  lib/
    auth.ts           # Auth helpers
    prisma.ts         # Prisma client
prisma/
  schema.prisma
```

## API Endpoints
```text
POST   /api/register             # Create user
GET    /api/me                   # Current session
GET    /api/transactions         # List transactions
POST   /api/transactions         # Create transaction
GET    /api/transactions/:id     # Single transaction
PATCH  /api/transactions/:id     # Update transaction
DELETE /api/transactions/:id     # Delete transaction
```

## Authentication
- Uses NextAuth credentials provider
- Passwords are hashed with bcrypt
- Session uses JWT strategy

## Database
- PostgreSQL via Prisma
- Models: User, Transaction

## Roadmap
- Charts and analytics
- Budget planner
- Category insights
- CSV export
- Tests for API and auth

# Care Manager

A small internal care management system built for **one 20-bed care home**
— not a public/multi-tenant product. Staff log in with individual accounts,
view residents, keep versioned care plans, and record daily notes, with an
audit trail of who did what and when.

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind
- **NextAuth** (credentials/email + password) with role-based access
- **Prisma** (SQLite for local dev; swap to Postgres for real use)

## Data model

- `User` — staff account with a role: `MANAGER`, `SENIOR_CARER`, `CARER`
- `Resident` — basic profile (name, DOB, room, key contact)
- `CarePlanVersion` — **append-only**: editing a care plan creates a new
  version row rather than overwriting the old one, so the full history is
  preserved for reviews/inspections
- `Note` — **immutable** once saved (no edit/delete route), timestamped and
  tagged to the author and a category (general/care/health/incident/risk)
- `AuditLog` — every login, resident creation, care plan version, note, and
  staff account creation is logged with who did it and when

## Roles

| Action | Carer | Senior Carer | Manager |
|---|---|---|---|
| View residents, care plans, notes | ✅ | ✅ | ✅ |
| Add notes | ✅ | ✅ | ✅ |
| Add residents / edit care plans | ❌ | ✅ | ✅ |
| Create staff accounts | ❌ | ❌ | ✅ |

## 1. Install

```bash
npm install
```

## 2. Configure environment

```bash
cp .env.example .env
```

Generate a `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

## 3. Set up the database

```bash
npx prisma generate
npx prisma migrate dev --name init
```

## 4. Create the first manager account

```bash
SEED_MANAGER_EMAIL="you@example.com" SEED_MANAGER_PASSWORD="choose-a-real-password" npm run seed
```

(Omit the env vars to get a default email and a random generated password
printed to the console — fine for a quick local look, not for real use.)

To also add one sample resident for testing the UI:

```bash
SEED_SAMPLE_DATA=true npm run seed
```

## 5. Run it

```bash
npm run dev
```

Visit `http://localhost:3000`, sign in with the manager account, and from
the **Staff** page create real accounts for each member of staff (one
account per person — don't share logins, since that's what makes the audit
trail meaningful).

## Features added since v0.1

- **Medication (MAR)** per resident: manager/senior carers chart medication;
  all staff record doses (given/refused/omitted/not available — a note is
  required unless given). Append-only history; stopping needs a reason.
- **Incidents**: any staff can report (falls, near misses, accidents…);
  managers review. Filterable list at `/dashboard/incidents`.
- **Care plan print/PDF**: *Care plan → Print / save as PDF* (browser print).
- **Self-service password reset**: `/forgot-password`. Set `RESEND_API_KEY`
  and `MAIL_FROM` to send real email; otherwise the link is printed to the
  server console. Tokens are hashed, single-use and expire after 1 hour.
- **Deactivation takes effect immediately** (account re-checked on every
  session read).
- **Postgres**: `DATABASE_URL="postgresql://…" npm run db:use-postgres`
  switches the provider and creates the schema (`prisma db push`).

## Before this touches real resident data

This handles special-category personal data (health/care records for
named individuals), so a few things matter beyond "does it run":

- **Hosting**: use a UK/EU-region Postgres provider for production, not
  SQLite (SQLite is fine for local dev only, and doesn't work on most
  serverless hosts). Point `DATABASE_URL` at it and change the `provider`
  in `prisma/schema.prisma` from `sqlite` to `postgresql`.
- **Backups**: whatever hosts the production database should have
  automatic backups — this becomes the home's real care record.
- **HTTPS + a real domain**: don't run this over plain HTTP once real data
  is involved.
- **Individual accounts only**: never share a login between staff members —
  it breaks the audit trail's usefulness (who actually wrote this note?).
- **Data protection**: the care home (as data controller) should have this
  system covered under its existing data protection policy / ICO
  registration, and a basic record of processing for it.
- **Password reset / deactivation**: managers can reset a password or
  deactivate/reactivate an account from the Staff page (both audit-logged).

## Deliberately not built yet (add only if actually needed)

- Facilities/fire-safety checklists, staff HR tracking (appraisals, visas)
- A native mobile app — the web app is responsive and works fine on phones
  as-is for point-of-care note-taking
- AI-assisted care plan writing

Keep it this small until the home actually asks for more — a 20-resident
home doesn't need the surface area of a multi-tenant product.

# Vercel Postgres Setup Guide

This guide will help you set up Vercel Postgres for your Pixel Logo Forge app.

## Step 1: Create Vercel Postgres Database

1. **Go to your Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Select your project (or create one if you haven't)

2. **Navigate to Storage**
   - Click on your project
   - Go to the **Storage** tab
   - Click **Create Database**
   - Select **Postgres**

3. **Configure Database**
   - Choose a name for your database (e.g., "pixel-logo-db")
   - Select a region (choose closest to your users)
   - Click **Create**

4. **Get Connection String**
   - After creation, Vercel will automatically add environment variables
   - Go to **Settings** → **Environment Variables**
   - You should see `POSTGRES_URL` and `POSTGRES_PRISMA_URL` automatically added
   - Copy the `POSTGRES_PRISMA_URL` (this is the one Prisma uses)

## Step 2: Update Your Local .env File

For **local development**, add the connection string to your `.env` file:

```env
# Use POSTGRES_PRISMA_URL for Prisma
DATABASE_URL="your-postgres-prisma-url-from-vercel"
```

**Important**: 
- Vercel automatically provides `POSTGRES_URL` and `POSTGRES_PRISMA_URL`
- Prisma uses `POSTGRES_PRISMA_URL` which includes connection pooling
- But your schema uses `DATABASE_URL`, so you can either:
  - Use `POSTGRES_PRISMA_URL` as your `DATABASE_URL` value, OR
  - Update schema to use `POSTGRES_PRISMA_URL` directly

## Step 3: Update Prisma Schema (Optional)

If you want to use Vercel's specific environment variable, update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")  // Use Vercel's Prisma URL
}
```

Or keep using `DATABASE_URL` and set it to `POSTGRES_PRISMA_URL` in your `.env`.

## Step 4: Run Migrations

### Option A: Run Migration Locally (if you have connection)

```bash
# Make sure DATABASE_URL is set in .env
npx prisma migrate deploy
```

### Option B: Run Migration on Vercel (Recommended)

Vercel will automatically run migrations during build if you have the `vercel-build` script:

```json
"vercel-build": "prisma migrate deploy && prisma generate && next build"
```

This is already in your `package.json`! So when you deploy:

1. Push your code to GitHub
2. Vercel will automatically:
   - Run `prisma migrate deploy` (applies pending migrations)
   - Generate Prisma Client
   - Build your Next.js app

## Step 5: Verify Setup

### Check Environment Variables in Vercel

1. Go to **Settings** → **Environment Variables**
2. Verify you have:
   - `POSTGRES_URL` (direct connection)
   - `POSTGRES_PRISMA_URL` (pooled connection for Prisma)
   - `DATABASE_URL` (if you added it manually)

### Test Connection Locally

```bash
# Generate Prisma Client
npx prisma generate

# Test connection (optional)
npx prisma db pull
```

### View Your Database

```bash
# Open Prisma Studio
npx prisma studio
```

This opens a web UI at http://localhost:5555 where you can view/edit your data.

## Step 6: Deploy and Run Migration

When you deploy to Vercel:

1. **Push your code**:
   ```bash
   git add .
   git commit -m "Add badges and winners system"
   git push
   ```

2. **Vercel will automatically**:
   - Detect the new migration file
   - Run `prisma migrate deploy` during build
   - Create the new tables (Badge, ChallengeCompletion, DailyWinner)

3. **Check build logs** in Vercel dashboard to confirm migration ran successfully

## Troubleshooting

### "Can't reach database server" (Local)

**Problem**: Your local `.env` doesn't have the connection string.

**Solution**: 
1. Copy `POSTGRES_PRISMA_URL` from Vercel dashboard
2. Add to local `.env` as `DATABASE_URL="..."`

### Migration fails on Vercel

**Problem**: Migration might fail if tables already exist or connection issues.

**Solution**:
1. Check Vercel build logs for specific error
2. Make sure `POSTGRES_PRISMA_URL` is set in Vercel environment variables
3. The migration uses `IF NOT EXISTS` so it's safe to run multiple times

### "Environment variable not found"

**Problem**: Prisma can't find `DATABASE_URL` or `POSTGRES_PRISMA_URL`.

**Solution**:
1. Verify environment variables in Vercel dashboard
2. Make sure they're added to the correct environment (Production, Preview, Development)
3. Redeploy after adding variables

### Connection Pooling Issues

**Problem**: Too many connections.

**Solution**: 
- Use `POSTGRES_PRISMA_URL` (includes connection pooling)
- Don't use `POSTGRES_URL` directly with Prisma

## Quick Checklist

- [ ] Created Vercel Postgres database
- [ ] Environment variables automatically added by Vercel
- [ ] Updated local `.env` with `DATABASE_URL` (set to `POSTGRES_PRISMA_URL`)
- [ ] Migration file exists at `prisma/migrations/20260121000000_add_badges_winners_challenges/migration.sql`
- [ ] Pushed code to trigger Vercel deployment
- [ ] Checked build logs to confirm migration ran
- [ ] Verified tables exist (use Prisma Studio or Vercel dashboard)

## Vercel Postgres Features

- ✅ **Automatic backups**
- ✅ **Connection pooling** (via `POSTGRES_PRISMA_URL`)
- ✅ **Free tier available** (Hobby plan)
- ✅ **Automatic scaling**
- ✅ **Integrated with Vercel deployments**

## Next Steps

After migration runs successfully:

1. Your app will automatically start using the new tables
2. Badges will be awarded when users cast logos
3. Daily winners will be calculated automatically
4. All features will work seamlessly!

---

**Note**: Vercel Postgres is only accessible from Vercel deployments and your local machine (if you have the connection string). For local development, you might want to use a local database or Docker, but for production, Vercel Postgres is perfect!

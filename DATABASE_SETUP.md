# Database Setup Guide

This project uses PostgreSQL. Here are several ways to get a database running:

## Option 1: Docker (Easiest for Local Development) ⭐ Recommended

### Step 1: Install Docker
- Download Docker Desktop: https://www.docker.com/products/docker-desktop
- Install and start Docker Desktop

### Step 2: Run PostgreSQL in Docker
```bash
docker run --name pixel-logo-db \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=pixellogo \
  -p 5432:5432 \
  -d postgres:15
```

### Step 3: Update your .env file
Add this line to your `.env` file:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/pixellogo?schema=public"
```

### Step 4: Run the migration
```bash
npx prisma migrate dev --name add_badges_winners_challenges
```

### To stop the database:
```bash
docker stop pixel-logo-db
```

### To start it again:
```bash
docker start pixel-logo-db
```

---

## Option 2: Local PostgreSQL Installation

### macOS (using Homebrew)
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database
createdb pixellogo
```

### Update .env file:
```env
DATABASE_URL="postgresql://$(whoami)@localhost:5432/pixellogo?schema=public"
```

### Run migration:
```bash
npx prisma migrate dev --name add_badges_winners_challenges
```

---

## Option 3: Cloud Database (Free Options)

### Option 3a: Vercel Postgres (if deploying to Vercel)
1. Go to your Vercel project dashboard
2. Navigate to Storage → Create Database → Postgres
3. Copy the connection string
4. Add to `.env`:
```env
DATABASE_URL="your-vercel-postgres-connection-string"
```

### Option 3b: Supabase (Free tier available)
1. Go to https://supabase.com
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (URI format)
5. Add to `.env`:
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"
```

### Option 3c: Neon (Free tier available)
1. Go to https://neon.tech
2. Create a new project
3. Copy the connection string
4. Add to `.env`:
```env
DATABASE_URL="your-neon-connection-string"
```

### Option 3d: Railway (Free tier available)
1. Go to https://railway.app
2. Create a new project → Add PostgreSQL
3. Copy the connection string
4. Add to `.env`:
```env
DATABASE_URL="your-railway-connection-string"
```

---

## Option 4: Prisma Accelerate (Cloud Proxy)

If you want to use Prisma's cloud proxy (works with any PostgreSQL):

1. Go to https://accelerate.prisma.io
2. Create an account and project
3. Get your connection string
4. Add to `.env`:
```env
DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"
```

---

## After Setting Up Database

### 1. Verify connection
```bash
npx prisma db pull
```

### 2. Run migrations
```bash
npx prisma migrate dev
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. (Optional) Open Prisma Studio to view data
```bash
npx prisma studio
```

---

## Quick Start Script (Docker)

Save this as `start-db.sh`:

```bash
#!/bin/bash

# Check if container exists
if docker ps -a | grep -q pixel-logo-db; then
  echo "Starting existing database container..."
  docker start pixel-logo-db
else
  echo "Creating new database container..."
  docker run --name pixel-logo-db \
    -e POSTGRES_PASSWORD=devpassword123 \
    -e POSTGRES_DB=pixellogo \
    -p 5432:5432 \
    -d postgres:15
  
  echo "Waiting for database to be ready..."
  sleep 5
fi

echo "Database is running!"
echo "Connection string: postgresql://postgres:devpassword123@localhost:5432/pixellogo?schema=public"
```

Make it executable:
```bash
chmod +x start-db.sh
./start-db.sh
```

---

## Troubleshooting

### "Can't reach database server"
- Make sure PostgreSQL is running
- Check if port 5432 is available: `lsof -i :5432`
- Verify your DATABASE_URL in `.env` is correct

### "Database does not exist"
- Create the database: `createdb pixellogo` (local) or create via your cloud provider's dashboard

### "Connection refused"
- Check firewall settings
- Verify PostgreSQL is listening on the correct port
- For Docker: Make sure the container is running (`docker ps`)

### "Password authentication failed"
- Double-check your password in the DATABASE_URL
- For Docker: Make sure the password matches what you set in the docker run command

---

## Recommended for Development

**For local development**: Use Docker (Option 1) - it's the easiest and most isolated.

**For production**: Use a managed service like Vercel Postgres, Supabase, or Neon.

# Database Migration Instructions

## Migration File Created

The migration SQL file has been created at:
`prisma/migrations/20260121000000_add_badges_winners_challenges/migration.sql`

## When Database is Available

Once your database server is accessible, you can run the migration in one of two ways:

### Option 1: Use Prisma Migrate (Recommended)
```bash
npx prisma migrate deploy
```

This will apply all pending migrations to your database.

### Option 2: Run SQL Directly
If you prefer to run the SQL directly:

1. Connect to your database
2. Run the SQL from `prisma/migrations/20250120120000_add_badges_winners_challenges/migration.sql`

### Option 3: Mark Migration as Applied (if already run manually)
If you've already run the SQL manually:
```bash
npx prisma migrate resolve --applied 20260121000000_add_badges_winners_challenges
```

## What This Migration Creates

1. **Badge Table**: Stores user badges/achievements
   - Tracks badge type, user, and when it was earned
   - Unique constraint prevents duplicate badges per user

2. **ChallengeCompletion Table**: Tracks challenge completions
   - Stores which challenges users completed and when
   - Tracks prompts completed for each challenge

3. **DailyWinner Table**: Stores daily winner records
   - Tracks top 3 winners for each day
   - Links to leaderboard entries

4. **Indexes**: Added for performance
   - Badge lookups by user and type
   - Challenge completion queries
   - Daily winner date lookups
   - LeaderboardEntry username lookups

## Verification

After running the migration, verify it worked:

```bash
npx prisma studio
```

Or check the tables directly:
```sql
SELECT COUNT(*) FROM "Badge";
SELECT COUNT(*) FROM "ChallengeCompletion";
SELECT COUNT(*) FROM "DailyWinner";
```

## Notes

- The migration uses `CREATE TABLE IF NOT EXISTS` so it's safe to run multiple times
- All indexes are created with `IF NOT EXISTS` for safety
- The migration is idempotent - running it multiple times won't cause errors

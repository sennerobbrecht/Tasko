# Tasko

Tasko is a React Native app built with Expo and ready to run on an Android emulator.

## Run

1. Install dependencies if needed:
   ```bash
   npm install
   ```
2. Start the Android build:
   ```bash
   npm run android
   ```

If you want to open the dev server manually instead, use:

```bash
npx expo start
```

## What is included

- A polished welcome screen matching the provided Tasko mockup
- Android-friendly Expo setup
- Supabase client setup for Expo (auth/session)
- Password reset flow wired to Supabase Auth

## Supabase setup

1. Create or update your local env file:
    - Use `.env.local` for local development
    - Required keys:
       - `EXPO_PUBLIC_SUPABASE_URL`
       - `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
2. One-time CLI setup:
    - `npm run db:link` (link this repo to your Supabase project)
3. Apply database changes via migrations (no copy/paste needed):
    - `npm run db:push`
4. For new DB changes:
    - Create migration: `npm run db:new <migration_name>`
    - Edit the new file in `supabase/migrations/`
    - Apply: `npm run db:push`
5. Make sure Email auth is enabled in Supabase Authentication.

### Security note

- Never put your Postgres password or service role key in the mobile app.
- The app only uses the publishable key.

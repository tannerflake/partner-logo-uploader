# Partner logo onboarding

Next.js app for partners to upload SVG logos and for internal admins to review, configure placements, and copy Linear-ready markdown.

See `build-instructions.md` for the product spec.

## Local development

```bash
cp .env.example .env.local
# Fill in values (see “Environment” below)
npm install
npm run dev
```

- Public form: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL**: run `supabase/schema.sql` in **SQL Editor** (creates tables, enums, RLS, storage bucket).
3. **Storage**: confirm bucket `logos` exists (script inserts it). Files are private; admins use signed URLs.
4. **Auth**:
   - Authentication → Providers → Email: enable **email/password**.
   - Disable public sign-ups if you want invite-only: **Authentication → Providers → Email** (or project settings for signups).
   - Create users for Kelly, Katie, Tanner, Gloria (**Authentication → Users** → Add user or Invite).
5. Copy **Project URL** and **anon** / **service_role** keys from **Project Settings → API** into `.env.local`.

`SUPABASE_SERVICE_ROLE_KEY` is server-only (Vercel env, never exposed to the browser). It is used for the public submit API and must stay secret.

## Slack

1. Create or use a Slack app with **Incoming Webhooks** enabled.
2. Add a webhook to channel `#partnerships` and paste the URL into `SLACK_WEBHOOK_URL`.
3. For `@Kelly`, open Kelly’s Slack profile → **Copy member ID** (format `U…`) and set `SLACK_KELLY_USER_ID`.

## Vercel

1. Import the repo and set the same environment variables as `.env.example`.
2. Set `NEXT_PUBLIC_APP_URL` to your production URL (e.g. `https://your-app.vercel.app`) so Slack and ticket links are correct.

## Example logo images

Placeholder examples live in `public/examples/`. Replace with assets from your partner brand guidelines when available.

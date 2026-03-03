This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Admin Access

- Admin login entry: `/admin/login`
- Admin-only route: `/admin`
- Users with `profiles.role = 'admin'` can access admin pages.
- Single Supabase source of truth file: `supabase/master.sql`

Set a user as admin in Supabase SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = '<USER_UUID>';
```

## Supabase Master SQL Workflow

- Use `supabase/master.sql` when you want one file to upload in Supabase SQL Editor.
- Update that file directly for schema/policy changes (including role logic updates).
- For production teams, migrations are still recommended for strict history, but the master file is available for your single-file workflow.
- `npm run supabase:master` prints the SQL from `supabase/master.sql`.
- `npm run supabase:master:apply` applies `supabase/master.sql` using Supabase CLI (`supabase db execute --file supabase/master.sql`).

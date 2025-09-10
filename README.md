## Invite users and let them set a password

Supabase invite emails send a magic link including `token_hash` and `type`.

1. Ensure the confirm route is configured in Supabase Auth → URL Configuration:
	- Site URL: `https://<your-domain>`
	- Redirect URLs: include `/auth/confirm`
2. In the email template (Invite user), set the action URL to point to `/auth/confirm` with `next` to a local set-password page, e.g.:

	`${SITE_URL}/auth/confirm?token_hash={{ .TokenHash }}&type={{ .Type }}&next=/auth/set-password`

3. Our `/auth/confirm` handler verifies the token and redirects to `next` if valid.
4. The `/auth/set-password` page lets the user set their password via a server action calling `supabase.auth.updateUser({ password })`.

# Next.js & HeroUI Template

This is a template for creating applications using Next.js 14 (app directory) and HeroUI (v2).

[Try it on CodeSandbox](https://githubbox.com/heroui-inc/heroui/next-app-template)

## Technologies Used

- [Next.js 14](https://nextjs.org/docs/getting-started)
- [HeroUI v2](https://heroui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Tailwind Variants](https://tailwind-variants.org)
- [TypeScript](https://www.typescriptlang.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [next-themes](https://github.com/pacocoursey/next-themes)
- [Supabase](https://supabase.com/)

## How to Use

### Install dependencies

You can use one of them `npm`, `yarn`, `pnpm`, `bun`, Example using `npm`:

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

### Start Supabase
```shell
supabase start --ignore-health-check
```

Add the output to your environment variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
DATABASE_URL=<your-database-url>
JWT_SECRET=<your-jwt-secret>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_SUPABASE_ROLE_KEY=<your-role-key>
```

### Seeding database
```shell
npx tsx seed.ts
```

### Generate VAPID keys

You can generate VAPID keys using the following command:

```bash
npm install -g web-push
web-push generate-vapid-keys
```
Add them to your environment variables:

```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<your-public-key>
VAPID_PRIVATE_KEY=<your-private-key>
VAPID_SUBJECT=<your-subject>
```

## License

Licensed under the [MIT license](https://github.com/heroui-inc/next-app-template/blob/main/LICENSE).

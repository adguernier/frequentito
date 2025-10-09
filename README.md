# Frequentito

A simple app to manage office attendance and receive updates.

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

```bash
make install
```

### Start the stack locally

```bash
make start
```

### Seed the database
```shell
make seed
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

### Configure Email Domain Validation

The application validates user email addresses against a configured domain to restrict registration.

#### 1. Set the Environment Variable

Add the allowed email domain to your `.env` file:

```bash
NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN=yourdomain.com
```

This environment variable is used for:
- Client-side form validation and UI placeholders
- Server-side signup validation
- Database configuration sync

#### 2. Update Database Configuration

The email domain validation is also enforced at the database level. After setting the environment variable, you need to sync it to the database:

1. **During seeding** (recommended for development):
   ```bash
   make seed
   ```
   The seed script automatically updates the database configuration.

2. **Manual update** (for production or when changing domains):
   You can update the database configuration by calling the sync function in your application or directly in the database:
   
   ```sql
   INSERT INTO public.app_config (key, value, description)
   VALUES ('allowed_email_domain', 'yourdomain.com', 'Email domain required for user registration')
   ON CONFLICT (key) DO UPDATE SET
     value = EXCLUDED.value,
     updated_at = NOW();
   ```

#### 3. Verification

Once configured, the application will:
- Only allow user registration with emails ending in `@yourdomain.com`
- Show the configured domain in the signup form placeholder
- Enforce validation both client-side and server-side
- Block registration attempts at the database level

**Note**: Both the environment variable and database configuration must match for proper functionality.

## Development

### Run the tests

```bash
make test
```

### Run the Storybook

```bash
make storybook
```

## Invite users and let them set a password

Supabase invite emails send a magic link including `token_hash` and `type`.

1. Ensure the confirm route is configured in Supabase Auth → URL Configuration:
	- Site URL: `https://<your-domain>`
	- Redirect URLs: include `/auth/confirm`
2. In the email template (Invite user), set the action URL to point to `/auth/confirm` with `next` to a local set-password page, e.g.:

	`${SITE_URL}/auth/confirm?token_hash={{ .TokenHash }}&type={{ .Type }}&next=/auth/set-password`

3. Our `/auth/confirm` handler verifies the token and redirects to `next` if valid.
4. The `/auth/set-password` page lets the user set their password via a server action calling `supabase.auth.updateUser({ password })`.

## License

Licensed under the [MIT license](./LICENSE).

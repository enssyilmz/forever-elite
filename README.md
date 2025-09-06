## Forever Elite
A Next.js app for selling training programs with Stripe payments, Supabase auth/data, and an admin dashboard. Includes a purchase flow, “My Orders”, favorites, and bulk email via Resend.
www.foreverelite.co.uk

### Tech Stack
- Next.js 15, React 19, TypeScript
- Tailwind CSS
- Stripe (Checkout + Webhooks)
- Supabase (Auth, Postgres, RLS)
- Resend (Transactional emails)
- Lucide Icons, Day.js

### Features
- Checkout and confirmation pages with Stripe
- Stripe webhook to persist purchases into `purchases` table
- Dashboard with Favorites and My Orders
- Admin panel:
  - Users list (via RPC)
  - Custom Programs CRUD
  - Purchases list
  - Send bulk emails to all users (Resend), with recipient picker and success/error popup

### Getting Started

1) Install
```bash
npm install
```

2) Environment variables
Create `.env.local` and add:
```bash
# App
NEXT_PUBLIC_SITE_URL="...supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"   # server only

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."                   # test or live depending on env

# Resend
RESEND_API_KEY="re_..."
RESEND_FROM="noreply@yourdomain.com"              # verified domain/sender in Resend
```

3) Database
- Apply migrations from `supabase/migrations` to your Supabase project (contains `purchases`, custom programs, etc.).
- Ensure RLS policies are in place as provided by the migrations.

4) Run the app
```bash
npm run dev
```

### Payments & Webhooks

- Create Checkout Sessions at `POST /api/create-checkout-session`.
- Confirmation page reads session details via `GET /api/get-checkout-session`.
- Webhook: `POST /api/stripe-webhook`
  - Uses Stripe signature verification and Supabase service-role to insert rows into `purchases`.
  - Make sure `STRIPE_WEBHOOK_SECRET` matches the endpoint.

Local testing (Stripe CLI):
```bash
stripe login
stripe listen --forward-to http://localhost:3000/api/stripe-webhook
# copy Signing secret into STRIPE_WEBHOOK_SECRET
```

Production:
- Add a Webhook endpoint in Stripe Dashboard → Developers → Webhooks → `https://yourdomain.com/api/stripe-webhook`
- Use the provided Signing secret in your production environment.

### Bulk Email (Resend)

- API route: `app/api/admin/send-bulk-mail/route.ts`
- Requires `RESEND_API_KEY` and `RESEND_FROM`.
- Domain must be verified on Resend (SPF/DKIM). Add DMARC for better deliverability.
- Admin modal allows selecting/removing recipients, searching, and sending. Shows success/error popup.

### Admin Access

- Admin panel at `/admin`
- Only the email in `ADMIN_EMAIL` (in `app/admin/page.tsx`) can view the page. Update as needed.

### Scripts
```bash
npm run dev     # start development server
npm run build   # build for production
npm run start   # start production server
npm run lint    # run linting
```

### Troubleshooting

- Webhook 400/500:
  - Check `STRIPE_WEBHOOK_SECRET` and event log in Stripe Dashboard → Events.
  - Ensure `SUPABASE_SERVICE_ROLE_KEY` is set for server handlers.
- Orders not visible:
  - `purchases` filters by `user_email` == `currentUser.email`. The checkout email must match the signed-in email.
- Emails not received:
  - Check Resend logs (bounces/suppressions).
  - Verify SPF/DKIM/DMARC. Look in Spam/Promotions.
  - Use verified domain and a simple body while warming up.

### Project Structure (key paths)
- `app/checkout/` - checkout flow and confirmation
- `app/api/` - server routes (Stripe, Resend, custom programs)
- `app/dashboard/` - user dashboard (favorites, orders)
- `app/admin/` - admin panel
- `supabase/migrations/` - SQL migrations
- `utils/` - Supabase client
- `lib/` - data types and static data

### Security
- Keep all secrets in environment variables. Do not commit keys to the repo.
- Use service-role keys only on the server (never expose in the client).

### Screenshots
<img width="1833" height="869" alt="image" src="https://github.com/user-attachments/assets/5ee7d7a9-9b9e-438b-b069-501760434515" />
<img width="1825" height="866" alt="image" src="https://github.com/user-attachments/assets/37a7a5ce-1206-45e4-9103-98d851aa6c43" />
<img width="1828" height="866" alt="image" src="https://github.com/user-attachments/assets/9282c54a-07a1-4c7a-a5a6-7989d05f7bbf" />
<img width="1820" height="862" alt="image" src="https://github.com/user-attachments/assets/7067343d-fe99-430e-8575-9101805f39a0" />
<img width="1822" height="864" alt="image" src="https://github.com/user-attachments/assets/c8a32411-c62d-4505-8df1-f5572c649487" />
<img width="1832" height="865" alt="image" src="https://github.com/user-attachments/assets/f5404390-4018-46d4-adc8-7857f32ce415" />
<img width="1822" height="789" alt="image" src="https://github.com/user-attachments/assets/f44ceefe-3afc-4e79-96b9-dbf682054214" />


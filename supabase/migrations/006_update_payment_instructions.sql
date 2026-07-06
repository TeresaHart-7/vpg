-- Update payment instructions with revised pricing and cost-sharing copy
-- Applied to remote Supabase 2026-06-30 (before phase3_logistics).

UPDATE admin_content_blocks
SET
  content = E'## Registration costs

- **$400 CAD** — full event (Sept 25 evening through Sept 29, includes optional "Now What" day Sept 30)
- **$350 CAD** — children ages 5–18
- Children under 5 are free
- USD equivalents: **$280 USD** for adults · **$250 USD** for kids

If you need to pay less, or want to contribute more, say so in the registration survey — we want you here.

## How to pay (in order of preference)

1. **Interac e-transfer (preferred for Canadians):** tessmhart@gmail.com
2. **Wise:** teresah396 (USD or CAD, without conversion)
3. **PayPal CAD:** https://paypal.me/pathwaystosource
4. **PayPal USD:** paypal.me/bakejam
5. **Venmo USD:** @james-a-baker

## After paying

Check **"I have sent my payment"** in your profile, or **"I will pay by Aug 31"** if you''re committing to pay soon. These checkboxes are how the host crew tracks payment status.',
  updated_at = NOW()
WHERE key = 'payment_instructions';

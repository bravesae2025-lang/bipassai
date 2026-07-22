const SUPABASE_URL = 'https://nvewmugqrpdhpdfyvzpz.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const apply = process.argv.includes('--apply');
const billingKeys = [
  'credits', 'credits_expire_at', 'tier', 'plan_expires_at',
  'free_pass_until', 'signup_welcome_shown', 'processed_stripe_sessions',
];

if (!serviceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required.');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${serviceKey}`,
  apikey: serviceKey,
  'Content-Type': 'application/json',
};
let page = 1;
let scanned = 0;
let eligible = 0;
let updated = 0;

while (true) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=1000`, { headers });
  if (!response.ok) throw new Error(`Could not list users: ${response.status} ${await response.text()}`);
  const payload = await response.json();
  const users = Array.isArray(payload) ? payload : (payload.users || []);
  if (!users.length) break;

  for (const user of users) {
    scanned += 1;
    if (user.app_metadata?.bipass_billing_migrated) continue;

    const legacy = user.user_metadata || {};
    const migrated = {
      ...(user.app_metadata || {}),
      bipass_billing_migrated: true,
    };
    for (const key of billingKeys) {
      if (Object.prototype.hasOwnProperty.call(legacy, key)) migrated[key] = legacy[key];
    }
    eligible += 1;

    if (apply) {
      const update = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ app_metadata: migrated }),
      });
      if (!update.ok) throw new Error(`Could not update ${user.id}: ${update.status} ${await update.text()}`);
      updated += 1;
    }
  }

  if (users.length < 1000) break;
  page += 1;
}

if (apply) {
  console.log(`Billing migration complete: ${updated} updated, ${scanned} scanned.`);
} else {
  console.log(`Dry run: ${eligible} of ${scanned} users need migration.`);
  console.log('Re-run with --apply before deploying the app_metadata authorization change.');
}

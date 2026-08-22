const SUPABASE_URL = 'https://nvewmugqrpdhpdfyvzpz.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const apply = process.argv.includes('--apply');

if (!serviceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required.');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${serviceKey}`,
  apikey: serviceKey,
  'Content-Type': 'application/json',
};
const legacyFilter = 'or=%28mode.is.null%2Cmode.not.in.%28level%2Cgenerate%2Cown%29%29';
const endpoint = `${SUPABASE_URL}/rest/v1/results?${legacyFilter}`;

if (!apply) {
  const response = await fetch(`${endpoint}&select=id`, {
    headers: { ...headers, Prefer: 'count=exact', Range: '0-0' },
  });
  if (!response.ok) throw new Error(`Could not inspect result modes: ${response.status} ${await response.text()}`);
  const total = response.headers.get('content-range')?.split('/').pop() || '0';
  console.log(`Dry run: ${total} saved result row(s) need mode normalization.`);
  console.log('Re-run with --apply to set them to level.');
} else {
  const response = await fetch(endpoint, {
    method: 'PATCH',
    headers: { ...headers, Prefer: 'return=representation' },
    body: JSON.stringify({ mode: 'level' }),
  });
  if (!response.ok) throw new Error(`Could not migrate result modes: ${response.status} ${await response.text()}`);
  const rows = await response.json();
  console.log(`Result mode migration complete: ${rows.length} row(s) updated to level.`);
}

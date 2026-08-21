const SUPABASE_URL  = 'https://nvewmugqrpdhpdfyvzpz.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52ZXdtdWdxcnBkaHBkZnl2enB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NjQ3MzMsImV4cCI6MjA5NDU0MDczM30.euNVW05tZ39McxW9vvgcv527I2Pk8VeeUy1jcu21FSE';
const BIPASS_URL    = 'https://bipassai.com';

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'GOOGLE_AUTH') {
    handleGoogleAuth()
      .then(result => sendResponse({ ok: true, ...result }))
      .catch(err  => sendResponse({ ok: false, error: err.message }));
    return true; // keep message channel open for async response
  }
});

async function handleGoogleAuth() {
  const configRes = await fetch(`${BIPASS_URL}/config`);
  const { googleClientId } = await configRes.json();
  if (!googleClientId) throw new Error('Google login not configured.');

  const extId       = chrome.runtime.id;
  const redirectUri = `https://${extId}.chromiumapp.org/`;

  const params = new URLSearchParams({
    client_id:     googleClientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'offline',
    prompt:        'select_account',
  });

  const responseUrl = await new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      { url: `https://accounts.google.com/o/oauth2/v2/auth?${params}`, interactive: true },
      url => chrome.runtime.lastError
        ? reject(new Error(chrome.runtime.lastError.message))
        : resolve(url)
    );
  });

  const code = new URL(responseUrl).searchParams.get('code');
  if (!code) throw new Error('No auth code returned.');

  const exchangeRes = await fetch(`${BIPASS_URL}/auth/google/exchange-extension`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ code, redirect_uri: redirectUri }),
  });
  const exchangeData = await exchangeRes.json();
  if (!exchangeRes.ok) throw new Error(exchangeData.error || 'Token exchange failed.');

  const verifyRes = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
    method:  'POST',
    headers: { 'apikey': SUPABASE_ANON, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ token_hash: exchangeData.token_hash, type: 'magiclink' }),
  });
  const verifyData = await verifyRes.json();
  if (!verifyRes.ok) throw new Error(verifyData.msg || 'Session verification failed.');

  const tier  = verifyData.user?.user_metadata?.tier || 'free';
  const email = verifyData.user?.email || '';
  await chrome.storage.local.set({
    access_token:  verifyData.access_token,
    refresh_token: verifyData.refresh_token,
    user_id:       verifyData.user.id,
    tier,
    email,
  });

  // Flash green badge so user knows to reopen the popup
  chrome.action.setBadgeText({ text: '✓' });
  chrome.action.setBadgeBackgroundColor({ color: '#22c55e' });
  setTimeout(() => chrome.action.setBadgeText({ text: '' }), 6000);

  return { access_token: verifyData.access_token, user_id: verifyData.user.id, tier, email };
}

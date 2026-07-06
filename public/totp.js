const SUPABASE_URL = 'https://nloupcyqrgnrcsxcmzqf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_rdOrMQwrlAW0f0p09RutMw_d6tOiYvT';

const supabase = supabasejs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const statusEl = document.getElementById('status');

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

(async () => {
  const code = getQueryParam('code');
  if (!code) {
    statusEl.textContent = 'Missing code.';
    return;
  }

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    statusEl.textContent = 'Not logged in.';
    return;
  }

  const user = data.user;

  const { data: profile, error: profileError } = await supabase
    .from('UsersSQL')
    .select('totp_secret, totp_enabled')
    .eq('uid', user.id)
    .single();

  if (profileError || !profile || !profile.totp_enabled) {
    statusEl.textContent = '2FA not enabled.';
    return;
  }

  const totp = new OTPAuth.TOTP({
    issuer: 'MyApp',
    label: user.email || user.id,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(profile.totp_secret)
  });

  const valid = totp.validate({ token: code, window: 1 }) !== null;

  if (!valid) {
    statusEl.textContent = 'Invalid 2FA code.';
    return;
  }

  statusEl.textContent = '2FA verified. Login complete.';
  window.location.href = 'dashboard.html';
})();

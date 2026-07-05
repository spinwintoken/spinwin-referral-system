const SUPABASE_URL = 'https://nloupcyqrgnrcsxcmzqf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sb3VwY3lxcmducmNzeGNtenFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNzM0MzYsImV4cCI6MjA5ODg0OTQzNn0.BlhkyZ3Ud6TDK-lXZ_zWG_XkIn1lFmQoUQBNxgtgt-g';

const supabase = supabasejs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentSecret = null;

const statusEl = document.getElementById('status');
const generateBtn = document.getElementById('generate');
const qrContainer = document.getElementById('qr-container');
const qrCanvas = document.getElementById('qr');
const secretEl = document.getElementById('secret');
const verifyContainer = document.getElementById('verify-container');
const verifyBtn = document.getElementById('verify');
const codeInput = document.getElementById('code');

async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    statusEl.textContent = 'You must be logged in.';
    throw new Error('Not logged in');
  }
  return data.user;
}

async function getUserSQL(uid) {
  const { data, error } = await supabase
    .from('UsersSQL')
    .select('uid, totp_secret, totp_enabled')
    .eq('uid', uid)
    .single();

  if (error) throw error;
  return data;
}

async function saveSecret(uid, secret) {
  const { error } = await supabase
    .from('UsersSQL')
    .update({ totp_secret: secret })
    .eq('uid', uid);

  if (error) throw error;
}

async function enable2FA(uid) {
  const { error } = await supabase
    .from('UsersSQL')
    .update({ totp_enabled: true })
    .eq('uid', uid);

  if (error) throw error;
}

generateBtn.addEventListener('click', async () => {
  try {
    const user = await getUser();
    const profile = await getUserSQL(user.id);

    if (profile.totp_enabled) {
      statusEl.textContent = '2FA already enabled.';
      return;
    }

    const secret = new OTPAuth.Secret({ size: 20 });
    const totp = new OTPAuth.TOTP({
      issuer: 'MyApp',
      label: user.email || user.id,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret
    });

    currentSecret = secret.base32;
    const uri = totp.toString();

    await saveSecret(user.id, currentSecret);

    qrContainer.style.display = 'block';
    secretEl.textContent = currentSecret;

    QRCode.toCanvas(qrCanvas, uri, { width: 256 }, function (err) {
      if (err) {
        statusEl.textContent = 'QR generation failed.';
        return;
      }
      statusEl.textContent = 'Scan the QR code.';
      verifyContainer.style.display = 'block';
    });
  } catch (e) {
    console.error(e);
  }
});

verifyBtn.addEventListener('click', async () => {
  try {
    const user = await getUser();
    const profile = await getUserSQL(user.id);

    const code = codeInput.value.trim();
    if (code.length !== 6) {
      statusEl.textContent = 'Enter a 6‑digit code.';
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
      statusEl.textContent = 'Invalid code.';
      return;
    }

    await enable2FA(user.id);
    statusEl.textContent = '2FA enabled!';
  } catch (e) {
    console.error(e);
  }
});

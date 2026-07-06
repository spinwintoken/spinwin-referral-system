const SUPABASE_URL = 'https://nloupcyqrgnrcsxcmzqf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_rdOrMQwrlAW0f0p09RutMw_d6tOiYvT';

const supabase = supabasejs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById('form');
const statusEl = document.getElementById('status');
const totpContainer = document.getElementById('totp-container');
const totpInput = document.getElementById('totp');
const totpSubmit = document.getElementById('totp-submit');

let currentUser = null;
let currentProfile = null;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.textContent = 'Signing in...';

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    statusEl.textContent = 'Error: ' + error.message;
    return;
  }

  currentUser = data.user;

  const { data: profile, error: profileError } = await supabase
    .from('UsersSQL')
    .select('uid, totp_enabled, totp_secret')
    .eq('uid', currentUser.id)
    .single();

  if (profileError) {
    statusEl.textContent = 'Profile error: ' + profileError.message;
    return;
  }

  currentProfile = profile;

  if (profile.totp_enabled) {
    statusEl.textContent = '2FA required.';
    totpContainer.style.display = 'block';
  } else {
    statusEl.textContent = 'Login successful (no 2FA).';
    window.location.href = 'dashboard.html';
  }
});

totpSubmit.addEventListener('click', async () => {
  const code = totpInput.value.trim();
  if (code.length !== 6) {
    statusEl.textContent = 'Enter a 6-digit code.';
    return;
  }
  window.location.href = `totp.html?code=${code}`;
});


const SUPABASE_URL = 'https://nloupcyqrgnrcsxcmzqf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_rdOrMQwrlAW0f0p09RutMw_d6tOiYvT';

const supabase = supabasejs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const statusEl = document.getElementById('status');
const signinBtn = document.getElementById('signin');

(async () => {
  // Supabase handles email confirmation via its own link;
  // here we just show a message.
  statusEl.textContent = 'Email confirmed. You can now sign in.';
})();

signinBtn.addEventListener('click', () => {
  window.location.href = 'signin.html';
});

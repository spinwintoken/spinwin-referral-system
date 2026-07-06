const SUPABASE_URL = 'https://nloupcyqrgnrcsxcmzqf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_rdOrMQwrlAW0f0p09RutMw_d6tOiYvT';

const supabase = supabasejs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById('form');
const statusEl = document.getElementById('status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.textContent = 'Creating account...';

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin + '/registerconfirm.html'
    }
  });

  if (error) {
    statusEl.textContent = 'Error: ' + error.message;
    return;
  }

  // Insert into UsersSQL
  const { error: insertError } = await supabase
    .from('UsersSQL')
    .insert({
      uid: data.user.id,
      email: email
    });

  if (insertError) {
    statusEl.textContent = 'Signup ok, but profile insert failed: ' + insertError.message;
    return;
  }

  statusEl.textContent = 'Check your email to confirm.';
  window.location.href = 'registerconfirm.html';
});

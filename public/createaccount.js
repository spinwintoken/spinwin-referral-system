// ✅ Correct Supabase URL + REAL anon key
const SUPABASE_URL = 'https://nloupcyqrgnrcsxcmzqf.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sb3VwY3lxcmducmNzeGNtenFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNzM0MzYsImV4cCI6MjA5ODg0OTQzNn0.BlhkyZ3Ud6TDK-lXZ_zWG_XkIn1lFmQoUQBNxgtgt-g';

// ✅ Correct Supabase client (matches your HTML <script>)
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById('form');
const statusEl = document.getElementById('status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.textContent = 'Creating account...';

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  // 1️⃣ SIGN UP USER
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

  // 2️⃣ INSERT INTO UsersSQL (NOW WORKS)
  const { error: insertError } = await supabase
    .from('UsersSQL')
    .insert({
      uid: data.user.id,
      email: email,
      indicator: 1
    });

  if (insertError) {
    statusEl.textContent =
      'Signup ok, but profile insert failed: ' + insertError.message;
    return;
  }

  // 3️⃣ SUCCESS
  statusEl.textContent = 'Check your email to confirm.';
  window.location.href = 'registerconfirm.html';
});


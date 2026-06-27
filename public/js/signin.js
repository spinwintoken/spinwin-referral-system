const client = supabase.createClient(
  "https://fchwxnontbfybypezpge.supabase.co",
  "YOUR_ANON_KEY"
);

async function signin() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    msg.textContent = "Login failed: " + error.message;
    return;
  }

  // Check MFA factors
  const { data: factors } = await client.auth.mfa.listFactors();

  if (factors.totp.length === 0) {
    // No 2FA yet → setup
    window.location.href = "totp-setup.html";
  } else {
    // 2FA enabled → verify
    window.location.href = "totp-verify.html";
  }
}

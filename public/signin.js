const client = supabase.createClient(
  "https://fchwxnontbfybypezpge.supabase.co",
  "YOUR_ANON_KEY_HERE"
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

  const { data: factors } = await client.auth.mfa.listFactors();

  if (!factors || !factors.totp || factors.totp.length === 0) {
    window.location.href = "totp-setup.html";
  } else {
    window.location.href = "totp-verify.html";
  }
}




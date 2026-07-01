const client = supabase.createClient(
  "https://fchwxnontbfybypezpge.supabase.co",
  "sb_publishable_1b_GU_eDqYN8UQoLZ5Xg7g_9_LcVasz"
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




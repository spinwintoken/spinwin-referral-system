const client = supabase.createClient(
  "https://fchwxnontbfybypezpge.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjaHd4bm9udGJmeWJ5cGV6cGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NDAxNTAsImV4cCI6MjA5NjExNjE1MH0.PTs0fUP0aX21t6RtXyVD__yohn1lFynhgplXhbfZeEI"
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
    window.location.href = "totp-setup2.html";
  } else {
    window.location.href = "totp-verify.html";
  }
}




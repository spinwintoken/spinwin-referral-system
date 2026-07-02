document.addEventListener("DOMContentLoaded", () => {

  const client = supabase.createClient(
    "https://arzakrybvbyigixmudxf.supabase.co",
    "sb_publishable_SO2z1VL6F8U477a7QzcAzw_75Np1C0x"
  );

  const form = document.getElementById("createAccountForm");
  const statusEl = document.getElementById("status");

  const urlParams = new URLSearchParams(window.location.search);
  const ref = urlParams.get("ref") || "SPINROOT";
  document.getElementById("refInfo").textContent = "Referral: " + ref;

  function generateReferralCode() {
    return "SW" + Date.now().toString(36).toUpperCase();
  }

  async function completeSignup(token) {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    statusEl.textContent = "";
    statusEl.className = "message";

    if (!token) {
      statusEl.textContent = "reCAPTCHA failed. Please refresh the page.";
      statusEl.classList.add("error");
      return;
    }

    if (password !== confirmPassword) {
      statusEl.textContent = "Passwords do not match.";
      statusEl.classList.add("error");
      return;
    }

    // Check if user row already exists
    const { data: existing } = await client
      .from("UsersSQL")
      .select("indicator")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      if (existing.indicator === 2) {
        statusEl.textContent = "User already exists.";
        statusEl.classList.add("error");
        return;
      }
      if (existing.indicator === 1) {
        statusEl.textContent = "Account already created. Please confirm your email.";
        statusEl.classList.add("error");
        return;
      }
    }

    // Create auth user (NOT logged in yet)
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "https://www.spinwintoken.com/registerconfirm.html?ref=" + ref,
        captchaToken: token
      }
    });

    if (error) {
      statusEl.textContent = "Signup error: " + error.message;
      statusEl.classList.add("error");
      return;
    }

    // Success — user must confirm email before DB insert
    statusEl.textContent = "Account created. Please check your email to confirm.";
    statusEl.classList.add("success");
    form.reset();
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const freshToken = await grecaptcha.execute(
      "6Le0ew8tAAAAAMLEY9q16CLm6CsO8OqvBr88csI4",
      { action: "signup" }
    );

    document.getElementById("recaptchaToken").value = freshToken;

    completeSignup(freshToken);
  });

});

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

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "https://www.spinwintoken.com/registerconfirm.html?type=signup",
        captchaToken: token
      }
    });

    if (error) {
      statusEl.textContent = "Signup error: " + error.message;
      statusEl.classList.add("error");
      return;
    }

    const uid = data.user.id;
    const referralCode = generateReferralCode();

    const { error: insertError } = await client.from("UsersSQL").insert({
      uid,
      email,
      indicator: 1,
      referralcode: referralCode,
      referred_by: ref,
      teammembers: 0,
      teamtoken: 0,
      teamtokenpurchased: 0,
      teamtokenavailable: 0,
      maxtoken: 10,
      totp_secret: null,
      totp_enabled: false
    });

    if (insertError) {
      statusEl.textContent = "Database insert error: " + insertError.message;
      statusEl.classList.add("error");
      return;
    }

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



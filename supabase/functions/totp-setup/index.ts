import { serve } from "https://deno.land/std/http/server.ts";
import * as totp from "https://esm.sh/otplib";

serve(async (req) => {
  const { uid, email } = await req.json();

  const secret = totp.authenticator.generateSecret();
  const otpauth = totp.authenticator.keyuri(email, "SpinWinToken", secret);

  return new Response(JSON.stringify({ otpauth, secret }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
});






// redeply 
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as otplib from "https://esm.sh/otplib@12";

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { uid, email } = await req.json();

    if (!uid || !email) {
      return new Response(JSON.stringify({ error: "Missing uid or email" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    const secret = otplib.authenticator.generateSecret();

    await supabase
      .from("UsersSQL")
      .update({ totp_secret: secret })
      .eq("uid", uid);

    const otpauth = otplib.authenticator.keyuri(
      email,
      "SpinWinToken",
      secret
    );

    return new Response(JSON.stringify({ otpauth }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});





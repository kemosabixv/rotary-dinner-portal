import { NextResponse } from "next/server";
import { getProfile, homeFor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/** OAuth callback: exchanges the PKCE code for a session, then routes by role. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const profile = await getProfile();
      const destination = next && next.startsWith("/") ? next : homeFor(profile?.role ?? "business");
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/sign-in?error=${encodeURIComponent("Google sign-in failed. Please try again.")}`,
  );
}

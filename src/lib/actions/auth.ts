"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const params = new URLSearchParams({
      error: "Email or password is incorrect.",
      next,
    });
    redirect(`/sign-in?${params.toString()}`);
  }

  redirect(next.startsWith("/") ? next : "/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}

export async function changePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 10) {
    redirect("/admin?notice=Password+must+be+at+least+10+characters");
  }
  if (password !== confirm) {
    redirect("/admin?notice=Passwords+do+not+match");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect(`/admin?notice=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin?notice=Password+updated");
}

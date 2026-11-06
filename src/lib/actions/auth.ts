"use server";

import { redirect } from "next/navigation";
import { getProfile, homeFor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const params = new URLSearchParams({
      error: "Email or password is incorrect.",
      ...(next ? { next } : {}),
    });
    redirect(`/sign-in?${params.toString()}`);
  }

  const profile = await getProfile();
  redirect(next.startsWith("/") ? next : homeFor(profile?.role ?? "business"));
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const rawNext = String(formData.get("next") ?? "");
  const next = rawNext.startsWith("/") ? rawNext : "";
  const back = (params: Record<string, string>) =>
    `/register?${new URLSearchParams({ ...params, ...(next ? { next } : {}) }).toString()}`;

  if (password.length < 10) {
    redirect(back({ error: "Use at least 10 characters for your password." }));
  }
  if (password !== confirm) {
    redirect(back({ error: "Passwords do not match." }));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(back({ error: error.message }));
  }

  // With email confirmation enabled there is no session yet.
  if (!data.session) {
    redirect(back({ sent: "1" }));
  }

  redirect(next || "/portal");
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

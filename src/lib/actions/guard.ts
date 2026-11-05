import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Every admin server action calls this before touching data. */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  return user;
}

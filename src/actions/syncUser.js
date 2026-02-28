"use server";

import { currentUser } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function syncUser() {
  try {
    const user = await currentUser();
    if (!user) return null;

    const supabase = getSupabaseAdmin();
    const email = user.emailAddresses?.[0]?.emailAddress ?? "";
    const username =
      user.username || email.split("@")[0] || `user_${user.id.slice(-8)}`;
    const displayName =
      [user.firstName, user.lastName].filter(Boolean).join(" ") || username;

    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          clerk_id: user.id,
          username,
          display_name: displayName,
          email,
          avatar_url: user.imageUrl,
          status: "online",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "clerk_id" },
      )
      .select()
      .single();

    if (error) {
      console.error("Error syncing user:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("syncUser error:", error);
    return null;
  }
}

export async function getProfileByClerkId(clerkId) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_id", clerkId)
    .single();
  return data;
}

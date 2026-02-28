import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function InvitePage({ params }) {
  const { userId } = await auth();
  const { serverId } = await params;

  if (!userId) {
    return redirect(`/sign-in?redirect_url=/invite/${serverId}`);
  }

  const supabase = getSupabaseAdmin();

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!profile) {
    return redirect("/sign-in");
  }

  // Check if they are already in the server
  const { data: member } = await supabase
    .from("server_members")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("server_id", serverId)
    .single();

  if (member) {
    return redirect(`/servers/${serverId}`);
  }

  // Get the default @everyone role for this server
  const { data: role } = await supabase
    .from("roles")
    .select("id")
    .eq("server_id", serverId)
    .eq("name", "@everyone")
    .single();

  if (!role) {
    return redirect("/");
  }

  // Add them to the server
  const { error } = await supabase.from("server_members").insert({
    profile_id: profile.id,
    server_id: serverId,
    role_id: role.id,
  });

  if (error) {
    console.error("Failed to join server", error);
    return redirect("/");
  }

  return redirect(`/servers/${serverId}`);
}

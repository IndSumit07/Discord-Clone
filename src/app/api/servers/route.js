import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { name, icon_url } = await req.json();
  if (!name?.trim()) return new Response("Name required", { status: 400 });

  const supabase = getSupabaseAdmin();

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!profile) return new Response("Profile not found", { status: 404 });

  // Create server
  const { data: server, error: serverError } = await supabase
    .from("servers")
    .insert({ name: name.trim(), icon_url, owner_id: profile.id })
    .select()
    .single();

  if (serverError) return new Response(serverError.message, { status: 500 });

  // Create default role
  const { data: role } = await supabase
    .from("roles")
    .insert({
      server_id: server.id,
      name: "@everyone",
      is_default: true,
      position: 0,
    })
    .select()
    .single();

  // Create default "general" category
  const { data: category } = await supabase
    .from("categories")
    .insert({ server_id: server.id, name: "TEXT CHANNELS", position: 0 })
    .select()
    .single();

  // Create default channels
  await supabase.from("channels").insert([
    {
      server_id: server.id,
      category_id: category?.id,
      name: "general",
      type: "text",
      position: 0,
    },
    {
      server_id: server.id,
      category_id: category?.id,
      name: "General",
      type: "voice",
      position: 1,
    },
  ]);

  // Add owner as member with admin role
  await supabase
    .from("server_members")
    .insert({
      server_id: server.id,
      profile_id: profile.id,
      role_id: role?.id,
    });

  return Response.json(server);
}

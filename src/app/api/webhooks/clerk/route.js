import { Webhook } from "svix";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return new Response("CLERK_WEBHOOK_SECRET missing", { status: 500 });
  }

  const svix_id = req.headers.get("svix-id");
  const svix_timestamp = req.headers.get("svix-timestamp");
  const svix_signature = req.headers.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Verification failed", { status: 400 });
  }

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return new Response("Supabase config missing", { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url, username } =
      evt.data;
    const email = email_addresses?.[0]?.email_address ?? "";
    const generatedUsername =
      username || email.split("@")[0] || `user_${id.slice(-8)}`;
    const displayName =
      [first_name, last_name].filter(Boolean).join(" ") || generatedUsername;

    const { error } = await supabase.from("profiles").upsert(
      {
        clerk_id: id,
        username: generatedUsername,
        display_name: displayName,
        email,
        avatar_url: image_url,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "clerk_id" },
    );

    if (error) {
      console.error("Error upserting profile:", error);
      return new Response("DB error: " + error.message, { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("clerk_id", id);
    if (error) {
      console.error("Error deleting profile:", error);
      return new Response("DB error", { status: 500 });
    }
  }

  return new Response("", { status: 200 });
}

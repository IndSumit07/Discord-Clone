import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { AccessToken } from "livekit-server-sdk";

export async function GET(req) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const room = searchParams.get("room");
  const username = searchParams.get("username");

  if (!room)
    return new Response("Missing 'room' query parameter", { status: 400 });
  if (!username)
    return new Response("Missing 'username' query parameter", { status: 400 });

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return new Response("Server not configured properly", { status: 500 });
  }

  // Generate LiveKit token
  const at = new AccessToken(apiKey, apiSecret, {
    identity: username,
    ttl: "10m",
  });

  at.addGrant({ roomJoin: true, room: room });

  return Response.json({ token: await at.toJwt() });
}

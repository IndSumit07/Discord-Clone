"use client";

import { useEffect, useState } from "react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function VideoRoom({ chatId, video, audio }) {
  const { user } = useUser();
  const [token, setToken] = useState("");

  useEffect(() => {
    if (!user) return;

    let name = user.username || user.firstName || "Guest";

    (async () => {
      try {
        const resp = await fetch(
          `/api/livekit?room=${chatId}&username=${name}`,
        );
        const data = await resp.json();
        setToken(data.token);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [user, chatId]);

  if (token === "") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-[var(--text-muted)] animate-spin my-4" />
        <p className="text-xs text-[var(--text-muted)]">Connecting to RTC...</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={video}
      audio={audio}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="default"
      className="flex flex-1"
      style={{
        "--lk-bg": "var(--background)",
        "--lk-control-bg": "var(--surface)",
      }}
    >
      <VideoConference />
    </LiveKitRoom>
  );
}

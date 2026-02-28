"use client";

import { useEffect, useState } from "react";
import {
  LiveKitRoom,
  VideoConference,
  useLocalParticipant,
  useRoomContext,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useMediaStore } from "@/store/media-store";

// Helper component to synchronize app-level mute/deafen states with LiveKit Room
function MediaSync() {
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const { isMuted, isDeafened, isVideoOff } = useMediaStore();

  useEffect(() => {
    if (!localParticipant) return;

    // Apply Mic Muting / Deafening logic
    const shouldMuteMic = isMuted || isDeafened;

    // Automatically turn on/off the mic track based on our state
    if (!shouldMuteMic) {
      localParticipant.setMicrophoneEnabled(true, {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      });
    } else {
      localParticipant.setMicrophoneEnabled(false);
    }

    // Turn off incoming audio tracks if the user clicked "Deafen"
    if (room && room.canPlaybackAudio) {
      room.remoteParticipants.forEach((p) => {
        p.audioTrackPublications.forEach((pub) => {
          if (pub.track) pub.track.setVolume(isDeafened ? 0 : 1);
        });
      });
    }
  }, [localParticipant, isMuted, isDeafened, room]);

  useEffect(() => {
    if (!localParticipant) return;

    // Apply Camera toggling
    localParticipant.setCameraEnabled(!isVideoOff);
  }, [localParticipant, isVideoOff]);

  return null;
}

export default function VideoRoom({ chatId, video, audio }) {
  const { user } = useUser();
  const [token, setToken] = useState("");
  const { isMuted, isDeafened, isVideoOff } = useMediaStore();

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

  // To ensure the default state matches the user's sidebar panel when they first join,
  // we derive the true initial props:
  const initialVideo = video && !isVideoOff;
  const initialAudio = audio && !(isMuted || isDeafened);

  return (
    <LiveKitRoom
      video={initialVideo}
      audio={
        initialAudio
          ? {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            }
          : false
      }
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="default"
      className="flex flex-1 flex-col min-h-0"
      style={{
        "--lk-bg": "var(--background)",
        "--lk-control-bg": "var(--border)",
      }}
    >
      <MediaSync />
      <VideoConference />
    </LiveKitRoom>
  );
}

"use client";

import { useEffect, useState } from "react";
import { syncUserLocalhost } from "../actions/syncUser";

export default function InitialSync() {
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (synced) return;

    let isMounted = true;
    syncUserLocalhost()
      .then((success) => {
        if (isMounted && success) {
          console.log(
            "User successfully synced to Supabase (Localhost Fallback)",
          );
          setSynced(true);
        }
      })
      .catch((err) => {
        console.error("Failed to sync user via Localhost Fallback:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [synced]);

  return null;
}

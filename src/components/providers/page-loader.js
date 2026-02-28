"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// Configure NProgress
NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.1 });

export default function PageLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Finish progress when route changes
    NProgress.done();

    return () => {
      // Start progress when component unmounts (navigating away)
      NProgress.start();
    };
  }, [pathname, searchParams]);

  return null;
}

import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/channels/@me");

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#1a1b1e]">
      {/* Animated background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full opacity-20 blur-[120px]"
          style={{
            background: "radial-gradient(circle, #5865F2, transparent)",
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full opacity-15 blur-[100px]"
          style={{
            background: "radial-gradient(circle, #EB459E, transparent)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full opacity-10 blur-[80px]"
          style={{ background: "radial-gradient(circle, #5865F2, #EB459E)" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 text-center px-6 max-w-3xl">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "#5865F2" }}
          >
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">
            Discord Clone
          </span>
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-4">
          <h1
            className="text-6xl font-extrabold leading-[1.1] tracking-tight"
            style={{
              background: "linear-gradient(135deg, #5865F2 0%, #EB459E 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Your place to talk.
          </h1>
          <p
            className="text-xl max-w-xl mx-auto leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Whether you're part of a school club, a gaming group, or a worldwide
            art community — Discord makes it easy to talk every day and hang out
            more often.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)]"
          >
            Open App
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 rounded-full border px-8 py-3.5 text-base font-semibold transition-all duration-200 hover:scale-105"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-primary)",
              background: "rgba(255,255,255,0.05)",
            }}
          >
            Sign In
          </Link>
        </div>

        {/* Feature chips */}
        <div className="flex flex-wrap gap-3 justify-center mt-4">
          {[
            "Voice & Video Calls",
            "Real-time Chat",
            "Server Communities",
            "Direct Messages",
            "File Sharing",
          ].map((f) => (
            <span
              key={f}
              className="rounded-full border px-4 py-1.5 text-sm font-medium"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-muted)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

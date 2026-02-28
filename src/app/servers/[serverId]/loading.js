import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col h-full items-center justify-center bg-[var(--background)]">
      <div className="relative">
        <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-[var(--primary)] opacity-40 animate-pulse" />
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-[var(--text-muted)] animate-pulse">
        Connecting...
      </p>
    </div>
  );
}

"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Shared game-page shell: ambient glow + nav bar + content slot.
 * Every game page wraps its content in this component so the user
 * always has the same navigation pattern / spatial model.
 */
export default function GameLayout({
  title,
  titleIcon,
  glowColor = "rgba(124,58,237,0.09)",
  accentClass = "accent-top-violet",
  counter,
  children,
}: {
  title: string;
  titleIcon?: React.ReactNode;
  glowColor?: string;
  accentClass?: string;
  counter?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen flex-col px-4 pb-8 overflow-x-hidden">
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${glowColor} 0%, transparent 70%)`,
        }}
      />

      {/* ── Top Nav ──────────────────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center gap-2.5 pt-14 pb-5">
        <Link
          href="/"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] glass transition-all active:scale-[0.92]"
          aria-label="Zurück"
        >
          <ArrowLeft className="h-[18px] w-[18px] text-white/80" />
        </Link>

        <div className="relative flex h-11 flex-1 items-center justify-center gap-2 overflow-hidden rounded-[14px] glass px-4">
          <div className={accentClass} />
          {titleIcon}
          <span className="text-[14px] font-extrabold text-white/90 leading-none truncate">
            {title}
          </span>
        </div>

        {counter !== undefined && counter !== "" && (
          <div className="flex h-11 min-w-[56px] items-center justify-center rounded-[14px] glass px-3">
            <span className="text-[13px] font-extrabold text-white/80 tabular-nums">
              {counter}
            </span>
          </div>
        )}
      </nav>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </main>
  );
}

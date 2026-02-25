"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function GameLayout({
  title,
  titleIcon,
  glowColor = "rgba(124,58,237,0.12)",
  counter,
  children,
}: {
  title: string;
  titleIcon?: React.ReactNode;
  /** CSS color for the ambient radial glow, e.g. "rgba(124,58,237,0.12)" */
  glowColor?: string;
  counter?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen flex-col bg-[#0d0f1e] px-5 pb-8">
      {/* Ambient background glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(ellipse at 50% 35%, ${glowColor} 0%, transparent 65%)`,
        }}
      />

      {/* Pill navigation */}
      <nav className="relative z-10 flex items-center gap-2 pt-12 pb-8">
        <Link
          href="/"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-colors active:bg-white/10"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </Link>

        <div className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4">
          {titleIcon}
          <span className="text-base font-black text-white">{title}</span>
        </div>

        {counter !== undefined && (
          <div className="flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4">
            <span className="text-base font-black text-white">{counter}</span>
          </div>
        )}
      </nav>

      {/* Page content */}
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </main>
  );
}

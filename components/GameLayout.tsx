"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function GameLayout({
  title,
  children,
  headerRight,
}: {
  title: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col bg-zinc-950 p-6">
      <header className="mx-auto flex w-full max-w-md items-center justify-between pt-4 mb-8">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 transition-colors hover:bg-zinc-700"
        >
          <ArrowLeft className="h-5 w-5 text-zinc-300" />
        </Link>
        <h1 className="text-lg font-bold text-zinc-100">{title}</h1>
        {headerRight ?? <div className="w-10" />}
      </header>
      {children}
    </main>
  );
}

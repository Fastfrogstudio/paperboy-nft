"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { SITE_NAME } from "@/lib/constants";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

export default function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--background)]/80 border-b border-[var(--card-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center font-bold text-sm">
              P
            </div>
            <span className="font-bold text-lg">{SITE_NAME}</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-6">
            <Link
              href="/"
              className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Home
            </Link>
            <Link
              href="/mint"
              className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Mint
            </Link>
          </nav>

          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
}

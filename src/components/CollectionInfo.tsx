"use client";

import { COLLECTION_SUPPLY, MINT_PRICE, SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";

interface CollectionInfoProps {
  itemsMinted?: number;
  itemsAvailable?: number;
}

export default function CollectionInfo({
  itemsMinted = 0,
  itemsAvailable = COLLECTION_SUPPLY,
}: CollectionInfoProps) {
  const progress =
    itemsAvailable > 0 ? (itemsMinted / itemsAvailable) * 100 : 0;

  return (
    <div className="card glow">
      <div className="flex flex-col gap-6">
        {/* Collection image placeholder */}
        <div className="aspect-square max-w-sm mx-auto w-full rounded-xl bg-gradient-to-br from-primary-900/50 to-accent-900/50 border border-[var(--card-border)] flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-6xl mb-4 gradient-text font-bold">P</div>
            <p className="text-[var(--muted)] text-sm">
              Collection artwork
            </p>
          </div>
        </div>

        {/* Collection details */}
        <div>
          <h2 className="text-2xl font-bold gradient-text">{SITE_NAME}</h2>
          <p className="text-[var(--muted)] mt-2">{SITE_DESCRIPTION}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-white/5">
            <p className="text-2xl font-bold">{itemsAvailable}</p>
            <p className="text-xs text-[var(--muted)]">Supply</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/5">
            <p className="text-2xl font-bold">{itemsMinted}</p>
            <p className="text-xs text-[var(--muted)]">Minted</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/5">
            <p className="text-2xl font-bold">
              {MINT_PRICE > 0 ? `${MINT_PRICE} SOL` : "FREE"}
            </p>
            <p className="text-xs text-[var(--muted)]">Price</p>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[var(--muted)]">Mint Progress</span>
            <span className="font-medium">
              {itemsMinted} / {itemsAvailable}
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

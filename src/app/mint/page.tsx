"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import useUmiStore from "@/store/useUmiStore";
import {
  fetchCandyMachineState,
  type CandyMachineState,
} from "@/lib/candy-machine";
import CollectionInfo from "@/components/CollectionInfo";
import MintButton from "@/components/MintButton";
import { CANDY_MACHINE_ID, SITE_NAME } from "@/lib/constants";

export default function MintPage() {
  const { connected } = useWallet();
  const umi = useUmiStore((state) => state.umi);
  const [cmState, setCmState] = useState<CandyMachineState | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCandyMachine = useCallback(async () => {
    if (!CANDY_MACHINE_ID) {
      setLoading(false);
      return;
    }

    try {
      const state = await fetchCandyMachineState(umi);
      setCmState(state);
    } catch (error) {
      console.error("Failed to load candy machine:", error);
    } finally {
      setLoading(false);
    }
  }, [umi]);

  useEffect(() => {
    loadCandyMachine();
  }, [loadCandyMachine]);

  const handleMintSuccess = () => {
    // Refresh candy machine state after successful mint
    loadCandyMachine();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold">
          Mint <span className="gradient-text">{SITE_NAME}</span>
        </h1>
        <p className="text-[var(--muted)] mt-3">
          Connect your wallet and mint your NFT from the collection
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Left: Collection info */}
        <CollectionInfo
          itemsMinted={cmState?.itemsMinted}
          itemsAvailable={cmState?.itemsAvailable}
        />

        {/* Right: Minting interface */}
        <div className="flex flex-col gap-6">
          <div className="card glow flex flex-col items-center justify-center min-h-[300px]">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                <p className="text-[var(--muted)]">
                  Loading collection data...
                </p>
              </div>
            ) : !CANDY_MACHINE_ID ? (
              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">!</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  Coming Soon
                </h3>
                <p className="text-[var(--muted)] text-sm">
                  The Candy Machine has not been configured yet. Check back
                  soon for the mint launch!
                </p>
              </div>
            ) : cmState?.isSoldOut ? (
              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-full bg-accent-500/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">*</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Sold Out!</h3>
                <p className="text-[var(--muted)] text-sm">
                  All NFTs have been minted. Check secondary marketplaces
                  like Magic Eden or Tensor.
                </p>
              </div>
            ) : (
              <div className="w-full p-4">
                <div className="text-center mb-8">
                  <h3 className="font-semibold text-lg">Ready to Mint</h3>
                  <p className="text-sm text-[var(--muted)] mt-1">
                    {cmState
                      ? `${cmState.itemsAvailable - cmState.itemsMinted} remaining`
                      : "Connect wallet to view availability"}
                  </p>
                </div>
                <MintButton
                  isSoldOut={cmState?.isSoldOut}
                  onMintSuccess={handleMintSuccess}
                />
              </div>
            )}
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card">
              <h4 className="text-sm font-semibold text-[var(--muted)]">
                Network
              </h4>
              <p className="font-medium mt-1">Solana</p>
            </div>
            <div className="card">
              <h4 className="text-sm font-semibold text-[var(--muted)]">
                Standard
              </h4>
              <p className="font-medium mt-1">Metaplex Core</p>
            </div>
          </div>

          {connected && (
            <p className="text-xs text-center text-[var(--muted)]">
              Each mint costs a small transaction fee (~0.004 SOL). Make sure
              you have enough SOL in your wallet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

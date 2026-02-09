"use client";

import { useState, useCallback, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import useUmiStore from "@/store/useUmiStore";
import { mintNFT } from "@/lib/candy-machine";
import { MINT_PRICE, CANDY_MACHINE_ID } from "@/lib/constants";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

interface MintButtonProps {
  isSoldOut?: boolean;
  onMintSuccess?: () => void;
}

export default function MintButton({
  isSoldOut = false,
  onMintSuccess,
}: MintButtonProps) {
  const { connected, wallet } = useWallet();
  const { updateSigner } = useUmiStore();
  const [isMinting, setIsMinting] = useState(false);

  // Update Umi signer when wallet changes
  useEffect(() => {
    if (wallet?.adapter) {
      updateSigner(wallet.adapter);
    }
  }, [wallet, updateSigner]);

  const handleMint = useCallback(async () => {
    if (!connected || !wallet?.adapter) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!CANDY_MACHINE_ID) {
      toast.error("Candy Machine not configured yet");
      return;
    }

    setIsMinting(true);
    const toastId = toast.loading("Minting your NFT...");

    try {
      const umi = useUmiStore.getState().umi;
      const assetId = await mintNFT(umi);

      toast.success(`NFT minted successfully!`, { id: toastId });
      onMintSuccess?.();
    } catch (error: unknown) {
      console.error("Mint failed:", error);
      const message =
        error instanceof Error ? error.message : "Mint failed. Please try again.";
      toast.error(message, { id: toastId });
    } finally {
      setIsMinting(false);
    }
  }, [connected, wallet, onMintSuccess]);

  if (!connected) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-[var(--muted)]">Connect your wallet to mint</p>
        <WalletMultiButton />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleMint}
        disabled={isMinting || isSoldOut}
        className="btn-primary text-lg px-10 py-4 w-full max-w-xs"
      >
        {isSoldOut
          ? "Sold Out"
          : isMinting
          ? "Minting..."
          : MINT_PRICE > 0
          ? `Mint for ${MINT_PRICE} SOL`
          : "Mint (Free)"}
      </button>
      {isMinting && (
        <p className="text-sm text-[var(--muted)]">
          Please confirm the transaction in your wallet...
        </p>
      )}
    </div>
  );
}

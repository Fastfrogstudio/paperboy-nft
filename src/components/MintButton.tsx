"use client";

import { useState, useCallback, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import useUmiStore from "@/store/useUmiStore";
import { mintNFT } from "@/lib/candy-machine";
import { completeNHAVerification } from "@/lib/nha";
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
  requireNHA?: boolean;
}

export default function MintButton({
  isSoldOut = false,
  onMintSuccess,
  requireNHA = true,
}: MintButtonProps) {
  const { connected, wallet, publicKey } = useWallet();
  const { updateSigner } = useUmiStore();
  const [isMinting, setIsMinting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [nhaToken, setNhaToken] = useState<string | null>(null);
  const [nhaStatus, setNhaStatus] = useState<string>("");

  // Update Umi signer when wallet changes
  useEffect(() => {
    if (wallet?.adapter) {
      updateSigner(wallet.adapter);
    }
  }, [wallet, updateSigner]);

  // Reset NHA token when wallet changes
  useEffect(() => {
    setNhaToken(null);
    setNhaStatus("");
  }, [publicKey]);

  const handleVerify = useCallback(async () => {
    if (!connected || !publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsVerifying(true);
    const toastId = toast.loading("Starting agent verification...");

    try {
      const token = await completeNHAVerification(
        publicKey.toBase58(),
        4,
        (status) => {
          setNhaStatus(status);
          toast.loading(status, { id: toastId });
        }
      );
      setNhaToken(token);
      toast.success("Agent verified! You can now mint.", { id: toastId });
    } catch (error: unknown) {
      console.error("NHA verification failed:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Verification failed. Please try again.";
      toast.error(message, { id: toastId });
    } finally {
      setIsVerifying(false);
    }
  }, [connected, publicKey]);

  const handleMint = useCallback(async () => {
    if (!connected || !wallet?.adapter) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!CANDY_MACHINE_ID) {
      toast.error("Candy Machine not configured yet");
      return;
    }

    if (requireNHA && !nhaToken) {
      toast.error("Please complete agent verification first");
      return;
    }

    setIsMinting(true);
    const toastId = toast.loading("Minting your NFT...");

    try {
      const umi = useUmiStore.getState().umi;
      await mintNFT(umi);

      toast.success("NFT minted successfully!", { id: toastId });
      setNhaToken(null); // Reset token after use
      onMintSuccess?.();
    } catch (error: unknown) {
      console.error("Mint failed:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Mint failed. Please try again.";
      toast.error(message, { id: toastId });
    } finally {
      setIsMinting(false);
    }
  }, [connected, wallet, onMintSuccess, requireNHA, nhaToken]);

  if (!connected) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-[var(--muted)]">Connect your wallet to mint</p>
        <WalletMultiButton />
      </div>
    );
  }

  const isVerified = !requireNHA || !!nhaToken;

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* NHA Verification Step */}
      {requireNHA && !nhaToken && (
        <div className="w-full max-w-xs">
          <button
            onClick={handleVerify}
            disabled={isVerifying || isSoldOut}
            className="btn-secondary text-base px-8 py-3 w-full"
          >
            {isVerifying ? "Verifying..." : "Verify Agent Identity"}
          </button>
          {isVerifying && nhaStatus && (
            <p className="text-xs text-[var(--muted)] mt-2 text-center">
              {nhaStatus}
            </p>
          )}
          {!isVerifying && (
            <p className="text-xs text-[var(--muted)] mt-2 text-center">
              Proof-of-work challenge powered by{" "}
              <span className="text-[var(--foreground)]">No Human Allowed</span>
            </p>
          )}
        </div>
      )}

      {/* Verified badge */}
      {requireNHA && nhaToken && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-sm text-green-400">Agent verified</span>
        </div>
      )}

      {/* Mint Button */}
      <button
        onClick={handleMint}
        disabled={isMinting || isSoldOut || !isVerified}
        className="btn-primary text-lg px-10 py-4 w-full max-w-xs"
      >
        {isSoldOut
          ? "Sold Out"
          : isMinting
          ? "Minting..."
          : !isVerified
          ? "Verify to Mint"
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

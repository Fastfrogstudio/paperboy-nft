"use client";

import { create } from "zustand";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  publicKey,
  type Umi,
  type Signer,
  createNoopSigner,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { mplCore } from "@metaplex-foundation/mpl-core";
import { mplCandyMachine } from "@metaplex-foundation/mpl-core-candy-machine";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import type { WalletAdapter } from "@solana/wallet-adapter-base";
import { RPC_URL } from "@/lib/constants";

// Default public key (System Program) used as placeholder
const DEFAULT_PUBKEY = publicKey("11111111111111111111111111111111");

interface UmiState {
  umi: Umi;
  signer: Signer;
  updateSigner: (wallet: WalletAdapter) => void;
  resetSigner: () => void;
}

const useUmiStore = create<UmiState>((set, get) => {
  const umi = createUmi(RPC_URL).use(mplCore()).use(mplCandyMachine());

  const defaultSigner = createNoopSigner(DEFAULT_PUBKEY);
  umi.use(signerIdentity(defaultSigner));

  return {
    umi,
    signer: defaultSigner,
    updateSigner: (wallet: WalletAdapter) => {
      const currentUmi = get().umi;
      currentUmi.use(walletAdapterIdentity(wallet));
      set({
        signer: currentUmi.identity,
      });
    },
    resetSigner: () => {
      const currentUmi = get().umi;
      const noopSigner = createNoopSigner(DEFAULT_PUBKEY);
      currentUmi.use(signerIdentity(noopSigner));
      set({ signer: noopSigner });
    },
  };
});

export default useUmiStore;

/**
 * Helper to get Umi instance with the current wallet adapter signer.
 * Use this in event handlers and non-React contexts.
 */
export function getUmi(): Umi {
  return useUmiStore.getState().umi;
}

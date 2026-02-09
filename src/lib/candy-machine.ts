import {
  fetchCandyMachine,
  fetchCandyGuard,
  mintV1,
  type CandyMachine,
  type CandyGuard,
  type DefaultGuardSetMintArgs,
} from "@metaplex-foundation/mpl-core-candy-machine";
import {
  generateSigner,
  transactionBuilder,
  publicKey,
  some,
  type Umi,
} from "@metaplex-foundation/umi";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
import { CANDY_MACHINE_ID, COLLECTION_ID, MINT_PRICE } from "./constants";

export interface CandyMachineState {
  candyMachine: CandyMachine;
  candyGuard: CandyGuard | null;
  itemsAvailable: number;
  itemsMinted: number;
  isSoldOut: boolean;
}

export async function fetchCandyMachineState(
  umi: Umi
): Promise<CandyMachineState | null> {
  if (!CANDY_MACHINE_ID) return null;

  try {
    const candyMachinePublicKey = publicKey(CANDY_MACHINE_ID);
    const candyMachine = await fetchCandyMachine(umi, candyMachinePublicKey);

    let candyGuard: CandyGuard | null = null;
    try {
      candyGuard = await fetchCandyGuard(umi, candyMachine.mintAuthority);
    } catch {
      // Candy guard may not exist
    }

    const itemsAvailable = Number(candyMachine.data.itemsAvailable);
    const itemsMinted = Number(candyMachine.itemsRedeemed);

    return {
      candyMachine,
      candyGuard,
      itemsAvailable,
      itemsMinted,
      isSoldOut: itemsMinted >= itemsAvailable,
    };
  } catch (error) {
    console.error("Failed to fetch candy machine:", error);
    return null;
  }
}

export async function mintNFT(
  umi: Umi,
  treasuryWallet?: string
): Promise<string> {
  if (!CANDY_MACHINE_ID || !COLLECTION_ID) {
    throw new Error("Candy Machine or Collection not configured");
  }

  const candyMachinePublicKey = publicKey(CANDY_MACHINE_ID);
  const collectionPublicKey = publicKey(COLLECTION_ID);
  const asset = generateSigner(umi);

  const mintArgs: Partial<DefaultGuardSetMintArgs> = {};

  // If there's a SOL payment guard, include the destination
  if (MINT_PRICE > 0 && treasuryWallet) {
    mintArgs.solPayment = some({
      destination: publicKey(treasuryWallet),
    });
  }

  const tx = transactionBuilder()
    .add(setComputeUnitLimit(umi, { units: 400_000 }))
    .add(
      mintV1(umi, {
        candyMachine: candyMachinePublicKey,
        asset,
        collection: collectionPublicKey,
        mintArgs,
      })
    );

  await tx.sendAndConfirm(umi, {
    confirm: { commitment: "finalized" },
  });

  return asset.publicKey.toString();
}

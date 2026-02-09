/**
 * Create and configure a Core Candy Machine for the collection.
 *
 * This script:
 * 1. Creates a Core Candy Machine with configurable guards
 * 2. Sets up payment, timing, and limit guards
 * 3. Saves the Candy Machine address to .env
 *
 * Usage: npm run setup-candy-machine
 *
 * Prerequisites:
 * - Collection must be created first (npm run create-collection)
 * - Creator keypair with SOL
 */

import {
  create,
  type DefaultGuardSetArgs,
} from "@metaplex-foundation/mpl-core-candy-machine";
import {
  generateSigner,
  publicKey,
  some,
  sol,
} from "@metaplex-foundation/umi";
import { createConfiguredUmi, saveAddress } from "./helpers";

const COLLECTION_ID = process.env.NEXT_PUBLIC_COLLECTION_ID;
const TOTAL_SUPPLY = Number(process.env.NEXT_PUBLIC_COLLECTION_SUPPLY || "1000");
const MINT_PRICE = Number(process.env.NEXT_PUBLIC_MINT_PRICE || "0");
const TREASURY_WALLET = process.env.TREASURY_WALLET;

async function main() {
  if (!COLLECTION_ID) {
    console.error("NEXT_PUBLIC_COLLECTION_ID not set. Run npm run create-collection first.");
    process.exit(1);
  }

  const umi = createConfiguredUmi();
  const collectionPublicKey = publicKey(COLLECTION_ID);

  console.log(`Collection: ${COLLECTION_ID}`);
  console.log(`Total supply: ${TOTAL_SUPPLY}`);
  console.log(`Mint price: ${MINT_PRICE > 0 ? MINT_PRICE + " SOL" : "FREE"}\n`);

  // Build guards
  const guards: Partial<DefaultGuardSetArgs> = {
    mintLimit: some({ id: 1, limit: 3 }),
  };
  console.log("Mint limit: 3 per wallet");

  // SOL payment guard (if price > 0)
  if (MINT_PRICE > 0) {
    if (!TREASURY_WALLET) {
      console.error(
        "TREASURY_WALLET not set in .env — required for paid mints"
      );
      process.exit(1);
    }
    guards.solPayment = some({
      lamports: sol(MINT_PRICE),
      destination: publicKey(TREASURY_WALLET),
    });
    console.log(`SOL payment guard: ${MINT_PRICE} SOL -> ${TREASURY_WALLET}`);
  }

  // Create Candy Machine
  console.log("\nCreating Candy Machine...");
  const candyMachine = generateSigner(umi);

  const tx = await create(umi, {
    candyMachine,
    collection: collectionPublicKey,
    collectionUpdateAuthority: umi.identity,
    itemsAvailable: TOTAL_SUPPLY,
    authority: umi.identity.publicKey,
    isMutable: true,
    configLineSettings: some({
      prefixName: "",
      nameLength: 50,
      prefixUri: "",
      uriLength: 200,
      isSequential: false,
    }),
    guards,
  });
  await tx.sendAndConfirm(umi);

  const candyMachineAddress = candyMachine.publicKey.toString();
  console.log(`\nCandy Machine created!`);
  console.log(`Candy Machine address: ${candyMachineAddress}`);

  // Save to .env
  saveAddress("NEXT_PUBLIC_CANDY_MACHINE_ID", candyMachineAddress);

  console.log("\nNext step: Run npm run insert-items");
}

main().catch((err) => {
  console.error("Failed to create Candy Machine:", err);
  process.exit(1);
});

/**
 * Insert NFT items (config lines) into the Candy Machine.
 *
 * This script:
 * 1. Reads metadata URIs from assets/metadata-uris.json
 * 2. Inserts them into the Candy Machine in batches
 *
 * Usage: npm run insert-items
 *
 * Prerequisites:
 * - Metadata uploaded (npm run upload-metadata)
 * - Candy Machine created (npm run setup-candy-machine)
 */

import {
  addConfigLines,
  fetchCandyMachine,
} from "@metaplex-foundation/mpl-core-candy-machine";
import { publicKey } from "@metaplex-foundation/umi";
import fs from "fs";
import path from "path";
import { createConfiguredUmi } from "./helpers";

const CANDY_MACHINE_ID = process.env.NEXT_PUBLIC_CANDY_MACHINE_ID;
const BATCH_SIZE = 10; // Number of items per transaction

interface MetadataUri {
  index: number;
  name: string;
  imageUri: string;
  metadataUri: string;
}

async function main() {
  if (!CANDY_MACHINE_ID) {
    console.error(
      "NEXT_PUBLIC_CANDY_MACHINE_ID not set. Run npm run setup-candy-machine first."
    );
    process.exit(1);
  }

  const metadataPath = path.resolve("assets/metadata-uris.json");
  if (!fs.existsSync(metadataPath)) {
    console.error(
      "assets/metadata-uris.json not found. Run npm run upload-metadata first."
    );
    process.exit(1);
  }

  const umi = createConfiguredUmi();
  const candyMachinePublicKey = publicKey(CANDY_MACHINE_ID);

  // Fetch current candy machine state
  const candyMachine = await fetchCandyMachine(umi, candyMachinePublicKey);
  const itemsLoaded = Number(candyMachine.itemsLoaded);
  const itemsAvailable = Number(candyMachine.data.itemsAvailable);

  console.log(`Candy Machine: ${CANDY_MACHINE_ID}`);
  console.log(`Items loaded: ${itemsLoaded} / ${itemsAvailable}\n`);

  // Load metadata URIs
  const allItems: MetadataUri[] = JSON.parse(
    fs.readFileSync(metadataPath, "utf-8")
  );

  // Skip already loaded items
  const itemsToInsert = allItems.slice(itemsLoaded);

  if (itemsToInsert.length === 0) {
    console.log("All items already inserted!");
    return;
  }

  console.log(`Inserting ${itemsToInsert.length} items in batches of ${BATCH_SIZE}...\n`);

  for (let i = 0; i < itemsToInsert.length; i += BATCH_SIZE) {
    const batch = itemsToInsert.slice(i, i + BATCH_SIZE);
    const startIndex = itemsLoaded + i;

    const configLines = batch.map((item) => ({
      name: item.name,
      uri: item.metadataUri,
    }));

    console.log(
      `Batch ${Math.floor(i / BATCH_SIZE) + 1}: inserting items ${startIndex} - ${startIndex + batch.length - 1}...`
    );

    await addConfigLines(umi, {
      candyMachine: candyMachinePublicKey,
      index: startIndex,
      configLines,
    }).sendAndConfirm(umi);

    console.log("  Done!");
  }

  // Verify
  const updated = await fetchCandyMachine(umi, candyMachinePublicKey);
  console.log(
    `\nAll items inserted! Total loaded: ${Number(updated.itemsLoaded)} / ${itemsAvailable}`
  );
  console.log(
    "\nYour Candy Machine is ready! Start the frontend with: npm run dev"
  );
}

main().catch((err) => {
  console.error("Failed to insert items:", err);
  process.exit(1);
});

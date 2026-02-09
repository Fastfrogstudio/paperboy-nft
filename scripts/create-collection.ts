/**
 * Create a Metaplex Core collection on-chain.
 *
 * This script:
 * 1. Uploads collection image to Arweave (if exists)
 * 2. Uploads collection metadata to Arweave
 * 3. Creates the Core collection on Solana
 * 4. Saves the collection address to .env
 *
 * Usage: npm run create-collection
 *
 * Prerequisites:
 * - Creator keypair with SOL
 * - Optional: assets/collection.png for collection image
 */

import { createCollectionV1 } from "@metaplex-foundation/mpl-core";
import { generateSigner, createGenericFile } from "@metaplex-foundation/umi";
import fs from "fs";
import path from "path";
import { createConfiguredUmi, saveAddress } from "./helpers";

const COLLECTION_NAME =
  process.env.NEXT_PUBLIC_COLLECTION_NAME || "Paperboy NFT";
const COLLECTION_DESCRIPTION =
  process.env.NEXT_PUBLIC_COLLECTION_DESCRIPTION ||
  "A Solana NFT collection powered by Metaplex Core";

async function main() {
  const umi = createConfiguredUmi();

  // Upload collection image (optional)
  let imageUri = "";
  const collectionImagePath = path.resolve("assets/collection.png");

  if (fs.existsSync(collectionImagePath)) {
    console.log("Uploading collection image...");
    const imageBuffer = fs.readFileSync(collectionImagePath);
    const genericFile = createGenericFile(imageBuffer, "collection.png", {
      tags: [{ name: "Content-Type", value: "image/png" }],
    });
    const [uri] = await umi.uploader.upload([genericFile]);
    imageUri = uri;
    console.log(`Collection image: ${imageUri}`);
  } else {
    console.log(
      "No collection image found at assets/collection.png — creating without image"
    );
  }

  // Upload collection metadata
  console.log("Uploading collection metadata...");
  const metadata: Record<string, unknown> = {
    name: COLLECTION_NAME,
    description: COLLECTION_DESCRIPTION,
    external_url: "",
    properties: {
      category: "image",
    },
  };

  if (imageUri) {
    metadata.image = imageUri;
    metadata.properties = {
      files: [{ uri: imageUri, type: "image/png" }],
      category: "image",
    };
  }

  const metadataUri = await umi.uploader.uploadJson(metadata);
  console.log(`Collection metadata: ${metadataUri}`);

  // Create collection
  console.log("\nCreating collection on-chain...");
  const collectionMint = generateSigner(umi);

  await createCollectionV1(umi, {
    collection: collectionMint,
    name: COLLECTION_NAME,
    uri: metadataUri,
  }).sendAndConfirm(umi);

  const collectionAddress = collectionMint.publicKey.toString();
  console.log(`\nCollection created!`);
  console.log(`Collection address: ${collectionAddress}`);

  // Save to .env
  saveAddress("NEXT_PUBLIC_COLLECTION_ID", collectionAddress);

  console.log("\nNext step: Run npm run setup-candy-machine");
}

main().catch((err) => {
  console.error("Failed to create collection:", err);
  process.exit(1);
});

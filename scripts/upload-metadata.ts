/**
 * Upload NFT metadata and images to Arweave via Irys.
 *
 * This script:
 * 1. Reads images from assets/images/
 * 2. Uploads each image to Arweave
 * 3. Creates metadata JSON for each NFT
 * 4. Uploads metadata to Arweave
 * 5. Saves URI mapping to assets/metadata-uris.json
 *
 * Usage: npm run upload-metadata
 *
 * Prerequisites:
 * - Place NFT images in assets/images/ (named 0.png, 1.png, etc.)
 * - Place collection image at assets/collection.png
 * - Ensure creator keypair has SOL for Irys uploads
 */

import { createGenericFile } from "@metaplex-foundation/umi";
import fs from "fs";
import path from "path";
import { createConfiguredUmi } from "./helpers";

const ASSETS_DIR = path.resolve("assets");
const IMAGES_DIR = path.join(ASSETS_DIR, "images");
const OUTPUT_FILE = path.join(ASSETS_DIR, "metadata-uris.json");

const COLLECTION_NAME =
  process.env.NEXT_PUBLIC_COLLECTION_NAME || "Paperboy NFT";
const COLLECTION_DESCRIPTION =
  process.env.NEXT_PUBLIC_COLLECTION_DESCRIPTION ||
  "A Solana NFT collection powered by Metaplex Core";

interface MetadataUri {
  index: number;
  name: string;
  imageUri: string;
  metadataUri: string;
}

async function main() {
  const umi = createConfiguredUmi();

  // Ensure directories exist
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    console.log(`Created ${IMAGES_DIR} — add your NFT images here (0.png, 1.png, ...)`);
    console.log("Then run this script again.");
    return;
  }

  // Find all image files
  const imageFiles = fs
    .readdirSync(IMAGES_DIR)
    .filter((f) => /\.(png|jpg|jpeg|gif|webp)$/i.test(f))
    .sort((a, b) => {
      const numA = parseInt(path.parse(a).name, 10);
      const numB = parseInt(path.parse(b).name, 10);
      return numA - numB;
    });

  if (imageFiles.length === 0) {
    console.log("No images found in assets/images/");
    console.log("Add your NFT images (0.png, 1.png, ...) and run again.");
    return;
  }

  console.log(`Found ${imageFiles.length} images to upload\n`);

  // Load existing progress if any
  let uploaded: MetadataUri[] = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    uploaded = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf-8"));
    console.log(`Resuming from ${uploaded.length} already uploaded items\n`);
  }

  const uploadedIndices = new Set(uploaded.map((u) => u.index));

  for (const imageFile of imageFiles) {
    const index = parseInt(path.parse(imageFile).name, 10);

    if (uploadedIndices.has(index)) {
      console.log(`Skipping #${index} (already uploaded)`);
      continue;
    }

    const ext = path.extname(imageFile).slice(1).toLowerCase();
    const mimeType = ext === "jpg" ? "image/jpeg" : `image/${ext}`;

    console.log(`Uploading image #${index}...`);

    // Upload image
    const imageBuffer = fs.readFileSync(path.join(IMAGES_DIR, imageFile));
    const genericFile = createGenericFile(imageBuffer, imageFile, {
      tags: [{ name: "Content-Type", value: mimeType }],
    });
    const [imageUri] = await umi.uploader.upload([genericFile]);
    console.log(`  Image URI: ${imageUri}`);

    // Create and upload metadata
    const metadata = {
      name: `${COLLECTION_NAME} #${index}`,
      description: COLLECTION_DESCRIPTION,
      image: imageUri,
      external_url: "",
      attributes: [],
      properties: {
        files: [{ uri: imageUri, type: mimeType }],
        category: "image",
      },
    };

    const metadataUri = await umi.uploader.uploadJson(metadata);
    console.log(`  Metadata URI: ${metadataUri}\n`);

    uploaded.push({
      index,
      name: `${COLLECTION_NAME} #${index}`,
      imageUri,
      metadataUri,
    });

    // Save progress after each upload
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(uploaded, null, 2));
  }

  console.log(`\nDone! Uploaded ${uploaded.length} items.`);
  console.log(`URIs saved to ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error("Upload failed:", err);
  process.exit(1);
});

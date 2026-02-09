import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplCore } from "@metaplex-foundation/mpl-core";
import { mplCandyMachine } from "@metaplex-foundation/mpl-core-candy-machine";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import {
  keypairIdentity,
  type Umi,
  type Keypair,
} from "@metaplex-foundation/umi";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";
const KEYPAIR_PATH = process.env.CREATOR_KEYPAIR_PATH || "./creator-keypair.json";

export function loadKeypair(umi: Umi): Keypair {
  const resolvedPath = path.resolve(KEYPAIR_PATH);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`Keypair file not found: ${resolvedPath}`);
    console.error(
      "Generate one with: solana-keygen new --outfile creator-keypair.json"
    );
    process.exit(1);
  }

  const secretKey = JSON.parse(fs.readFileSync(resolvedPath, "utf-8"));
  return umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secretKey));
}

export function createConfiguredUmi(): Umi {
  const isDevnet = RPC_URL.includes("devnet");

  const umi = createUmi(RPC_URL)
    .use(mplCore())
    .use(mplCandyMachine())
    .use(
      irysUploader({
        address: isDevnet
          ? "https://devnet.irys.xyz"
          : "https://node1.irys.xyz",
      })
    );

  const keypair = loadKeypair(umi);
  umi.use(keypairIdentity(keypair));

  console.log(`Using RPC: ${RPC_URL}`);
  console.log(`Creator wallet: ${umi.identity.publicKey}`);

  return umi;
}

export function saveAddress(key: string, value: string) {
  const envPath = path.resolve(".env");
  let envContent = "";

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf-8");
  }

  const regex = new RegExp(`^${key}=.*$`, "m");
  const newLine = `${key}=${value}`;

  if (regex.test(envContent)) {
    envContent = envContent.replace(regex, newLine);
  } else {
    envContent += `\n${newLine}`;
  }

  fs.writeFileSync(envPath, envContent.trim() + "\n");
  console.log(`Saved ${key}=${value} to .env`);
}

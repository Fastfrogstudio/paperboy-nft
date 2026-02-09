export const SITE_NAME = process.env.NEXT_PUBLIC_COLLECTION_NAME || "Paperboy NFT";
export const SITE_DESCRIPTION =
  process.env.NEXT_PUBLIC_COLLECTION_DESCRIPTION ||
  "A Solana NFT collection powered by Metaplex Core";
export const COLLECTION_SUPPLY = Number(
  process.env.NEXT_PUBLIC_COLLECTION_SUPPLY || "1000"
);
export const MINT_PRICE = Number(process.env.NEXT_PUBLIC_MINT_PRICE || "0");
export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";
export const NETWORK = (process.env.NEXT_PUBLIC_NETWORK || "devnet") as
  | "devnet"
  | "mainnet-beta";
export const CANDY_MACHINE_ID = process.env.NEXT_PUBLIC_CANDY_MACHINE_ID || "";
export const COLLECTION_ID = process.env.NEXT_PUBLIC_COLLECTION_ID || "";
export const NHA_DIFFICULTY = Number(process.env.NHA_DIFFICULTY || "4");

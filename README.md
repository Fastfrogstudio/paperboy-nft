# Paperboy NFT - Solana NFT Minting Platform

A complete Solana NFT minting platform built with **Metaplex Core**, **Core Candy Machine**, and **Next.js**. Create your own NFT collection and let others mint from it.

## Tech Stack

- **Solana** — L1 blockchain
- **Metaplex Core** — NFT standard (7.5x cheaper than Token Metadata)
- **Core Candy Machine** — Minting engine with configurable guards
- **Irys** — Permanent metadata storage on Arweave
- **Next.js 14** — React framework
- **Tailwind CSS** — Styling
- **Umi** — Metaplex client framework
- **Zustand** — State management

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your settings:
- `NEXT_PUBLIC_RPC_URL` — Solana RPC (recommend [Helius](https://helius.dev) for production)
- `NEXT_PUBLIC_NETWORK` — `devnet` or `mainnet-beta`
- `NEXT_PUBLIC_COLLECTION_NAME` — Your collection name
- `NEXT_PUBLIC_COLLECTION_SUPPLY` — Total NFT supply
- `NEXT_PUBLIC_MINT_PRICE` — Price in SOL (0 for free mint)
- `CREATOR_KEYPAIR_PATH` — Path to creator wallet keypair

### 3. Generate a creator wallet (if needed)

```bash
solana-keygen new --outfile creator-keypair.json
```

Fund it with SOL on devnet:
```bash
solana airdrop 2 --keypair creator-keypair.json --url devnet
```

### 4. Prepare your NFT artwork

Place your NFT images in `assets/images/` named numerically:
```
assets/
  collection.png          # Collection cover image
  images/
    0.png
    1.png
    2.png
    ...
```

### 5. Deploy the collection

Run these scripts in order:

```bash
# 1. Upload images and metadata to Arweave
npm run upload-metadata

# 2. Create the on-chain collection
npm run create-collection

# 3. Set up the Candy Machine with guards
npm run setup-candy-machine

# 4. Insert NFT items into the Candy Machine
npm run insert-items
```

Each script saves its output addresses to `.env` automatically.

### 6. Start the frontend

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your minting site.

## Project Structure

```
paperboy-nft/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with wallet provider
│   │   ├── page.tsx            # Landing page
│   │   ├── globals.css         # Global styles
│   │   └── mint/
│   │       └── page.tsx        # Minting page
│   ├── components/
│   │   ├── WalletProvider.tsx   # Solana wallet adapter setup
│   │   ├── Header.tsx           # Navigation header
│   │   ├── MintButton.tsx       # Mint interaction button
│   │   ├── CollectionInfo.tsx   # Collection stats display
│   │   ├── NFTCard.tsx          # NFT display card
│   │   └── CountdownTimer.tsx   # Launch countdown
│   ├── store/
│   │   └── useUmiStore.ts      # Umi + wallet state (Zustand)
│   └── lib/
│       ├── constants.ts        # Environment config
│       └── candy-machine.ts    # Candy Machine interactions
├── scripts/
│   ├── helpers.ts              # Shared script utilities
│   ├── upload-metadata.ts      # Upload to Arweave via Irys
│   ├── create-collection.ts    # Create Metaplex Core collection
│   ├── setup-candy-machine.ts  # Configure Candy Machine + guards
│   └── insert-items.ts         # Load items into Candy Machine
├── assets/
│   ├── collection.png          # Collection image
│   └── images/                 # Individual NFT images
└── .env.example                # Environment template
```

## Candy Machine Guards

The default setup includes:

- **Mint Limit** — 3 NFTs per wallet
- **SOL Payment** — Configurable price (set `NEXT_PUBLIC_MINT_PRICE`)

You can add more guards in `scripts/setup-candy-machine.ts`:
- `startDate` / `endDate` — Time-based minting windows
- `allowList` — Merkle-proof allowlists for VIP access
- `botTax` — Penalize failed transactions
- `thirdPartySigner` — Require server-side signature
- `nftPayment` / `tokenPayment` — Pay with NFTs or SPL tokens

## Deployment

### Vercel (recommended)

```bash
npm i -g vercel
vercel
```

### Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod
```

Set environment variables in your deployment platform matching `.env.example`.

## Key Concepts

### Metaplex Core
The newest NFT standard on Solana. Single-account design makes it ~7.5x cheaper to mint than the legacy Token Metadata standard. Enforced royalties and first-class collection support.

### Core Candy Machine
A minting engine that fairly distributes NFTs with configurable access controls (guards). Supports random or sequential minting, multiple guard groups for tiered launches, and on-chain state tracking.

### Irys (Arweave)
Permanent, decentralized storage for NFT images and metadata. Pay with SOL, store forever on Arweave.

## License

MIT

import Link from "next/link";
import { SITE_NAME, SITE_DESCRIPTION, COLLECTION_SUPPLY, MINT_PRICE } from "@/lib/constants";

export default function Home() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-950/20 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-accent-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] text-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[var(--muted)]">
                Built on Solana with Metaplex Core
              </span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight">
              <span className="gradient-text">{SITE_NAME}</span>
            </h1>

            <p className="mt-6 text-xl text-[var(--muted)] leading-relaxed">
              {SITE_DESCRIPTION}. Powered by Metaplex Core &mdash; the most
              efficient NFT standard on Solana.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/mint" className="btn-primary text-lg px-8 py-4">
                Mint Now
              </Link>
              <a
                href="#about"
                className="btn-secondary text-lg px-8 py-4"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="card text-center">
            <p className="text-4xl font-bold gradient-text">
              {COLLECTION_SUPPLY.toLocaleString()}
            </p>
            <p className="text-[var(--muted)] mt-2">Total Supply</p>
          </div>
          <div className="card text-center">
            <p className="text-4xl font-bold gradient-text">
              {MINT_PRICE > 0 ? `${MINT_PRICE} SOL` : "FREE"}
            </p>
            <p className="text-[var(--muted)] mt-2">Mint Price</p>
          </div>
          <div className="card text-center">
            <p className="text-4xl font-bold gradient-text">Metaplex Core</p>
            <p className="text-[var(--muted)] mt-2">NFT Standard</p>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            How It <span className="gradient-text">Works</span>
          </h2>

          <div className="space-y-8">
            <div className="card flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-lg">Connect Your Wallet</h3>
                <p className="text-[var(--muted)] mt-1">
                  Connect a Solana wallet like Phantom or Solflare to get
                  started. You&apos;ll need a small amount of SOL for
                  transaction fees.
                </p>
              </div>
            </div>

            <div className="card flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-lg">Mint Your NFT</h3>
                <p className="text-[var(--muted)] mt-1">
                  Click the mint button and confirm the transaction. Each NFT is
                  randomly selected from the collection using Metaplex Candy
                  Machine.
                </p>
              </div>
            </div>

            <div className="card flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-lg">Own &amp; Trade</h3>
                <p className="text-[var(--muted)] mt-1">
                  Your NFT is minted as a Metaplex Core asset — the newest and
                  most cost-efficient standard on Solana. Trade on Magic Eden,
                  Tensor, or any Core-compatible marketplace.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24">
        <h2 className="text-3xl font-bold text-center mb-12">
          Built <span className="gradient-text">With</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {[
            { name: "Solana", desc: "L1 Blockchain" },
            { name: "Metaplex Core", desc: "NFT Standard" },
            { name: "Candy Machine", desc: "Minting Engine" },
            { name: "Irys", desc: "Metadata Storage" },
          ].map((tech) => (
            <div
              key={tech.name}
              className="card text-center hover:border-primary-500/30 transition-colors"
            >
              <p className="font-semibold text-sm">{tech.name}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{tech.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--card-border)] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-[var(--muted)]">
          <p>{SITE_NAME} &mdash; Powered by Solana &amp; Metaplex Core</p>
        </div>
      </footer>
    </div>
  );
}

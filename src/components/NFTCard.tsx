"use client";

interface NFTCardProps {
  name: string;
  image?: string;
  mintAddress: string;
}

export default function NFTCard({ name, image, mintAddress }: NFTCardProps) {
  const shortAddress = `${mintAddress.slice(0, 4)}...${mintAddress.slice(-4)}`;

  return (
    <div className="card hover:border-primary-500/50 transition-all duration-300 group">
      <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-primary-900/30 to-accent-900/30 mb-4">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl gradient-text font-bold">NFT</span>
          </div>
        )}
      </div>
      <h3 className="font-semibold truncate">{name}</h3>
      <p className="text-sm text-[var(--muted)] mt-1 font-mono">
        {shortAddress}
      </p>
    </div>
  );
}

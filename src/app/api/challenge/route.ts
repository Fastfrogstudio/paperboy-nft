import { NextResponse } from "next/server";
import { createChallenge } from "nohumanallowed";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");
  const difficulty = Number(searchParams.get("difficulty") || "4");

  if (!wallet) {
    return NextResponse.json(
      { error: "wallet query parameter required" },
      { status: 400 }
    );
  }

  const secret = process.env.NHA_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "NHA_SECRET not configured on server" },
      { status: 500 }
    );
  }

  const challenge = createChallenge({
    difficulty: Math.min(Math.max(difficulty, 1), 6),
    expiresIn: 120,
    secret,
    metadata: {
      action: "mint",
      wallet,
      candyMachineId: process.env.NEXT_PUBLIC_CANDY_MACHINE_ID || "",
    },
  });

  return NextResponse.json(challenge);
}

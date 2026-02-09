import { NextResponse } from "next/server";
import { verifyChallenge, generateToken } from "nohumanallowed";

export async function POST(request: Request) {
  const secret = process.env.NHA_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "NHA_SECRET not configured on server" },
      { status: 500 }
    );
  }

  let body: {
    id: string;
    prefix: string;
    nonce: string;
    target: string;
    expiresAt: number;
    signature?: string;
    wallet: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { id, prefix, nonce, target, expiresAt, signature, wallet } = body;

  if (!prefix || !nonce || !target || !expiresAt || !wallet) {
    return NextResponse.json(
      { error: "Missing required fields: prefix, nonce, target, expiresAt, wallet" },
      { status: 400 }
    );
  }

  const result = verifyChallenge({
    prefix,
    nonce,
    target,
    expiresAt,
    signature,
    secret,
    requireSignature: true,
    metadata: {
      action: "mint",
      wallet,
      candyMachineId: process.env.NEXT_PUBLIC_CANDY_MACHINE_ID || "",
    },
  });

  if (!result.valid) {
    return NextResponse.json(
      { error: "Verification failed", reason: result.reason },
      { status: 403 }
    );
  }

  // Issue a short-lived token the client can use to prove verification
  const token = generateToken(id, secret);

  return NextResponse.json({
    verified: true,
    token,
    hash: result.hash,
  });
}

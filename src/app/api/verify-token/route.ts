import { NextResponse } from "next/server";
import { verifyToken } from "nohumanallowed";

export async function POST(request: Request) {
  const secret = process.env.NHA_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "NHA_SECRET not configured on server" },
      { status: 500 }
    );
  }

  let body: { token: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { token } = body;
  if (!token) {
    return NextResponse.json(
      { error: "Missing token field" },
      { status: 400 }
    );
  }

  const result = verifyToken(token, secret, 300_000, {
    requireSecret: true,
  });

  return NextResponse.json({
    valid: result.valid,
    challengeId: result.challengeId,
  });
}

/**
 * No Human Allowed (NHA) client-side integration.
 *
 * Handles the challenge-response flow:
 * 1. Request challenge from /api/challenge
 * 2. Solve the proof-of-work using Web Crypto API (browser-compatible)
 * 3. Submit solution to /api/verify
 * 4. Return verification token
 */

export interface NHAChallenge {
  id: string;
  prefix: string;
  target: string;
  expiresAt: number;
  signature?: string;
  metadata?: Record<string, unknown>;
}

export interface NHASolveResult {
  found: boolean;
  nonce?: string;
  iterations: number;
  timeMs: number;
  hash?: string;
}

export interface NHAVerifyResponse {
  verified: boolean;
  token: string;
  hash?: string;
}

/**
 * Request a challenge from the server, scoped to a specific wallet.
 */
export async function requestChallenge(
  wallet: string,
  difficulty = 4
): Promise<NHAChallenge> {
  const res = await fetch(
    `/api/challenge?wallet=${encodeURIComponent(wallet)}&difficulty=${difficulty}`
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to get challenge");
  }
  return res.json();
}

/**
 * Solve a proof-of-work challenge using Web Crypto API (browser-compatible).
 * Finds a nonce such that SHA256(prefix + nonce) starts with target.
 */
export async function solveChallenge(
  challenge: NHAChallenge,
  onProgress?: (iterations: number) => void
): Promise<NHASolveResult> {
  const { prefix, target } = challenge;
  const maxIterations = 10_000_000;
  const encoder = new TextEncoder();
  const start = performance.now();

  for (let i = 0; i < maxIterations; i++) {
    const nonce = i.toString();
    const data = encoder.encode(prefix + nonce);
    const buf = new Uint8Array(data).buffer as ArrayBuffer;
    const hashBuffer = await crypto.subtle.digest("SHA-256", buf);
    const hashHex = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (hashHex.startsWith(target)) {
      return {
        found: true,
        nonce,
        iterations: i + 1,
        timeMs: performance.now() - start,
        hash: hashHex,
      };
    }

    if (onProgress && i % 10_000 === 0 && i > 0) {
      onProgress(i);
      // Yield to the event loop to keep UI responsive
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  return {
    found: false,
    iterations: maxIterations,
    timeMs: performance.now() - start,
  };
}

/**
 * Submit a solved challenge for verification and get a mint token.
 */
export async function verifyNHA(
  challenge: NHAChallenge,
  nonce: string,
  wallet: string
): Promise<NHAVerifyResponse> {
  const res = await fetch("/api/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: challenge.id,
      prefix: challenge.prefix,
      nonce,
      target: challenge.target,
      expiresAt: challenge.expiresAt,
      signature: challenge.signature,
      wallet,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || `Verification failed: ${err.reason}`);
  }

  return res.json();
}

/**
 * Full NHA flow: request challenge -> solve -> verify.
 * Returns the verification token on success.
 */
export async function completeNHAVerification(
  wallet: string,
  difficulty = 4,
  onProgress?: (status: string) => void
): Promise<string> {
  onProgress?.("Requesting challenge...");
  const challenge = await requestChallenge(wallet, difficulty);

  onProgress?.("Solving proof-of-work...");
  const result = await solveChallenge(challenge, (iterations) => {
    onProgress?.(`Solving... (${iterations.toLocaleString()} iterations)`);
  });

  if (!result.found || !result.nonce) {
    throw new Error("Failed to solve challenge — max iterations reached");
  }

  onProgress?.(`Solved in ${result.iterations.toLocaleString()} iterations (${result.timeMs.toFixed(0)}ms). Verifying...`);

  const verification = await verifyNHA(challenge, result.nonce, wallet);

  if (!verification.verified) {
    throw new Error("Server rejected the solution");
  }

  onProgress?.("Verified! Ready to mint.");
  return verification.token;
}

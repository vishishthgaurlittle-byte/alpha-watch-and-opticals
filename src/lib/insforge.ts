// ============================================================
// Insforge Backend & Google OAuth Integration Layer
// ============================================================

export const INFORGE = {
  projectId: process.env.INFORGE_PROJECT_ID || "56db6791-86fa-4c7f-9142-29b0211d47c3",
  apiKey: process.env.INFORGE_API_KEY || "",
  url: (process.env.NEXT_PUBLIC_INSFORGE_URL || process.env.INFORGE_URL || "https://4bnre66i.ap-southeast.insforge.app/").replace(/\/$/, ""),
  version: process.env.INFORGE_VERSION || "v2.3.1"
};

export const isInsforgeLive = Boolean(process.env.INFORGE_API_KEY);

/**
 * Constructs the direct Google OAuth authorization URL.
 * Routes directly to Insforge backend OAuth endpoint or the local Next.js API route.
 */
export function getGoogleOAuthUrl(nextUrl: string = "/account"): string {
  if (typeof window === "undefined") return "/api/auth/google";
  
  const redirectUri = `${window.location.origin}/auth/callback`;
  const backendUrl = INFORGE.url || window.location.origin;
  
  return `${backendUrl}/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(nextUrl)}`;
}

export async function insforgeFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${INFORGE.url}${path.startsWith("/") ? "" : "/"}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": INFORGE.apiKey,
      ...(init?.headers || {})
    }
  });
  if (!res.ok) throw new Error(`Insforge request failed: ${res.status}`);
  return res.json();
}

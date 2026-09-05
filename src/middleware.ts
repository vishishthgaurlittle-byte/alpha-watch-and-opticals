import { NextRequest, NextResponse } from "next/server";

const AUTH_SECRET = process.env.AUTH_SECRET || "alpha_secure_jwt_session_secret_key_2026_production";

async function verifyJwtInEdge(token: string): Promise<{ id: string; email: string; name: string; role: string } | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const enc = new TextEncoder();

    // Verify signature using HMAC SHA-256 with Web Crypto
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(AUTH_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const data = enc.encode(`${headerB64}.${payloadB64}`);
    // base64url to base64
    const b64 = signatureB64.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "=");
    const signatureBytes = Uint8Array.from(atob(pad), (c) => c.charCodeAt(0));

    const isValid = await crypto.subtle.verify("HMAC", key, signatureBytes, data);
    if (!isValid) return null;

    // Decode payload
    const payloadPad = payloadB64.replace(/-/g, "+").replace(/_/g, "/").padEnd(payloadB64.length + ((4 - (payloadB64.length % 4)) % 4), "=");
    const payloadStr = atob(payloadPad);
    const payload = JSON.parse(payloadStr);

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("aw_session")?.value;

  let session: { id: string; email: string; name: string; role: string } | null = null;

  if (token) {
    session = await verifyJwtInEdge(token);
  }

  // 1. Admin route protection
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "admin") {
      return new NextResponse(
        `<!DOCTYPE html>
        <html lang="en">
          <head><title>403 Forbidden - Alpha Watch & Opticals</title></head>
          <body style="font-family:serif;background:#0b162c;color:#faf8f5;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;">
            <h1 style="color:#d4af37;font-size:3rem;margin-bottom:0.5rem;">403</h1>
            <h2>Access Forbidden</h2>
            <p style="color:#ffffffaa;">You do not have administrative privileges to access this area.</p>
            <a href="/" style="color:#d4af37;margin-top:1.5rem;text-decoration:underline;">Return to Store</a>
          </body>
        </html>`,
        { status: 403, headers: { "Content-Type": "text/html" } }
      );
    }
  }

  // 2. Customer protected routes
  if (pathname.startsWith("/account") || pathname.startsWith("/checkout")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/account", "/checkout/:path*", "/checkout"]
};

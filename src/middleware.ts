import { NextRequest, NextResponse } from "next/server";

const AUTH_SECRET = process.env.AUTH_SECRET || "alpha_secure_jwt_session_secret_key_2026_production";

async function verifyJwtInEdge(
  token: string
): Promise<{ sub: string; id: string; email: string; name: string; role: string; avatar?: string } | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const enc = new TextEncoder();

    // Verify signature using HMAC SHA-256 with Web Crypto (Edge-compatible)
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
    const payloadPad = payloadB64
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(payloadB64.length + ((4 - (payloadB64.length % 4)) % 4), "=");
    const payloadStr = atob(payloadPad);
    const payload = JSON.parse(payloadStr);

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    const userId = payload.sub || payload.id;
    if (!userId) return null;

    return {
      sub: userId,
      id: userId,
      email: payload.email,
      name: payload.name,
      role: payload.role || "customer",
      avatar: payload.avatar
    };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const token = request.cookies.get("aw_session")?.value;

  let session: { sub: string; id: string; email: string; name: string; role: string; avatar?: string } | null = null;

  if (token) {
    session = await verifyJwtInEdge(token);
  }

  // 1. Authenticated users hitting /login or /register -> redirect to target or account/admin
  if (pathname === "/login" || pathname === "/register") {
    if (session) {
      const nextParam = searchParams.get("next");
      const target = nextParam && nextParam.startsWith("/") ? nextParam : session.role === "admin" ? "/admin" : "/account";
      return NextResponse.redirect(new URL(target, request.url));
    }
    return NextResponse.next();
  }

  // 2. Admin route protection
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "admin") {
      const accountUrl = new URL("/account", request.url);
      return NextResponse.redirect(accountUrl);
    }
  }

  // 3. Customer protected routes
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
  matcher: [
    "/admin/:path*",
    "/admin",
    "/account/:path*",
    "/account",
    "/checkout/:path*",
    "/checkout",
    "/login",
    "/register"
  ]
};

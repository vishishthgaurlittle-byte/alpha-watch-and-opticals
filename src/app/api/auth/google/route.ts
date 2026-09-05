import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state") || "/account";
  const redirectUri = searchParams.get("redirect_uri") || `${request.nextUrl.origin}/auth/callback`;

  const googleClientId = process.env.GOOGLE_CLIENT_ID;

  if (googleClientId && googleClientId !== "your-google-oauth-client-id") {
    // Real Google OAuth 2.0 Authorization URL
    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", googleClientId);
    googleAuthUrl.searchParams.set("redirect_uri", `${request.nextUrl.origin}/api/auth/callback/google`);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    googleAuthUrl.searchParams.set("state", JSON.stringify({ next: state, redirect_uri: redirectUri }));
    googleAuthUrl.searchParams.set("access_type", "offline");
    googleAuthUrl.searchParams.set("prompt", "select_account");

    return NextResponse.redirect(googleAuthUrl.toString());
  }

  // Fallback interactive Google OAuth selector when client ID is not configured in environment
  const fallbackUrl = new URL("/auth/google-select", request.url);
  fallbackUrl.searchParams.set("state", state);
  fallbackUrl.searchParams.set("redirect_uri", redirectUri);

  return NextResponse.redirect(fallbackUrl.toString());
}

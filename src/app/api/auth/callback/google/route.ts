import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const stateRaw = searchParams.get("state") || "";

  let nextUrl = "/account";
  let clientRedirectUri = `${request.nextUrl.origin}/auth/callback`;

  try {
    const parsed = JSON.parse(stateRaw);
    if (parsed.next) nextUrl = parsed.next;
    if (parsed.redirect_uri) clientRedirectUri = parsed.redirect_uri;
  } catch {
    if (stateRaw.startsWith("/")) nextUrl = stateRaw;
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (code && googleClientId && googleClientSecret) {
    try {
      // 1. Exchange code for access token
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: googleClientId,
          client_secret: googleClientSecret,
          redirect_uri: `${request.nextUrl.origin}/api/auth/callback/google`,
          grant_type: "authorization_code"
        })
      });

      const tokenData = await tokenRes.json();

      if (tokenData.access_token) {
        // 2. Fetch Google profile info
        const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });
        const profile = await userRes.json();

        // 3. Redirect to client callback with profile params
        const target = new URL("/auth/callback", request.url);
        target.searchParams.set("email", profile.email || "");
        target.searchParams.set("name", profile.name || profile.email?.split("@")[0] || "Customer");
        target.searchParams.set("picture", profile.picture || "");
        target.searchParams.set("next", nextUrl);

        return NextResponse.redirect(target.toString());
      }
    } catch (err) {
      console.error("Google OAuth token exchange error:", err);
    }
  }

  // Fallback if error or missing credentials
  const target = new URL(nextUrl, request.url);
  return NextResponse.redirect(target.toString());
}

import { NextResponse } from "next/server";
import { getCurrentUser, clearServerSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }
    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar || null
        }
      },
      { status: 200 }
    );
  } catch (e) {
    console.warn("GET /api/auth/me error fallback:", e);
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }
}

export async function POST() {
  await clearServerSession();
  return NextResponse.json({ ok: true, message: "Logged out successfully" }, { status: 200 });
}

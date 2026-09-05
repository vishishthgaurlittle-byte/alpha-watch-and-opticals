import { NextResponse } from "next/server";
import { clearServerSession, getCurrentUser } from "@/lib/auth";

export async function POST() {
  await clearServerSession();
  return NextResponse.json({ success: true, message: "Logged out successfully" });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null });
  }
  return NextResponse.json({ authenticated: true, user });
}

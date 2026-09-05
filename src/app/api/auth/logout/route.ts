import { NextResponse } from "next/server";
import { clearServerSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  await clearServerSession();
  return NextResponse.json({ ok: true, message: "Logged out successfully" }, { status: 200 });
}

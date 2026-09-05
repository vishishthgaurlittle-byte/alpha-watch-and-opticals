import { NextResponse } from "next/server";
import { getCurrentUser } from "./auth";

export async function requireAdmin() {
  const user = await getCurrentUser();
  const adminEmail = (process.env.ADMIN_EMAIL || "vishishthgaurlittle@gmail.com").toLowerCase().trim();

  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    };
  }

  const isOwnerAdmin = user.email?.toLowerCase().trim() === adminEmail || user.role === "admin";
  if (!isOwnerAdmin) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    };
  }

  return { authorized: true, user: { ...user, role: "admin" } };
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "./auth";

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    };
  }
  return { authorized: true, user };
}

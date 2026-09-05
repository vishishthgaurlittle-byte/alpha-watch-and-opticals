import { NextRequest, NextResponse } from "next/server";
import { InsForgeDatabase } from "@insforge/database";
import { loginGoogle } from "@/lib/db";

const db = new InsForgeDatabase({
  projectId: process.env.NEXT_PUBLIC_INSFORGE_PROJECT_ID,
  apiKey: process.env.NEXT_PUBLIC_INSFORGE_API_KEY
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, name, email, photoURL, provider } = body;

    const userData = {
      uid,
      name,
      email,
      photoURL,
      provider: provider || "google",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    // 1. Sync to InsForge Remote Database
    await db.collection("users").doc(uid || `u_${Date.now()}`).set(userData, { merge: true });

    // 2. Sync to local persistent DB layer
    if (email) {
      loginGoogle({ email, name: name || email.split("@")[0], picture: photoURL });
    }

    return NextResponse.json({ success: true, message: "User created successfully", user: userData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to create user" }, { status: 500 });
  }
}

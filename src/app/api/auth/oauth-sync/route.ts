import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { setServerSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, avatar, id } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanName = (typeof name === "string" && name.trim()) || normalizedEmail.split("@")[0];

    // Find or create user in database
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    let user;
    if (existing) {
      user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: cleanName,
          ...(avatar ? { avatar } : {})
        }
      });
    } else {
      user = await prisma.user.create({
        data: {
          id: id || undefined,
          email: normalizedEmail,
          name: cleanName,
          avatar: avatar || null,
          role: "customer",
          provider: "google"
        }
      });
    }

    if (user.blocked) {
      return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    }

    // Set server session cookie
    await setServerSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err: any) {
    console.error("OAuth sync error:", err);
    return NextResponse.json({ error: "OAuth synchronization failed" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, setServerSession } from "@/lib/auth";

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
  } catch {
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, email, name, avatar } = body;

    if (!id || !email) {
      return NextResponse.json({ error: "Missing user id or email" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const adminEmail = (process.env.ADMIN_EMAIL || "vishishthgaurlittle@gmail.com").toLowerCase();
    const role = normalizedEmail === adminEmail ? "admin" : "customer";
    const displayName = name || normalizedEmail.split("@")[0] || "Customer";

    await setServerSession({
      id,
      email: normalizedEmail,
      name: displayName,
      role,
      avatar: avatar || null
    });

    try {
      await prisma.user.upsert({
        where: { id },
        update: {
          name: displayName,
          email: normalizedEmail,
          role,
          avatar: avatar || null
        },
        create: {
          id,
          name: displayName,
          email: normalizedEmail,
          role,
          avatar: avatar || null
        }
      });
    } catch (dbErr) {
      console.warn("Prisma session upsert warning (non-fatal):", dbErr);
    }

    return NextResponse.json(
      {
        ok: true,
        user: {
          id,
          name: displayName,
          email: normalizedEmail,
          role,
          avatar: avatar || null
        }
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Session sync error:", err);
    return NextResponse.json({ error: err.message || "Failed to create session" }, { status: 500 });
  }
}

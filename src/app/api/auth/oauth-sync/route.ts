import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { setServerSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, email, name, avatar } = body;

    if (!id || !email) {
      return NextResponse.json({ error: "Missing required auth fields" }, { status: 400 });
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
      console.warn("Prisma oauth sync warning (non-fatal):", dbErr);
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
    console.error("OAuth sync error:", err);
    return NextResponse.json({ error: err.message || "OAuth sync failed" }, { status: 500 });
  }
}

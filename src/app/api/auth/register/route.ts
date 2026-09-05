import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { insforge } from "@/lib/insforge";
import { setServerSession } from "@/lib/auth";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(80),
    email: z.string().email("Invalid email address"),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number")
      .optional()
      .or(z.literal("")),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().optional()
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid registration data" },
        { status: 400 }
      );
    }

    const { name, email, phone, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Authenticate with InsForge User Service
    const { data, error } = await insforge.auth.signUp({
      email: normalizedEmail,
      password,
      name: name.trim()
    });

    if (error) {
      const errMsg = error.message || "";
      const isDuplicate =
        (error as any).error === "AUTH_EMAIL_EXISTS" ||
        (error as any).statusCode === 409 ||
        errMsg.toLowerCase().includes("exists") ||
        errMsg.toLowerCase().includes("duplicate") ||
        errMsg.toLowerCase().includes("already registered");

      if (isDuplicate) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please login." },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: error.message || "Failed to create account" },
        { status: 400 }
      );
    }

    // 2. Email verification check
    if (data?.requireEmailVerification) {
      return NextResponse.json(
        {
          ok: true,
          needsVerification: true,
          message: "Check your email to verify, then login."
        },
        { status: 201 }
      );
    }

    if (!data?.user) {
      return NextResponse.json(
        { error: "Account creation did not return a user record." },
        { status: 400 }
      );
    }

    const insforgeUser = data.user;
    const adminEmail = (process.env.ADMIN_EMAIL || "vishishthgaurlittle@gmail.com").toLowerCase();
    const role = normalizedEmail === adminEmail ? "admin" : "customer";
    const displayName = (insforgeUser as any).profile?.name || name.trim() || normalizedEmail.split("@")[0];
    const avatar = (insforgeUser as any).profile?.avatar_url || null;

    // 3. Set HttpOnly JWT Session Cookie
    await setServerSession({
      id: insforgeUser.id,
      email: normalizedEmail,
      name: displayName,
      role,
      avatar
    });

    // 4. Mirror profile to Prisma (best-effort; failures must never block 200 response)
    try {
      await prisma.user.upsert({
        where: { id: insforgeUser.id },
        update: {
          name: displayName,
          email: normalizedEmail,
          phone: phone || null,
          role,
          avatar
        },
        create: {
          id: insforgeUser.id,
          name: displayName,
          email: normalizedEmail,
          phone: phone || null,
          role,
          avatar
        }
      });
    } catch (dbErr) {
      console.warn("Prisma user mirror warning (non-fatal):", dbErr);
    }

    return NextResponse.json(
      {
        ok: true,
        success: true,
        user: {
          id: insforgeUser.id,
          name: displayName,
          email: normalizedEmail,
          role,
          avatar
        }
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Registration unhandled error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred during registration." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  hp: z.string().optional()
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown-ip";
    if (!rateLimit(ip, 5, 3600000)) {
      return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
    }

    const body = await req.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid email" },
        { status: 400 }
      );
    }

    if (parsed.data.hp) {
      return NextResponse.json({ success: true, message: "Subscribed" });
    }

    const email = parsed.data.email.toLowerCase().trim();

    await prisma.subscriber.upsert({
      where: { email },
      update: {},
      create: { email }
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for subscribing to Alpha Watch & Opticals updates!"
    });
  } catch (err: any) {
    console.error("Subscribe error:", err);
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again later." },
      { status: 500 }
    );
  }
}

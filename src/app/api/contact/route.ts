import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { sendShopNotification } from "@/lib/mailer";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  message: z.string().min(5, "Message must be at least 5 characters").max(1000),
  hp: z.string().optional() // Honeypot field
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown-ip";
    if (!rateLimit(ip, 5, 3600000)) {
      return NextResponse.json(
        { error: "Too many messages sent. Please try again after an hour." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid contact form submission" },
        { status: 400 }
      );
    }

    // Check honeypot
    if (parsed.data.hp) {
      return NextResponse.json({ success: true, message: "Message received" });
    }

    const { name, phone, email, message } = parsed.data;

    // Persist to database
    const saved = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim().toLowerCase() : null,
        message: message.trim()
      }
    });

    // Send email notification to store owner
    await sendShopNotification(
      `New Customer Message from ${name}`,
      `<h3>New Contact Message</h3>
       <p><strong>Name:</strong> ${name}</p>
       <p><strong>Phone:</strong> ${phone}</p>
       <p><strong>Email:</strong> ${email || "Not provided"}</p>
       <p><strong>Message:</strong><br/>${message.replace(/\n/g, "<br/>")}</p>`
    );

    return NextResponse.json({
      success: true,
      message: "Message sent successfully! Our team will get back to you shortly.",
      id: saved.id
    });
  } catch (err: any) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "Unable to send message right now. Please call our store directly." },
      { status: 500 }
    );
  }
}

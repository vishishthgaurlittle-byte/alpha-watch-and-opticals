import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { sendShopNotification } from "@/lib/mailer";

const appointmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  serviceType: z.string().min(2, "Please select a service"),
  preferredDate: z.string().min(2, "Please select a preferred date"),
  hp: z.string().optional() // Honeypot field
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown-ip";
    if (!rateLimit(ip, 5, 3600000)) {
      return NextResponse.json(
        { error: "Too many appointment requests. Please call our store directly." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = appointmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid appointment request" },
        { status: 400 }
      );
    }

    if (parsed.data.hp) {
      return NextResponse.json({ success: true, message: "Appointment request received" });
    }

    const { name, phone, email, serviceType, preferredDate } = parsed.data;

    const saved = await prisma.appointment.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim().toLowerCase() : null,
        serviceType: serviceType.trim(),
        preferredDate: preferredDate.trim()
      }
    });

    await sendShopNotification(
      `New In-Store Service Appointment: ${serviceType} (${name})`,
      `<h3>New Service Appointment Request</h3>
       <p><strong>Customer Name:</strong> ${name}</p>
       <p><strong>Phone:</strong> ${phone}</p>
       <p><strong>Email:</strong> ${email || "Not provided"}</p>
       <p><strong>Service Requested:</strong> ${serviceType}</p>
       <p><strong>Preferred Date:</strong> ${preferredDate}</p>`
    );

    return NextResponse.json({
      success: true,
      message: "Appointment request submitted successfully! We will call to confirm your slot.",
      id: saved.id
    });
  } catch (err: any) {
    console.error("Appointment API error:", err);
    return NextResponse.json(
      { error: "Failed to book appointment. Please contact us via phone." },
      { status: 500 }
    );
  }
}

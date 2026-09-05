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
        { error: "Too many appointment requests. Please call our store directly at +91 90444 77735." },
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

    let savedId = `appt-${Date.now()}`;
    try {
      const saved = await prisma.appointment.create({
        data: {
          name: name.trim(),
          phone: phone.trim(),
          email: email ? email.trim().toLowerCase() : null,
          serviceType: serviceType.trim(),
          preferredDate: preferredDate.trim()
        }
      });
      savedId = saved.id;
    } catch (dbErr) {
      console.warn("Database appointment creation failed:", dbErr);
      return NextResponse.json(
        { error: "Service temporarily unavailable. Please call +91 90444 77735 to book directly." },
        { status: 503 }
      );
    }

    sendShopNotification(
      `New In-Store Service Appointment: ${serviceType} (${name})`,
      `<h3>New Service Appointment Request</h3>
       <p><strong>Customer Name:</strong> ${name}</p>
       <p><strong>Phone:</strong> ${phone}</p>
       <p><strong>Email:</strong> ${email || "Not provided"}</p>
       <p><strong>Service Requested:</strong> ${serviceType}</p>
       <p><strong>Preferred Date:</strong> ${preferredDate}</p>`
    ).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Appointment request submitted successfully! We will call to confirm your slot.",
      id: savedId
    });
  } catch (err: any) {
    console.error("Appointment API error:", err);
    return NextResponse.json(
      { error: "Service temporarily unavailable. Please call +91 90444 77735 to book directly." },
      { status: 503 }
    );
  }
}

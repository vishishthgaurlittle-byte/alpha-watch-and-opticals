import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getSetting, setSetting } from "@/lib/db";

const DEFAULT_UPI_ID = "9044477735@upi";
const DEFAULT_PAYEE_NAME = "Mohd. Shoeb - Alpha Watch & Opticals";
const DEFAULT_INSTRUCTIONS =
  "1. Scan the QR code using Google Pay, PhonePe, Paytm, or BHIM.\n2. Pay the exact order amount.\n3. Enter the 12-digit UTR/Reference number and upload your transaction screenshot.\n4. Our team will verify and dispatch your order promptly.";
const DEFAULT_BANK_DETAILS =
  "Bank: State Bank of India\nAccount Name: Mohd. Shoeb\nA/C No: Available on request\nIFSC: SBIN0000164\nBranch: Raebareli Main Branch";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const upiId = getSetting("upiId", DEFAULT_UPI_ID);
    const upiPayeeName = getSetting("upiPayeeName", DEFAULT_PAYEE_NAME);
    const upiQrImage = getSetting("upiQrImage", "");
    const upiEnabled = getSetting("upiEnabled", "true") !== "false";
    const upiInstructions = getSetting("upiInstructions", DEFAULT_INSTRUCTIONS);
    const bankDetails = getSetting("bankDetails", DEFAULT_BANK_DETAILS);

    return NextResponse.json({
      upiId,
      upiPayeeName,
      upiQrImage,
      upiEnabled,
      upiInstructions,
      bankDetails
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to read payment settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();

    if (body.upiId !== undefined) {
      setSetting("upiId", String(body.upiId).trim());
    }
    if (body.upiPayeeName !== undefined) {
      setSetting("upiPayeeName", String(body.upiPayeeName).trim());
    }
    if (body.upiQrImage !== undefined) {
      setSetting("upiQrImage", String(body.upiQrImage).trim());
    }
    if (body.upiEnabled !== undefined) {
      setSetting("upiEnabled", body.upiEnabled ? "true" : "false");
    }
    if (body.upiInstructions !== undefined) {
      setSetting("upiInstructions", String(body.upiInstructions).trim());
    }
    if (body.bankDetails !== undefined) {
      setSetting("bankDetails", String(body.bankDetails).trim());
    }

    return NextResponse.json({
      success: true,
      message: "Payment settings updated successfully! New UPI details are now active on checkout.",
      settings: {
        upiId: getSetting("upiId", DEFAULT_UPI_ID),
        upiPayeeName: getSetting("upiPayeeName", DEFAULT_PAYEE_NAME),
        upiQrImage: getSetting("upiQrImage", ""),
        upiEnabled: getSetting("upiEnabled", "true") !== "false",
        upiInstructions: getSetting("upiInstructions", DEFAULT_INSTRUCTIONS),
        bankDetails: getSetting("bankDetails", DEFAULT_BANK_DETAILS)
      }
    });
  } catch (err: any) {
    console.error("Payment settings update error:", err);
    return NextResponse.json({ error: "Failed to update payment settings" }, { status: 500 });
  }
}

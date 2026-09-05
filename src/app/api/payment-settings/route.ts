import { NextResponse } from "next/server";
import { getSetting } from "@/lib/db";

const DEFAULT_UPI_ID = "9044477735@upi";
const DEFAULT_PAYEE_NAME = "Mohd. Shoeb - Alpha Watch & Opticals";
const DEFAULT_INSTRUCTIONS =
  "1. Scan the QR code using Google Pay, PhonePe, Paytm, or BHIM.\n2. Pay the exact order amount.\n3. Enter the 12-digit UTR/Reference number and upload your transaction screenshot.\n4. Our team will verify and dispatch your order promptly.";
const DEFAULT_BANK_DETAILS =
  "Bank: State Bank of India\nAccount Name: Mohd. Shoeb\nA/C No: Available on request\nIFSC: SBIN0000164\nBranch: Raebareli Main Branch";

export async function GET() {
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
    return NextResponse.json({
      upiId: DEFAULT_UPI_ID,
      upiPayeeName: DEFAULT_PAYEE_NAME,
      upiQrImage: "",
      upiEnabled: true,
      upiInstructions: DEFAULT_INSTRUCTIONS,
      bankDetails: DEFAULT_BANK_DETAILS
    });
  }
}

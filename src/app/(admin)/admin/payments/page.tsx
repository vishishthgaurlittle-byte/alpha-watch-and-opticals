"use client";
import { useEffect, useState } from "react";
import { formatINR, dateFmt } from "@/lib/site";
import { toast } from "@/store/ui";

interface PaymentRecord {
  id: string;
  orderNumber: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  total: number;
  deliveryMethod: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  upiTransactionId?: string | null;
  paymentProofUrl?: string | null;
  paymentAdminNote?: string | null;
  createdAt: string;
  items?: any[];
}

interface PaymentSettings {
  upiId: string;
  upiPayeeName: string;
  upiQrImage: string;
  upiEnabled: boolean;
  upiInstructions: string;
  bankDetails: string;
}

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState<"proofs" | "settings">("proofs");
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [stats, setStats] = useState<any>({
    totalPayments: 0,
    pendingProofs: 0,
    approvedPayments: 0,
    rejectedPayments: 0,
    pendingPayments: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedProof, setSelectedProof] = useState<PaymentRecord | null>(null);

  // Settings state
  const [settings, setSettings] = useState<PaymentSettings>({
    upiId: "9044477735@upi",
    upiPayeeName: "Mohd. Shoeb - Alpha Watch & Opticals",
    upiQrImage: "",
    upiEnabled: true,
    upiInstructions:
      "1. Scan the QR code using Google Pay, PhonePe, Paytm, or BHIM.\n2. Pay the exact order amount.\n3. Enter the 12-digit UTR/Reference number and upload your transaction screenshot.\n4. Our team will verify and dispatch your order promptly.",
    bankDetails:
      "Bank: State Bank of India\nAccount Name: Mohd. Shoeb\nA/C No: Available on request\nIFSC: SBIN0000164\nBranch: Raebareli Main Branch"
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch payments
  const fetchPayments = async () => {
    try {
      const res = await fetch("/api/admin/payments");
      const data = await res.json();
      if (res.ok) {
        setPayments(data.payments || []);
        if (data.stats) setStats(data.stats);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  // Fetch settings
  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/payment-settings");
      const data = await res.json();
      if (res.ok) {
        setSettings({
          upiId: data.upiId || "9044477735@upi",
          upiPayeeName: data.upiPayeeName || "Mohd. Shoeb - Alpha Watch & Opticals",
          upiQrImage: data.upiQrImage || "",
          upiEnabled: data.upiEnabled !== false,
          upiInstructions: data.upiInstructions || "",
          bankDetails: data.bankDetails || ""
        });
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/payment-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update settings");
      toast("Payment settings saved successfully! ✓");
    } catch (err: any) {
      toast(err.message || "Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleUpdateStatus = async (
    orderId: string,
    newPaymentStatus: "approved" | "rejected" | "paid" | "pending",
    adminNote?: string
  ) => {
    setActionLoading(orderId);
    try {
      const res = await fetch(`/api/admin/payments/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentStatus: newPaymentStatus,
          adminNote: adminNote || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update payment status");

      toast(
        newPaymentStatus === "approved" || newPaymentStatus === "paid"
          ? "Payment Approved & Order Confirmed ✓"
          : `Payment marked as ${newPaymentStatus} ✓`
      );
      if (selectedProof?.id === orderId) {
        setSelectedProof(null);
      }
      await fetchPayments();
    } catch (err: any) {
      toast(err.message || "Could not update payment status");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (filter === "proofs") return p.paymentStatus === "proof_submitted";
    if (filter === "approved") return p.paymentStatus === "approved" || p.paymentStatus === "paid";
    if (filter === "pending") return p.paymentStatus === "pending";
    if (filter === "rejected") return p.paymentStatus === "rejected";
    return true;
  });

  // Generated dynamic QR URL
  const dynamicQrCode = settings.upiQrImage
    ? settings.upiQrImage
    : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
        `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.upiPayeeName)}&cu=INR`
      )}`;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-navy">Payments &amp; UPI Management</h1>
          <p className="text-navy/50 text-sm">
            Review customer UPI payment proofs, verify transactions, and edit shop payment settings
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-navy/5 p-1 rounded-2xl border border-navy/10 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("proofs")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "proofs" ? "bg-white text-navy shadow-sm" : "text-navy/60 hover:text-navy"
            }`}
          >
            <span>💳 Payment Approvals</span>
            {stats.pendingProofs > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {stats.pendingProofs}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "settings" ? "bg-white text-navy shadow-sm" : "text-navy/60 hover:text-navy"
            }`}
          >
            <span>⚙️ Payment Settings &amp; QR</span>
          </button>
        </div>
      </div>

      {activeTab === "proofs" ? (
        <div>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div
              onClick={() => setFilter("proofs")}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                filter === "proofs"
                  ? "bg-amber-50 border-amber-300 ring-2 ring-amber-400"
                  : "bg-white border-navy/5 hover:border-amber-200"
              }`}
            >
              <div className="text-xl mb-1">⏳</div>
              <div className="text-2xl font-bold text-amber-700">{stats.pendingProofs}</div>
              <div className="text-xs font-semibold text-amber-800">Awaiting Verification</div>
              <div className="text-[11px] text-amber-600 mt-0.5">UPI screenshot uploaded</div>
            </div>

            <div
              onClick={() => setFilter("approved")}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                filter === "approved"
                  ? "bg-emerald/10 border-emerald ring-2 ring-emerald/30"
                  : "bg-white border-navy/5 hover:border-emerald/30"
              }`}
            >
              <div className="text-xl mb-1">✅</div>
              <div className="text-2xl font-bold text-emerald">{stats.approvedPayments}</div>
              <div className="text-xs font-semibold text-emerald-800">Approved / Paid</div>
              <div className="text-[11px] text-emerald-600 mt-0.5">Verified transactions</div>
            </div>

            <div
              onClick={() => setFilter("pending")}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                filter === "pending"
                  ? "bg-blue-50 border-blue-300 ring-2 ring-blue-300"
                  : "bg-white border-navy/5 hover:border-blue-200"
              }`}
            >
              <div className="text-xl mb-1">🛒</div>
              <div className="text-2xl font-bold text-navy">{stats.pendingPayments}</div>
              <div className="text-xs font-semibold text-navy/70">Pending Payment</div>
              <div className="text-[11px] text-navy/50 mt-0.5">Awaiting proof upload</div>
            </div>

            <div
              onClick={() => setFilter("all")}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                filter === "all"
                  ? "bg-navy/5 border-navy/30 ring-2 ring-navy/20"
                  : "bg-white border-navy/5 hover:border-navy/20"
              }`}
            >
              <div className="text-xl mb-1">🧾</div>
              <div className="text-2xl font-bold text-navy">{stats.totalPayments}</div>
              <div className="text-xs font-semibold text-navy/70">Total Orders</div>
              <div className="text-[11px] text-navy/50 mt-0.5">All customer orders</div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
            <span className="text-xs text-navy/50 font-medium">Filter:</span>
            {[
              { id: "all", label: "All Orders" },
              { id: "proofs", label: `Awaiting Verification (${stats.pendingProofs})` },
              { id: "approved", label: "Approved / Paid" },
              { id: "pending", label: "Pending Payment" },
              { id: "rejected", label: "Rejected" }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  filter === f.id
                    ? "bg-navy text-white font-semibold"
                    : "bg-white border border-navy/10 text-navy/70 hover:border-gold"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Table of Payments */}
          <div className="bg-white rounded-2xl p-5 border border-navy/5 shadow-sm overflow-x-auto">
            {loading ? (
              <div className="py-12 text-center text-navy/50 text-sm">Loading payment records...</div>
            ) : filteredPayments.length === 0 ? (
              <div className="py-12 text-center text-navy/50 text-sm">
                No payment records matching the selected filter.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-navy/50 text-left border-b border-navy/10">
                    <th className="py-3 font-medium">Order #</th>
                    <th className="py-3 font-medium">Customer</th>
                    <th className="py-3 font-medium">Amount</th>
                    <th className="py-3 font-medium">UPI / UTR Ref</th>
                    <th className="py-3 font-medium">Proof Screenshot</th>
                    <th className="py-3 font-medium">Payment Status</th>
                    <th className="py-3 font-medium text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p) => {
                    const isProofSubmitted = p.paymentStatus === "proof_submitted";
                    const isApproved = p.paymentStatus === "approved" || p.paymentStatus === "paid";
                    const isRejected = p.paymentStatus === "rejected";

                    return (
                      <tr key={p.id} className={`border-b border-navy/5 ${isProofSubmitted ? "bg-amber-50/40" : ""}`}>
                        {/* Order Number */}
                        <td className="py-4">
                          <div className="font-bold text-navy">#{p.orderNumber}</div>
                          <div className="text-[11px] text-navy/40">{dateFmt(p.createdAt)}</div>
                        </td>

                        {/* Customer */}
                        <td className="py-4">
                          <div className="font-medium text-navy">{p.userName}</div>
                          <div className="text-xs text-navy/60">{p.userPhone}</div>
                          <div className="text-[11px] text-navy/40 truncate max-w-[150px]">{p.userEmail}</div>
                        </td>

                        {/* Amount */}
                        <td className="py-4">
                          <div className="font-bold text-navy">{formatINR(p.total)}</div>
                          <div className="text-[11px] text-navy/50 capitalize">
                            {p.deliveryMethod === "pickup" ? "🏬 Store Pickup" : "🚚 Delivery"}
                          </div>
                        </td>

                        {/* UTR / Ref */}
                        <td className="py-4">
                          {p.upiTransactionId ? (
                            <span className="font-mono bg-navy/5 text-navy px-2 py-1 rounded text-xs select-all">
                              {p.upiTransactionId}
                            </span>
                          ) : (
                            <span className="text-navy/40 text-xs italic">— None —</span>
                          )}
                        </td>

                        {/* Proof Image */}
                        <td className="py-4">
                          {p.paymentProofUrl ? (
                            <button
                              onClick={() => setSelectedProof(p)}
                              className="group relative w-12 h-12 rounded-lg overflow-hidden border-2 border-gold/40 hover:border-gold transition block shadow-sm"
                              title="Click to view full screenshot"
                            >
                              <img src={p.paymentProofUrl} alt="Payment Proof" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs transition">
                                🔍
                              </div>
                            </button>
                          ) : (
                            <span className="text-xs text-navy/40 italic">No proof uploaded</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize inline-block ${
                              isApproved
                                ? "bg-emerald/10 text-emerald"
                                : isProofSubmitted
                                ? "bg-amber-100 text-amber-800 animate-pulse"
                                : isRejected
                                ? "bg-red-50 text-red-600"
                                : "bg-navy/5 text-navy/60"
                            }`}
                          >
                            {isProofSubmitted
                              ? "⏳ Needs Approval"
                              : isApproved
                              ? "✓ Approved / Paid"
                              : isRejected
                              ? "✕ Rejected"
                              : "Pending Payment"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 text-right whitespace-nowrap">
                          {isProofSubmitted ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                disabled={actionLoading === p.id}
                                onClick={() => handleUpdateStatus(p.id, "approved")}
                                className="bg-emerald text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-emerald-700 transition shadow-xs disabled:opacity-50"
                              >
                                {actionLoading === p.id ? "..." : "✓ Approve"}
                              </button>
                              <button
                                disabled={actionLoading === p.id}
                                onClick={() => {
                                  const reason = prompt("Enter reason for rejection (optional):", "Invalid UTR / Payment not received");
                                  if (reason !== null) {
                                    handleUpdateStatus(p.id, "rejected", reason);
                                  }
                                }}
                                className="border border-red-300 text-red-600 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-red-50 transition disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          ) : isApproved ? (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-xs text-emerald font-semibold">Verified</span>
                              <button
                                onClick={() => handleUpdateStatus(p.id, "pending")}
                                className="text-[11px] text-navy/40 hover:underline"
                              >
                                Reset
                              </button>
                            </div>
                          ) : (
                            <button
                              disabled={actionLoading === p.id}
                              onClick={() => handleUpdateStatus(p.id, "approved")}
                              className="text-gold-700 text-xs font-semibold hover:underline"
                            >
                              Mark as Paid
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        /* Settings Tab */
        <div className="grid lg:grid-cols-3 gap-6">
          <form
            onSubmit={handleSaveSettings}
            className="lg:col-span-2 bg-white rounded-2xl p-6 md:p-8 border border-navy/5 shadow-sm space-y-5"
          >
            <h2 className="font-serif text-xl font-bold text-navy border-b border-navy/10 pb-3">
              Configure Shop UPI Payment
            </h2>

            <div>
              <label className="text-xs font-semibold text-navy/70 block mb-1.5">Shop UPI ID (VPA) *</label>
              <input
                required
                value={settings.upiId}
                onChange={(e) => setSettings({ ...settings, upiId: e.target.value.trim() })}
                placeholder="e.g. 9044477735@upi or shoeb.alpha@okhdfcbank"
                className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15 font-mono"
              />
              <p className="text-[11px] text-navy/50 mt-1">
                This UPI ID is displayed to customers on the checkout and payment pages.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-navy/70 block mb-1.5">Payee Display Name *</label>
              <input
                required
                value={settings.upiPayeeName}
                onChange={(e) => setSettings({ ...settings, upiPayeeName: e.target.value })}
                placeholder="e.g. Mohd. Shoeb - Alpha Watch & Opticals"
                className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15"
              />
              <p className="text-[11px] text-navy/50 mt-1">
                Account holder or business name associated with the UPI ID.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-navy/70 block mb-1.5">
                Custom UPI QR Code Image URL (Optional)
              </label>
              <input
                value={settings.upiQrImage}
                onChange={(e) => setSettings({ ...settings, upiQrImage: e.target.value.trim() })}
                placeholder="Leave blank to auto-generate dynamic QR code, or paste image URL / Data URL"
                className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15 text-xs font-mono"
              />
              <p className="text-[11px] text-navy/50 mt-1">
                If left empty, a standard UPI QR code is automatically generated from your UPI ID.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-navy/70 block mb-1.5">Payment Instructions for Customer</label>
              <textarea
                value={settings.upiInstructions}
                onChange={(e) => setSettings({ ...settings, upiInstructions: e.target.value })}
                rows={4}
                className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15 text-xs leading-relaxed"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-navy/70 block mb-1.5">
                Bank Account / NEFT Details (Backup Transfer)
              </label>
              <textarea
                value={settings.bankDetails}
                onChange={(e) => setSettings({ ...settings, bankDetails: e.target.value })}
                rows={3}
                className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15 text-xs font-mono"
              />
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-navy/10">
              <input
                type="checkbox"
                id="upiEnabled"
                checked={settings.upiEnabled}
                onChange={(e) => setSettings({ ...settings, upiEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-gold focus:ring-gold"
              />
              <label htmlFor="upiEnabled" className="text-xs font-semibold text-navy">
                Enable UPI as Primary Payment Option on Checkout
              </label>
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="btn-gold px-8 py-3.5 rounded-full font-bold text-sm shadow-md disabled:opacity-50"
            >
              {savingSettings ? "Saving Settings..." : "Save Payment Settings ✓"}
            </button>
          </form>

          {/* Live Preview of QR and Details */}
          <div className="bg-white rounded-2xl p-6 border border-navy/5 shadow-sm text-center">
            <h3 className="font-serif text-lg font-bold text-navy mb-1">Live QR Code Preview</h3>
            <p className="text-xs text-navy/50 mb-4">This is what customers see on checkout:</p>

            <div className="p-4 bg-navy/5 rounded-2xl inline-block border border-navy/10 mb-4">
              <img
                src={dynamicQrCode}
                alt="UPI QR Code"
                className="w-48 h-48 mx-auto object-contain rounded-xl bg-white p-2 shadow-xs"
              />
            </div>

            <div className="space-y-1 text-sm">
              <div className="font-bold text-navy">{settings.upiPayeeName}</div>
              <div className="font-mono text-xs text-gold-700 bg-gold/10 px-3 py-1 rounded-full inline-block">
                {settings.upiId}
              </div>
            </div>

            <div className="mt-6 p-4 bg-gold/5 rounded-xl border border-gold/20 text-left text-xs text-navy/70 space-y-1">
              <div className="font-semibold text-navy">💡 Admin Tip:</div>
              <div>When customers pay, they submit their 12-digit UTR &amp; payment screenshot proof.</div>
              <div>You will receive an instant notification and can approve the order in the "Payment Approvals" tab.</div>
            </div>
          </div>
        </div>
      )}

      {/* Proof Screenshot Full Modal */}
      {selectedProof && (
        <div
          onClick={() => setSelectedProof(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setSelectedProof(null)}
              className="absolute top-4 right-4 text-navy/50 hover:text-navy text-xl w-8 h-8 rounded-full bg-navy/5 flex items-center justify-center"
            >
              ✕
            </button>

            <h3 className="font-serif text-xl font-bold text-navy mb-1">
              Payment Proof: #{selectedProof.orderNumber}
            </h3>
            <p className="text-xs text-navy/60 mb-4">
              Customer: {selectedProof.userName} ({selectedProof.userPhone}) · Total: {formatINR(selectedProof.total)}
            </p>

            {selectedProof.upiTransactionId && (
              <div className="mb-4 p-3 bg-navy/5 rounded-xl text-xs flex items-center justify-between">
                <span className="text-navy/60">UTR / Ref Number:</span>
                <span className="font-mono font-bold text-navy select-all">{selectedProof.upiTransactionId}</span>
              </div>
            )}

            {selectedProof.paymentProofUrl ? (
              <div className="rounded-2xl overflow-hidden border border-navy/10 bg-black/5 mb-6">
                <img
                  src={selectedProof.paymentProofUrl}
                  alt="Customer Payment Receipt"
                  className="w-full max-h-[400px] object-contain mx-auto"
                />
              </div>
            ) : (
              <div className="p-8 text-center text-navy/40 text-sm">No screenshot uploaded.</div>
            )}

            <div className="flex items-center gap-3">
              <button
                disabled={actionLoading === selectedProof.id}
                onClick={() => handleUpdateStatus(selectedProof.id, "approved")}
                className="flex-1 bg-emerald text-white py-3 rounded-full font-bold text-sm hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {actionLoading === selectedProof.id ? "Updating..." : "✓ Approve & Confirm Order"}
              </button>
              <button
                disabled={actionLoading === selectedProof.id}
                onClick={() => {
                  const reason = prompt("Enter reason for rejection (optional):", "Invalid UTR / Payment not received");
                  if (reason !== null) {
                    handleUpdateStatus(selectedProof.id, "rejected", reason);
                  }
                }}
                className="px-6 py-3 border border-red-300 text-red-600 rounded-full font-medium text-sm hover:bg-red-50 transition disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

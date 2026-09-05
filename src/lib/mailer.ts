// Notification sender (Resend / webhook / console)

export async function sendShopNotification(subject: string, htmlContent: string) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const shopEmail = process.env.SHOP_EMAIL || "alpha.watch.opticals@gmail.com";

  if (resendApiKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: "Alpha Watch & Opticals <notifications@alpha-watch-and-opticals.vercel.app>",
          to: [shopEmail],
          subject: `[Store Notification] ${subject}`,
          html: htmlContent
        })
      });
    } catch (err) {
      console.error("Failed to send email via Resend:", err);
    }
  } else {
    // Log in development / production log
    console.log(`[Store Notification] ${subject}\nTo: ${shopEmail}\nContent: ${htmlContent}`);
  }
}

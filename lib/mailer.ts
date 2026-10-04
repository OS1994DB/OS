// Minimal mail sender with no extra dependencies. If RESEND_API_KEY and
// MAIL_FROM are set, mail goes out via Resend's HTTP API; otherwise the
// message is printed to the server console (fine for local dev/review).
export async function sendMail(to: string, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  if (!key || !from) {
    console.log(`\n[mail:dev] To: ${to}\nSubject: ${subject}\n${text}\n`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, text }),
  });
  if (!res.ok) console.error("Mail send failed", res.status);
}

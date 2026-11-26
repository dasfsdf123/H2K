import nodemailer from "nodemailer";
export const runtime = "nodejs";
const hits = new Map<string, number[]>(); // simple per-instance rate limit; use Upstash/Redis in production
const json = (b: object, status = 200) => Response.json(b, { status });

export async function POST(req: Request) {
  const e = process.env;
  if (!e.CONTACT_TO_EMAIL || !e.SMTP_HOST || !e.SMTP_USER || !e.SMTP_PASS || !e.SMTP_FROM_EMAIL) return json({ error: "not_configured" }, 503);
  const ip = (req.headers.get("x-forwarded-for") || "x").split(",")[0], now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 600000);
  if (recent.length >= 5) return json({ error: "rate" }, 429);
  hits.set(ip, [...recent, now]);

  const f = await req.formData();
  if (f.get("website")) return json({ ok: true }); // honeypot
  const s = (k: string, max = 3000) => String(f.get(k) ?? "").trim().slice(0, max);
  const mode = s("mode") === "apply" ? "apply" : "contact";
  const name = s("name", 120), email = s("email", 200), phone = s("phone", 40), message = s("message"), role = s("role", 120), subject = s("subject", 160);
  if (!name || !phone || !message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || f.get("consent") !== "on") return json({ error: "invalid" }, 400);

  let attachments: { filename: string; content: Buffer }[] = [];
  const cv = f.get("cv");
  if (mode === "apply" && cv instanceof File && cv.size > 0) {
    const buf = Buffer.from(await cv.arrayBuffer());
    const pdf = buf.subarray(0, 4).toString() === "%PDF", docx = buf[0] === 0x50 && buf[1] === 0x4b;
    const okType = (pdf && /\.pdf$/i.test(cv.name)) || (docx && /\.docx$/i.test(cv.name));
    if (cv.size > 5 * 1024 * 1024 || !okType) return json({ error: "file" }, 400);
    attachments = [{ filename: pdf ? "cv.pdf" : "cv.docx", content: buf }];
  }
  try {
    const port = Number(e.SMTP_PORT || 587);
    const tr = nodemailer.createTransport({ host: e.SMTP_HOST, port, secure: port === 465, auth: { user: e.SMTP_USER, pass: e.SMTP_PASS } });
    await tr.sendMail({
      from: e.SMTP_FROM_EMAIL, to: e.CONTACT_TO_EMAIL, replyTo: email,
      subject: `[${mode === "apply" ? "JOB APPLICATION" : "CONTACT"}] ${subject || role || name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n${mode === "apply" ? `Preferred position: ${role}\n` : `Subject: ${subject || role}\n`}\n${message}`,
      attachments,
    });
    return json({ ok: true });
  } catch (err) {
    console.error("mail error", err);
    return json({ error: "send_failed" }, 502);
  }
}

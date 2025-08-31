import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "no-reply@example.com";
const FROM_NAME = process.env.FROM_NAME || "Prox Deals";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_SECURE = String(process.env.SMTP_SECURE || "false") === "true";

export async function sendEmailOrPreview(to: string, subject: string, html: string, text: string) {
  // 1) SMTP (Mailtrap) path
  if (SMTP_HOST) {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
    });

    const info = await transporter.sendMail({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html,
      text
    });
    console.log("SMTP sent:", info.messageId);
    return info;
  }

  // 2) Resend
  if (RESEND_API_KEY) {
    const resend = new Resend(RESEND_API_KEY);
    const from = `${FROM_NAME} <${FROM_EMAIL}>`;
    const { data, error } = await resend.emails.send({ from, to, subject, html, text });
    if (error) throw error;
    console.log("Resend sent:", data?.id);
    return data;
  }

  // 3) Preview files
  const dir = path.resolve(process.cwd(), "dist/previews");
  await mkdir(dir, { recursive: true });
  const safe = to.replace(/[^a-z0-9@._-]/gi, "_");
  await writeFile(path.join(dir, `${safe}.html`), html, "utf-8");
  await writeFile(path.join(dir, `${safe}.txt`), text, "utf-8");
  console.log(`(dry-run) Wrote previews to dist/previews/${safe}.{html,txt}`);
  return { dryRun: true };
}

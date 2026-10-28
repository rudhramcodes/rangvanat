import { Resend } from "resend";
import mongoose from "mongoose";
import { env } from "../../config/env.js";
import { getSettings } from "../settings/settings.model.js";

const INK = "#1e3324";
const CREAM = "#f4f1ea";
const MAROON = "#8a3324";

export async function sendEnquiryEmails(enquiry) {
  if (!env.RESEND_API_KEY) return false;
  const settings = await getSettings();
  const to = settings.contactEmail || env.STORE_EMAIL;
  if (!to) return false;

  // Spam guard: same email submitting repeatedly within 30 minutes
  // still saves the enquiry, but notification/auto-reply emails are skipped.
  const EnquiryModel = mongoose.models.Enquiry;
  if (EnquiryModel) {
    const since = new Date(Date.now() - 30 * 60 * 1000);
    const recent = await EnquiryModel.countDocuments({
      email: enquiry.email.toLowerCase().trim(),
      _id: { $ne: enquiry._id },
      createdAt: { $gte: since },
    });
    if (recent > 0) {
      console.log(
        `Enquiry emails skipped: ${enquiry.email} submitted ${recent + 1}x within 30 minutes`,
      );
      return false;
    }
  }

  const studioHtml = `
  <div style="background:${CREAM};padding:24px;font-family:Georgia,'Times New Roman',serif;color:${INK}">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;padding:32px">
      <p style="letter-spacing:.18em;font-size:11px;text-transform:uppercase;color:${MAROON};margin:0">New enquiry · Rangvanat</p>
      <h1 style="font-size:22px;margin:8px 0 4px">A note to the atelier</h1>
      <hr style="border:none;border-top:1px solid #d8d5cc;margin:16px 0" />
      <table style="font-size:14px;line-height:1.7;border-collapse:collapse">
        <tr><td style="padding-right:16px;color:#55524a">Name</td><td><strong>${enquiry.name}</strong></td></tr>
        <tr><td style="padding-right:16px;color:#55524a">Email</td><td>${enquiry.email}</td></tr>
        ${enquiry.phone ? `<tr><td style="padding-right:16px;color:#55524a">Phone / WhatsApp</td><td>${enquiry.phone}</td></tr>` : ""}
        <tr><td style="padding-right:16px;color:#55524a">Topic</td><td>${enquiry.topic || "General Enquiry"}</td></tr>
        ${enquiry.productRef ? `<tr><td style="padding-right:16px;color:#55524a">Piece</td><td>${enquiry.productRef}</td></tr>` : ""}
      </table>
      <p style="margin:20px 0 4px;letter-spacing:.14em;font-size:10px;text-transform:uppercase;color:#55524a">Message</p>
      <p style="font-size:14px;line-height:1.7;white-space:pre-line">${enquiry.message}</p>
      <hr style="border:none;border-top:1px solid #d8d5cc;margin:24px 0" />
      <p style="font-size:11px;color:#77746c;margin:0">From the studio contact form · ${new Date(enquiry.createdAt || Date.now()).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST · Reply directly to this address.</p>
    </div>
  </div>`;

  const customerHtml = `
  <div style="background:${CREAM};padding:24px;font-family:Georgia,'Times New Roman',serif;color:${INK}">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;padding:32px">
      <p style="letter-spacing:.18em;font-size:11px;text-transform:uppercase;color:${MAROON};margin:0">Rangvanat · Bardoli, Gujarat</p>
      <h1 style="font-size:22px;margin:8px 0 4px">Thank you, ${enquiry.name.split(" ")[0]}</h1>
      <hr style="border:none;border-top:1px solid #d8d5cc;margin:16px 0" />
      <p style="font-size:14px;line-height:1.8">
        Your note about <em>${enquiry.topic || "your enquiry"}</em> has reached our weavers and stylists. Someone from the studio will reply within one working day (Monday to Saturday, 10:00&nbsp;AM – 7:00&nbsp;PM IST).
      </p>
      <p style="font-size:14px;line-height:1.8">In the meantime, the product pages list fabric, sizes and making details for each piece — and you are always welcome to ask about custom measurements.</p>
      <p style="font-size:12px;color:#77746c;margin-top:24px">Do not reply to this automated note; we will write to you from the studio directly.</p>
    </div>
  </div>`;

  try {
    const resend = new Resend(env.RESEND_API_KEY);
    await resend.emails.send({
      from: env.STORE_EMAIL,
      to,
      replyTo: enquiry.email,
      subject: `New enquiry: ${enquiry.name} — ${enquiry.topic || "General Enquiry"}`,
      html: studioHtml,
    });
    await resend.emails.send({
      from: env.STORE_EMAIL,
      to: enquiry.email,
      subject: "We received your note — Rangvanat",
      html: customerHtml,
    });
    return true;
  } catch (err) {
    console.error("Enquiry email failed:", err?.message || err);
    return false;
  }
}

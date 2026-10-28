// TODO(client-details): Add client-approved legal business name, registered address, GST registration status/GSTIN, state code, HSN and tax rates, invoice series, and invoice contact details when supplied by the client. Do not infer tax values.
import { Resend } from "resend";
import { env } from "../../config/env.js";
import { acknowledgement } from "./acknowledgement.js";
import { getSettings } from "../settings/settings.model.js";
export async function emailAcknowledgement(order, token) {
  if (!env.RESEND_API_KEY || !env.STORE_EMAIL) return false;
  const settings = await getSettings();
  const content = await new Promise((resolve, reject) => {
    const chunks = [],
      doc = acknowledgement(order, settings);
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("error", reject);
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.end();
  });
  const link = `${env.FRONTEND_URL.split(",")[0]}/order/${order.orderNumber}#${token}`;
  const resend = new Resend(env.RESEND_API_KEY);
  const result = await resend.emails.send(
    {
      from: env.STORE_EMAIL,
      to: order.customer.email,
      subject: `${settings.name}: order request ${order.orderNumber}`,
      text: `Hello ${order.customer.name},\n\nYour order request has reached the studio. Payment is pending; no online payment has been collected.\n\nKeep this private link for order details and tracking:\n${link}\n\nAn unpaid order acknowledgement is attached. This is not a paid tax invoice.`,
      attachments: [
        { filename: `${order.orderNumber}-acknowledgement.pdf`, content },
      ],
    },
    { idempotencyKey: `order-ack-${order.orderNumber}` },
  );
  if (result.error) throw new Error(result.error.message);
  return true;
}

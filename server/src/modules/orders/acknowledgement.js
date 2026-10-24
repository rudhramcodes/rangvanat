import PDFDocument from "pdfkit";
import { authorizedOrder } from "./order.controller.js";
import { getSettings } from "../settings/settings.model.js";
export function acknowledgement(order, settings) {
  const doc = new PDFDocument({ margin: 48, size: "A4" });
  doc.fontSize(26).fillColor("#652837").text(settings.name);
  doc
    .moveDown()
    .fontSize(18)
    .fillColor("#302923")
    .text("Order acknowledgement");
  doc
    .moveDown()
    .fontSize(11)
    .text(`Order: ${order.orderNumber}`)
    .text(`Date: ${new Date(order.createdAt).toISOString().slice(0, 10)}`)
    .text(`Payment: ${order.payment.status.toUpperCase()}`);
  doc
    .moveDown()
    .text(
      "No online payment has been collected. This document is not a paid receipt or tax invoice.",
    );
  doc
    .moveDown()
    .text(`Customer: ${order.customer.name}`)
    .text(order.customer.email);
  const a = order.customer.shippingAddress;
  doc.text(
    [a.addressLine1, a.addressLine2, a.city, a.state, a.pincode]
      .filter(Boolean)
      .join(", "),
  );
  doc.moveDown();
  for (const i of order.items) {
    if (doc.y > 690) doc.addPage();
    doc
      .fontSize(11)
      .text(`${i.productTitle} | ${i.variantSize} | Qty ${i.quantity}`)
      .fontSize(10)
      .text(`INR ${i.unitPrice.toFixed(2)} each - INR ${i.subtotal.toFixed(2)}`)
      .moveDown(0.5);
  }
  if (doc.y > 620) doc.addPage();
  doc.moveDown();
  for (const [label, key] of [
    ["Subtotal", "subtotal"],
    ["Discount", "discountAmount"],
    ["Shipping", "shippingFee"],
    ["Total", "totalAmount"],
  ])
    doc
      .fontSize(key === "totalAmount" ? 14 : 11)
      .text(`${label}: INR ${order.financials[key].toFixed(2)}`);
  doc
    .moveDown()
    .fontSize(10)
    .text(settings.contactEmail || "Contact the studio for order assistance.");
  return doc;
}
export async function downloadAcknowledgement(req, res, next) {
  try {
    const order = await authorizedOrder(req),
      settings = await getSettings();
    res
      .type("pdf")
      .set(
        "Content-Disposition",
        `attachment; filename="${order.orderNumber}-acknowledgement.pdf"`,
      );
    const doc = acknowledgement(order, settings);
    doc.pipe(res);
    doc.end();
  } catch (e) {
    next(e);
  }
}

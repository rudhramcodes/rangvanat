export function fail(message, statusCode = 400) {
  throw Object.assign(new Error(message), { statusCode });
}
export const text = (value, max = 5000) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
export const email = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const integer = (value, min = 0, max = 1000000) =>
  Number.isSafeInteger(value) && value >= min && value <= max;
export const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export const asyncRoute = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
export const ok = (res, data, status = 200) =>
  res.status(status).json({ success: true, data });
export function imageUrl(value) {
  if (!value) return "";
  if (typeof value !== "string") fail("Invalid image URL");
  if (value.startsWith("/") && !value.startsWith("//") && !/[\\\s]/.test(value))
    return value;
  try {
    const u = new URL(value);
    if (u.protocol === "https:") return u.href;
  } catch {
    /* Invalid URL is rejected below. */
  }
  fail("Images must use HTTPS or a local absolute path");
}

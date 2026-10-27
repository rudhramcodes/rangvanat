// Merchant studio shares the storefront's API origin (see src/lib/apiBase.js).
const configuredApiBase =
  (import.meta.env && import.meta.env.VITE_API_URL) || "";
const API_BASE = configuredApiBase.replace(/\/+$/, "");

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  const response = await fetch(`${API_BASE}/api${path}`, {
    ...options,
    headers,
  });
  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error("The store is unavailable. Please try again shortly.");
  }
  if (!response.ok || !body.success)
    throw new Error(body.message || "Request failed");
  return body.data as T;
}
export const json = (value: unknown, method = "POST") => ({
  method,
  body: JSON.stringify(value),
});
export const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

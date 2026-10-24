export const cartItems = cart => cart.map(i=>({productId:i.id,variantSize:i.size,quantity:i.quantity,customMeasurements:i.customMeasurements || {}}));
export function readArray(key, validate = () => true) {
  try { const value=JSON.parse(localStorage.getItem(key)||'[]'); return Array.isArray(value)?value.filter(validate):[]; } catch { return []; }
}
export const validCartLine = i => i && typeof i.key==='string' && /^[a-f\d]{24}$/i.test(i.id) && Number.isInteger(i.quantity) && i.quantity>0 && i.quantity<=99 && Number.isFinite(i.price);
export function checkoutKey(payload) {
  const body=JSON.stringify(payload);
  let saved;try {saved=JSON.parse(sessionStorage.getItem('rv_checkout'));}catch { /* invalid storage */ }
  if(saved?.body===body && saved.key) return saved.key;
  const key=crypto.randomUUID();sessionStorage.setItem('rv_checkout',JSON.stringify({body,key}));return key;
}

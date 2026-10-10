// Server-side request validation. Kept dependency-free so it is easy to read.
// Each function returns an error message string or null when input is valid.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EXPIRY_RE = /^(0[1-9]|1[0-2])\/\d{2}$/;

export function validateSignup({ name, email, password }) {
  if (typeof name !== "string" || name.trim().length < 2) {
    return "Name must be at least 2 characters";
  }
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return "A valid email address is required";
  }
  if (typeof password !== "string" || password.length < 6) {
    return "Password must be at least 6 characters";
  }
  return null;
}

export function validateLogin({ email, password }) {
  if (typeof email !== "string" || email.trim() === "") return "Email is required";
  if (typeof password !== "string" || password.trim() === "") return "Password is required";
  return null;
}

export function validateCheckout({ items, shippingAddress, card }) {
  if (!Array.isArray(items) || items.length === 0) {
    return "Cart is empty";
  }

  for (const item of items) {
    if (!item || typeof item.productId !== "string" || item.productId.trim() === "") {
      return "Each cart item must include a valid productId";
    }
    const qty = item.quantity;
    if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
      return "Item quantity must be a whole number between 1 and 99";
    }
  }

  if (!shippingAddress || typeof shippingAddress !== "object") {
    return "Shipping address is required";
  }
  for (const field of ["street", "city", "postalCode", "country"]) {
    const value = shippingAddress[field];
    if (typeof value !== "string" || value.trim() === "") {
      return `Shipping address ${field} is required`;
    }
  }

  if (!card || typeof card !== "object" || typeof card.number !== "string") {
    return "Card details are required";
  }

  const digits = card.number.replace(/\s+/g, "");
  if (!/^\d{12,19}$/.test(digits)) {
    return "Card number must contain 12 to 19 digits";
  }
  if (typeof card.expiry !== "string" || !EXPIRY_RE.test(card.expiry.trim())) {
    return "Card expiry must be in MM/YY format";
  }
  if (typeof card.cvc !== "string" || !/^\d{3,4}$/.test(card.cvc.trim())) {
    return "Card CVC must be 3 or 4 digits";
  }

  return null;
}
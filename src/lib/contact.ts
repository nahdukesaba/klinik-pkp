/**
 * Shared helpers for contact links.
 */

function normalizePhoneDigits(phone: string) {
  return phone.replace(/\D/g, "");
}

function toInternationalWhatsAppNumber(phone: string) {
  const digits = normalizePhoneDigits(phone);

  if (digits.startsWith("62")) {
    return digits;
  }

  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }

  return digits;
}

export function buildTelHref(phone: string) {
  return `tel:${normalizePhoneDigits(phone)}`;
}

export function buildWhatsAppUrl(phone: string, text?: string) {
  const query = text ? `?text=${encodeURIComponent(text)}` : "";

  return `https://wa.me/${toInternationalWhatsAppNumber(phone)}${query}`;
}

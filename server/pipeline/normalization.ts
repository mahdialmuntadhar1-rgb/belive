import { GatheredBusiness, NormalizedBusiness } from "./types.js";

const socialPrefixes = [/^https?:\/\/(www\.)?instagram\.com\//i, /^https?:\/\/(www\.)?facebook\.com\//i];

export function normalizeName(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[\u0640]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function normalizePhone(value?: string): string | undefined {
  if (!value) return undefined;
  const digits = value.replace(/[^\d+]/g, "");
  if (digits.startsWith("+964")) return digits;
  if (digits.startsWith("00964")) return `+${digits.slice(2)}`;
  if (digits.startsWith("0")) return `+964${digits.slice(1)}`;
  return digits;
}

export function normalizeWebsite(value?: string): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(withProtocol);
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`.replace(/\/$/, "");
  } catch {
    return undefined;
  }
}

export function normalizeAddress(value?: string): string | undefined {
  if (!value) return undefined;
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

export function normalizeSocialHandle(value?: string): string | undefined {
  if (!value) return undefined;
  const clean = value.trim();
  for (const prefix of socialPrefixes) {
    if (prefix.test(clean)) {
      return clean.replace(prefix, "").replace(/\/$/, "").toLowerCase();
    }
  }
  return clean.replace(/^@/, "").toLowerCase();
}

export function normalizeBusiness(item: GatheredBusiness): NormalizedBusiness {
  return {
    ...item,
    normalizedName: normalizeName(item.name),
    normalizedPhone: normalizePhone(item.phone),
    normalizedWebsite: normalizeWebsite(item.website),
    normalizedAddress: normalizeAddress(item.address),
    social: {
      instagram: normalizeSocialHandle(item.social?.instagram),
      facebook: normalizeSocialHandle(item.social?.facebook),
    },
  };
}

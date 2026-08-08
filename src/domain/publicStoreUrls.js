import { normalizeOrderMode } from "./restaurantOrders";
import QRCode from "qrcode";

export function buildStorefrontUrl(origin, slug) {
  if (!origin || !slug) return null;
  return `${String(origin).replace(/\/$/, "")}/store/${encodeURIComponent(slug)}`;
}

export function resolveTableContext(vendor, rawTableId) {
  if (!rawTableId) return { ok: true, table: null };
  if (!vendor?.capabilities?.tableOrdering || !["table", "both"].includes(normalizeOrderMode(vendor.orderMode))) {
    return { ok: false, error: "Table ordering is not available for this store." };
  }
  const table = (vendor.tables || []).find(({ id, storefrontId }) => id === rawTableId && storefrontId === vendor.storefronts?.[0]?.id);
  return table ? { ok: true, table } : { ok: false, error: "This table link is no longer valid." };
}

export function buildTableUrl(origin, vendor, tableId) {
  const resolved = resolveTableContext(vendor, tableId);
  const base = buildStorefrontUrl(origin, vendor?.slug);
  return resolved.ok && resolved.table && base ? `${base}?table=${encodeURIComponent(tableId)}` : null;
}

export async function createQrSvgDataUrl(payload) {
  if (!payload) return null;
  return QRCode.toDataURL(payload, { width: 320, margin: 2, errorCorrectionLevel: "M" });
}

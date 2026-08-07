import React from "react";

/**
 * StoreFilter — dropdown for filtering analytics by storefront.
 * Value semantics: "all" | storefrontId.
 */
export default function StoreFilter({ storefronts, value, onChange, testid = "store-filter" }) {
  if (!storefronts || storefronts.length <= 1) return null;
  return (
    <select
      value={value || "all"}
      onChange={(e) => onChange(e.target.value)}
      className="input-field !py-2 sm:max-w-[220px] text-sm"
      data-testid={testid}
    >
      <option value="all">All storefronts</option>
      {storefronts.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name || s.slug}
        </option>
      ))}
    </select>
  );
}

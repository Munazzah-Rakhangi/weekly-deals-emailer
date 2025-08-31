// Lightweight parser for a few common size formats.
// Returns { qty, unit, normalizedQty, normalizedUnit } so we can compute price/normalizedUnit.
export type ParsedSize = {
  qty: number | null;
  unit: string | null;           // as written (e.g., "oz", "fl oz", "lb", "each", "rolls")
  normalizedQty: number | null;  // converted quantity in base unit
  normalizedUnit: string | null; // "oz", "fl oz", "lb", "each", "count"
};

// Normalize gallons → fl oz (1 gal = 128 fl oz)
const GAL_TO_FLOZ = 128;

export function parseSize(sizeRaw: string | null): ParsedSize {
  if (!sizeRaw) return { qty: null, unit: null, normalizedQty: null, normalizedUnit: null };
  const s = sizeRaw.trim().toLowerCase();

  // "per lb"
  if (s === "per lb" || s === "lb") return { qty: 1, unit: "lb", normalizedQty: 1, normalizedUnit: "lb" };

  // "each"
  if (s === "each") return { qty: 1, unit: "each", normalizedQty: 1, normalizedUnit: "each" };

  // "12 rolls"
  {
    const m = s.match(/^(\d+(?:\.\d+)?)\s+rolls?$/);
    if (m) return { qty: Number(m[1]), unit: "rolls", normalizedQty: Number(m[1]), normalizedUnit: "count" };
  }

  // "170 fl oz"
  {
    const m = s.match(/^(\d+(?:\.\d+)?)\s*fl\s*oz$/);
    if (m) return { qty: Number(m[1]), unit: "fl oz", normalizedQty: Number(m[1]), normalizedUnit: "fl oz" };
  }

  // "1 gallon" / "1 gal"
  {
    const m = s.match(/^(\d+(?:\.\d+)?)\s*(gallon|gal)$/);
    if (m) {
      const q = Number(m[1]) * GAL_TO_FLOZ;
      return { qty: Number(m[1]), unit: m[2], normalizedQty: q, normalizedUnit: "fl oz" };
    }
  }

  // "6 oz"
  {
    const m = s.match(/^(\d+(?:\.\d+)?)\s*oz$/);
    if (m) return { qty: Number(m[1]), unit: "oz", normalizedQty: Number(m[1]), normalizedUnit: "oz" };
  }

  // fallback (unparsed)
  return { qty: null, unit: s, normalizedQty: null, normalizedUnit: null };
}

export function pricePerUnit(price: number, sizeRaw: string | null): { value: number | null; label: string | null } {
  const p = parseSize(sizeRaw);
  if (!p.normalizedQty || !p.normalizedUnit) return { value: null, label: null };
  const v = price / p.normalizedQty;
  // round to 2 decimals for clarity
  const rounded = Math.round(v * 100) / 100;
  const unitLabel = p.normalizedUnit === "count" ? "ea" : p.normalizedUnit; // rolls → ea
  return { value: rounded, label: `$${rounded}/${unitLabel}` };
}

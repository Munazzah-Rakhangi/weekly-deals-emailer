import { supabase } from "../db/client.js";

export type DealRecord = {
  retailer: string;
  product: string;
  size: string | null;
  price: number;
  start_date: string;
  end_date: string;
  category: string | null;
};

export async function fetchDeals(): Promise<DealRecord[]> {
  const { data, error } = await supabase
    .from("deals")
    .select("price,start_date,end_date, products(name,size,category), retailers(name)");
  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    retailer: row.retailers?.name ?? "",
    product: row.products?.name ?? "",
    size: row.products?.size ?? null,
    category: row.products?.category ?? null,
    price: Number(row.price),
    start_date: row.start_date,
    end_date: row.end_date
  }));
}

export function filterAndTop(
  deals: DealRecord[],
  preferredRetailers: string[] = [],
  topN = 6
): DealRecord[] {
  const filtered = preferredRetailers.length
    ? deals.filter((d) => preferredRetailers.includes(d.retailer))
    : deals;
  return filtered.sort((a, b) => a.price - b.price).slice(0, topN);
}

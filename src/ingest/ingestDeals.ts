// src/ingest/ingestDeals.ts
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ensureProduct, ensureRetailer } from "../db/helpers.js";
import { supabase } from "../db/client.js";
import type { DealInput } from "../db/types.js";

// input path from (in order): explicit arg --> CLI flag --> env --> default
function resolveInputPath(explicitPath?: string): string {
  const cliArg = process.argv.find((a) => a.startsWith("--file="))?.split("=")[1];
  const envPath = process.env.DEALS_JSON;
  const fallback = "src/data/deals.sample.json";
  return path.resolve(process.cwd(), explicitPath || cliArg || envPath || fallback);
}

export async function ingestDeals(jsonPath?: string) {
  const filePath = resolveInputPath(jsonPath);

  const raw = await readFile(filePath, "utf-8");
  const deals: DealInput[] = JSON.parse(raw);

  for (const d of deals) {
    const retailerId = await ensureRetailer(d.retailer);
    const productId = await ensureProduct(d.product, d.size ?? null, d.category ?? null);

    const { error } = await supabase
      .from("deals")
      .upsert(
        {
          retailer_id: retailerId,
          product_id: productId,
          price: d.price,
          start_date: d.start,
          end_date: d.end
        },
        { onConflict: "retailer_id,product_id,start_date" }
      );

    if (error) {
      throw new Error(`Upsert failed for ${d.retailer} - ${d.product}: ${error.message}`);
    }
  }

  console.log(
    `Ingested ${deals.length} deals from ${path.relative(process.cwd(), filePath)}.`
  );
}

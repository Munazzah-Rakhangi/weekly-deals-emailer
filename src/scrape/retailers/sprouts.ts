// src/scrape/retailers/sprouts.ts
import { readFile } from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";

/**
 * The JSON shape our pipeline expects.
 */
export type ScrapedDeal = {
  retailer: string;
  product: string;
  size: string | null;
  price: number;
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
  category: string | null;
};

/**
 * Offline/simple scraper:
 * Reads a local HTML file that contains <div class="deal" data-*> blocks, e.g.:
 *   <div class="deal"
 *        data-retailer="Sprouts"
 *        data-product="Wild Caught Salmon Fillet"
 *        data-size="per lb"
 *        data-price="8.99"
 *        data-start="2025-09-01"
 *        data-end="2025-09-07"
 *        data-category="protein"></div>
 *
 * If no path is provided, it defaults to: src/scrape/samples/sprouts.sample.html
 */
export async function scrapeSprouts(source?: string): Promise<ScrapedDeal[]> {
  const srcPath = path.resolve(
    process.cwd(),
    source || "src/scrape/samples/sprouts.sample.html"
  );

  // Load the local HTML file
  let html: string;
  try {
    html = await readFile(srcPath, "utf-8");
  } catch (err: any) {
    throw new Error(
      `Could not read sample HTML at "${srcPath}". ` +
        `Make sure the file exists. Original error: ${err?.message || err}`
    );
  }

  const $ = load(html);

  // Parse <div class="deal" ...> blocks
  const deals: ScrapedDeal[] = $(".deal")
    .map((_, el) => {
      const $el = $(el);

      const retailer = ($el.attr("data-retailer") || "").trim();
      const product = ($el.attr("data-product") || "").trim();
      const size = (($el.attr("data-size") || "").trim() || null) as string | null;
      const priceRaw = ($el.attr("data-price") || "").trim();
      const start = ($el.attr("data-start") || "").trim();
      const end = ($el.attr("data-end") || "").trim();
      const category = (($el.attr("data-category") || "").trim() || null) as string | null;

      const price = Number(priceRaw);

      return {
        retailer: retailer || "Sprouts",
        product,
        size,
        price,
        start,
        end,
        category,
      };
    })
    .get()
    // keep only well-formed items (must have product + valid price)
    .filter((d) => d.product && !Number.isNaN(d.price));

  return deals;
}

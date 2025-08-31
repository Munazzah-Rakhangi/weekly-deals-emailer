// src/preview/buildPage.ts
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { BRAND } from "../brand.js";
import { fetchDeals } from "../lib/deals.js";
import { pricePerUnit } from "../lib/pricing.js";
import { format } from "date-fns";

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

async function main() {
  const deals = await fetchDeals();

  // Group by retailer
  const grouped: Record<string, typeof deals> = {};
  for (const d of deals) (grouped[d.retailer] ??= []).push(d);

  const cards = Object.entries(grouped)
    .map(([retailer, items]) => {
      const rows = items
        .sort((a, b) => a.price - b.price)
        .map((d) => {
          const dates = `${format(new Date(d.start_date), "MMM d")} – ${format(new Date(d.end_date), "MMM d")}`;
          const ppu = pricePerUnit(d.price, d.size);

          return `<tr>
            <td style="padding:8px 0 4px 0;font-weight:600;vertical-align:top;">${esc(d.product)}</td>
            <td style="padding:8px 0;color:#555;vertical-align:top;">
              ${esc(d.size ?? "")}
              ${ppu.label ? `<div style="font-size:12px;color:#777;margin-top:2px;">${esc(ppu.label)}</div>` : ""}
            </td>
            <td style="padding:8px 0;font-weight:700;text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap;">$${d.price.toFixed(2)}</td>
            <td style="padding:8px 0;color:#555;text-align:right;white-space:nowrap;">${dates}</td>
          </tr>`;
        })
        .join("");

      // Ensuring identical column widths across all cards
      const table = `
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;table-layout:fixed;">
          <colgroup>
            <col style="width:56%">
            <col style="width:17%">
            <col style="width:12%">
            <col style="width:15%">
          </colgroup>
          ${rows}
        </table>`;

      return `
        <div style="background:#fff;border:1px solid #eee;border-radius:12px;padding:16px;margin-bottom:16px;">
          <div style="font-weight:800;color:${BRAND.dark};margin-bottom:8px;">${esc(retailer)}</div>
          ${table}
        </div>`;
    })
    .join("");

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(BRAND.name)} Deals</title></head>
  <body style="margin:0;background:${BRAND.bg};font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
    <div style="max-width:900px;margin:24px auto;padding:0 16px;">
      <div style="background:${BRAND.primary};color:#fff;border-radius:12px;padding:16px 20px;font-weight:800;font-size:20px;">
        ${esc(BRAND.name)} Weekly Deals
      </div>
      <div style="margin-top:16px">${cards || "<p>No deals.</p>"}</div>
    </div>
  </body></html>`;

  const outDir = path.resolve(process.cwd(), "dist/site");
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "index.html"), html, "utf-8");
  console.log("Built preview page at dist/site/index.html");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

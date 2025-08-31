import { format } from "date-fns";
import type { DealRecord } from "../lib/deals.js";
import { pricePerUnit } from "../lib/pricing.js";

type Brand = { name: string; primary: string; dark: string; bg: string };

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

export function renderWeeklyDealsHtml(args: {
  brand: Brand;
  userName: string;
  deals: DealRecord[];
  manageUrl: string;
}) {
  const { brand, userName, deals, manageUrl } = args;

  const byRetailer: Record<string, DealRecord[]> = {};
  for (const d of deals) (byRetailer[d.retailer] ??= []).push(d);

  const sections = Object.entries(byRetailer)
    .map(([retailer, items]) => {
      const rows = items
        .map((d) => {
          const dates = `${format(new Date(d.start_date), "MMM d")} – ${format(new Date(d.end_date), "MMM d")}`;
          const ppu = pricePerUnit(d.price, d.size);

          return `<tr>
            <td style="padding:8px 0 4px 0;font-weight:600;vertical-align:top;">${esc(d.product)}</td>
            <td style="padding:8px 0;color:#555;vertical-align:top;">
              ${esc(d.size ?? "")}
              ${ppu.label ? `<div style="font-size:12px;color:#777;margin-top:2px;">${esc(ppu.label)}</div>` : ""}
            </td>
            <!-- add right padding so price and date don't touch -->
            <td style="padding:8px 8px 8px 0;font-weight:700;text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap;">$${d.price.toFixed(2)}</td>
            <!-- add left padding + a bit more width via colgroup -->
            <td style="padding:8px 0 8px 8px;color:#555;text-align:right;white-space:nowrap;">${dates}</td>
          </tr>`;
        })
        .join("");

      // layout + slightly wider size/date columns; padding handles the gap
      const table = `
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;table-layout:fixed;">
          <colgroup>
            <col style="width:54%">  <!-- product -->
            <col style="width:19%">  <!-- size + unit price -->
            <col style="width:12%">  <!-- price -->
            <col style="width:15%">  <!-- dates -->
          </colgroup>
          ${rows}
        </table>`;

      return `<tr><td style="padding:16px 0;">
        <div style="font-size:16px;font-weight:800;color:${brand.dark};margin-bottom:8px;">${esc(retailer)}</div>
        ${table}
      </td></tr>`;
    })
    .join("");

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:${brand.bg};font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#111;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${brand.bg};padding:24px 0;">
      <tr>
        <td>
          <table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">
            <tr>
              <td style="background:${brand.primary};color:#fff;padding:20px 24px;font-weight:800;font-size:20px;">
                ${esc(brand.name)} Weekly Deals
              </td>
            </tr>
            <tr>
              <td style="padding:20px 24px;">
                <p style="margin:0 0 12px 0;">Hi ${esc(userName)},</p>
                <p style="margin:0 0 16px 0;">Here are your top deals this week (based on your preferred retailers).</p>
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
                  ${sections || `<tr><td>No matching deals this week.</td></tr>`}
                </table>
                <div style="margin-top:24px;font-size:12px;color:#666;">
                  <a href="${manageUrl}" style="color:${brand.primary};text-decoration:none;">Manage preferences</a> •
                  You’re receiving this because you subscribed to ${esc(brand.name)} Weekly Deals.
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;background:#fafafa;font-size:12px;color:#666;">
                © ${new Date().getFullYear()} ${esc(brand.name)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

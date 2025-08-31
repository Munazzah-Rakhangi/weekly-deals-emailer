import { format } from "date-fns";
import type { DealRecord } from "../lib/deals.js";

export function renderWeeklyDealsText(brandName: string, userName: string, deals: DealRecord[]) {
  if (!deals.length) return `${brandName} Weekly Deals\n\nHi ${userName},\nNo matching deals this week.\n`;
  const lines = deals.map((d) => {
    const dates = `${format(new Date(d.start_date), "MMM d")}–${format(new Date(d.end_date), "MMM d")}`;
    return `• ${d.retailer}: ${d.product} (${d.size ?? ""}) - $${d.price.toFixed(2)} [${dates}]`;
  });
  return `${brandName} Weekly Deals\n\nHi ${userName},\nHere are your top deals this week:\n\n${lines.join("\n")}\n\nManage preferences: https://example.com/preferences`;
}

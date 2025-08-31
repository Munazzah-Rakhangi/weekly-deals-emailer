import "dotenv/config";
import { BRAND } from "../brand.js";
import { ingestDeals } from "../ingest/ingestDeals.js";
import { fetchDeals, filterAndTop } from "../lib/deals.js";
import { loadTestUsers } from "../lib/users.js";
import { renderWeeklyDealsHtml } from "../email/html.js";
import { renderWeeklyDealsText } from "../email/text.js";
import { sendEmailOrPreview } from "../email/send.js";

async function main() {
  console.log("send:weekly starting…");

  // 1) Ingest (idempotent)
  await ingestDeals();
  console.log("Ingestion OK.");

  // 2) Fetch deals
  const allDeals = await fetchDeals();

  // 3) Load users & send
  const users = await loadTestUsers();
  for (const user of users) {
    const top = filterAndTop(allDeals, user.preferred_retailers, 6);

    const html = renderWeeklyDealsHtml({
      brand: BRAND,
      userName: user.name,
      deals: top,
      manageUrl: `https://example.com/preferences?email=${encodeURIComponent(user.email)}`
    });
    const text = renderWeeklyDealsText(BRAND.name, user.name, top);
    const subject = `${BRAND.name} Weekly Deals — Top ${top.length || 0}`;

    await sendEmailOrPreview(user.email, subject, html, text);
    console.log(`Prepared email for ${user.name} <${user.email}> (${top.length} deals)`);
  }

  console.log("All done.");
}

main().catch((err) => { console.error(err); process.exit(1); });

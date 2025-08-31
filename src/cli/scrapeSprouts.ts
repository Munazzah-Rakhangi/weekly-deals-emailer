import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { scrapeSprouts } from "../scrape/retailers/sprouts.js";

async function main() {
  // Optional arg: URL or local HTML path (pass after `--`)
  const source = process.argv[2];
  const deals = await scrapeSprouts(source);

  const outPath = path.resolve(process.cwd(), "src/data/deals.scraped.json");
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(deals, null, 2), "utf-8");
  console.log(`Scraped ${deals.length} deals -> ${path.relative(process.cwd(), outPath)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import { readFile } from "node:fs/promises";
import path from "node:path";

export type TestUser = {
  name: string;
  email: string;
  preferred_retailers: string[];
};

export async function loadTestUsers(): Promise<TestUser[]> {
  const p = path.resolve(process.cwd(), "src/data/users.sample.json");
  const raw = await readFile(p, "utf-8");
  return JSON.parse(raw) as TestUser[];
}

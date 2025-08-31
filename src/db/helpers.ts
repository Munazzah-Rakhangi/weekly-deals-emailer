import { supabase } from "./client.js";

/** Insert or find retailer by name -> return id */
export async function ensureRetailer(name: string): Promise<number> {
  const { data: found, error: findErr } = await supabase
    .from("retailers")
    .select("id")
    .eq("name", name)
    .maybeSingle();

  if (findErr) throw findErr;
  if (found) return found.id;

  const { data: inserted, error: insErr } = await supabase
    .from("retailers")
    .insert({ name })
    .select("id")
    .single();

  if (insErr) throw insErr;
  return inserted.id;
}

/** Insert or find product by (name, size, category) -> return id
 *
 */
export async function ensureProduct(
  name: string,
  size: string | null,
  category: string | null
): Promise<number> {
  const { data: found, error: findErr } = await supabase
    .from("products")
    .select("id")
    .eq("name", name)
    .eq("size", size)
    .eq("category", category)
    .maybeSingle();

  if (findErr) throw findErr;
  if (found) return found.id;

  const { data: inserted, error: insErr } = await supabase
    .from("products")
    .insert({ name, size, category })
    .select("id")
    .single();

  if (insErr) throw insErr;
  return inserted.id;
}

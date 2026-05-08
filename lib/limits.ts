import { createClient } from "@/lib/supabase/server";

export const FREE_LIMIT = Number(process.env.FREE_ITEM_LIMIT ?? 300);

export async function getUserItemCount(userId: string): Promise<number> {
  const supabase = createClient();
  const { data } = await supabase
    .from("user_limits")
    .select("item_count")
    .eq("user_id", userId)
    .single();
  return data?.item_count ?? 0;
}

export async function checkLimit(userId: string): Promise<{ allowed: boolean; count: number }> {
  const count = await getUserItemCount(userId);
  return { allowed: count < FREE_LIMIT, count };
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserItemCount, FREE_LIMIT } from "@/lib/limits";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const count = await getUserItemCount(user.id);
  return NextResponse.json({ count, limit: FREE_LIMIT, remaining: FREE_LIMIT - count });
}

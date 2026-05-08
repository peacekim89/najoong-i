import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";
import type { Database } from "@/types";

/**
 * Cookie 세션 또는 Authorization: Bearer 토큰 중 유효한 것으로 인증.
 * 크롬 확장에서 Bearer 토큰을 사용하는 경우를 지원.
 */
export async function getAuthenticatedUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    );
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (!error && user) return { supabase, user };
  }

  // 쿠키 기반 fallback
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

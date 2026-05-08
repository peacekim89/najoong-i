import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateEmbedding, generateSearchReason } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { query } = await req.json();
  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return NextResponse.json({ error: "검색어를 입력해주세요" }, { status: 400 });
  }

  const q = query.trim();
  const embedding = await generateEmbedding(q);

  const [{ data: semanticMatches, error }, { data: keywordMatches }] = await Promise.all([
    supabase.rpc("search_items", {
      query_embedding: embedding,
      match_user_id: user.id,
      match_threshold: 0.2,
      match_count: 15,
    }),
    supabase
      .from("items")
      .select("id, type, original_url, title, summary, tags, category, thumbnail_url, created_at")
      .eq("user_id", user.id)
      .or(`title.ilike.%${q}%,summary.ilike.%${q}%,tags.cs.{${q}}`)
      .limit(10),
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 시맨틱 + 키워드 결과 병합 (중복 제거)
  const seenIds = new Set<string>();
  const merged: Record<string, unknown>[] = [];
  for (const m of (semanticMatches ?? [])) {
    if (!seenIds.has(m.id as string)) { seenIds.add(m.id as string); merged.push(m); }
  }
  for (const m of (keywordMatches ?? [])) {
    if (!seenIds.has(m.id as string)) { seenIds.add(m.id as string); merged.push({ ...m, similarity: 0.5 }); }
  }

  if (merged.length === 0) return NextResponse.json({ results: [] });

  // 상위 8개에만 매칭 이유 생성 (비용 절감)
  const top = merged.slice(0, 8);
  const reasons = await Promise.all(
    top.map((m: { title: string; summary: string }) =>
      generateSearchReason(query, m.title, m.summary)
    )
  );

  const results = top.map((m: Record<string, unknown>, i: number) => ({
    item: m,
    score: m.similarity,
    match_reason: reasons[i],
  }));

  return NextResponse.json({ results });
}

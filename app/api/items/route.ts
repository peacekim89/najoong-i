import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/api-auth";
import { crawlUrl } from "@/lib/crawler";
import { analyzeContent, generateEmbedding } from "@/lib/ai";
import { checkLimit, FREE_LIMIT } from "@/lib/limits";

export async function POST(req: NextRequest) {
  const { supabase, user } = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url } = await req.json();
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL이 필요합니다" }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url.trim());
  } catch {
    return NextResponse.json({ error: "올바른 URL이 아닙니다" }, { status: 400 });
  }

  const { allowed, count } = await checkLimit(user.id);
  if (!allowed) {
    return NextResponse.json(
      { error: `무료 플랜은 최대 ${FREE_LIMIT}개까지 저장할 수 있습니다.`, count },
      { status: 403 }
    );
  }

  const { data: existing } = await supabase
    .from("items")
    .select("id")
    .eq("user_id", user.id)
    .eq("original_url", parsedUrl.href)
    .maybeSingle() as { data: { id: string } | null };

  if (existing) {
    return NextResponse.json({ error: "이미 저장된 링크입니다", id: existing.id }, { status: 409 });
  }

  try {
    const crawled = await crawlUrl(parsedUrl.href);
    const embedText = [crawled.title, crawled.description, crawled.raw_content].filter(Boolean).join(" ");

    const [aiResult, embedding] = await Promise.all([
      analyzeContent(crawled.title, crawled.raw_content, parsedUrl.href),
      generateEmbedding(embedText),
    ]);

    const { data: item, error } = await (supabase as unknown as Record<string, (...args: unknown[]) => unknown>)
      .from("items")
      .insert({
        user_id: user.id,
        type: "link",
        original_url: parsedUrl.href,
        title: crawled.title,
        summary: aiResult.summary,
        tags: aiResult.tags,
        category: aiResult.category,
        thumbnail_url: crawled.thumbnail_url,
        raw_content: crawled.raw_content,
        embedding: embedding,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/items]", err);
    return NextResponse.json({ error: "저장에 실패했습니다" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { supabase, user } = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category");
  const cursor = searchParams.get("cursor");
  const limit = 20;

  let query = supabase
    .from("items")
    .select("id, type, original_url, title, summary, tags, category, thumbnail_url, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (category && category !== "전체") query = query.eq("category", category);
  if (cursor) query = query.lt("created_at", cursor);

  const { data: items, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ items, hasMore: (items?.length ?? 0) === limit });
}

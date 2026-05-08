import OpenAI from "openai";
import type { Category } from "@/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const CATEGORIES: Category[] = [
  "영상", "레시피", "여행", "쇼핑", "뉴스", "개발",
  "디자인", "비즈니스", "건강", "교육", "엔터테인먼트", "기타",
];

export interface AIResult {
  summary: string;
  tags: string[];
  category: Category;
}

export async function analyzeContent(
  title: string,
  rawContent: string,
  url: string
): Promise<AIResult> {
  const prompt = `다음 웹페이지 내용을 분석해서 JSON으로 응답해줘. 한국어로만 응답.

URL: ${url}
제목: ${title}
내용: ${rawContent.slice(0, 2000)}

응답 형식:
{
  "summary": "2문장 이내 핵심 요약 (사용자가 왜 저장했을지 관점)",
  "tags": ["태그1", "태그2", "태그3"],
  "category": "${CATEGORIES.join(" | ")}" 중 하나
}

규칙:
- summary는 반드시 2문장 이내
- tags는 정확히 3개, 간결한 명사/구
- category는 위 목록 중 가장 적합한 것 1개만`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 300,
  });

  const raw = response.choices[0].message.content ?? "{}";
  const parsed = JSON.parse(raw);

  const category = CATEGORIES.includes(parsed.category) ? parsed.category : "기타";
  const tags = Array.isArray(parsed.tags)
    ? parsed.tags.slice(0, 3).map((t: unknown) => String(t))
    : [];
  const summary = typeof parsed.summary === "string" ? parsed.summary : title;

  return { summary, tags, category };
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.slice(0, 8000),
    dimensions: 1536,
  });
  return response.data[0].embedding;
}

export async function generateSearchReason(
  query: string,
  title: string,
  summary: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `검색어: "${query}"
콘텐츠 제목: "${title}"
요약: "${summary}"

이 콘텐츠가 검색어와 왜 관련있는지 한 문장(20자 이내)으로만 답해줘.`,
      },
    ],
    temperature: 0.3,
    max_tokens: 60,
  });
  return response.choices[0].message.content?.trim() ?? "관련 콘텐츠";
}

-- ============================================================
-- 나중이(Nachung-i) Supabase Schema
-- ============================================================

-- pgvector 확장 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- items 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS public.items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type          TEXT NOT NULL DEFAULT 'link' CHECK (type IN ('link', 'note')),
  original_url  TEXT NOT NULL,
  title         TEXT NOT NULL DEFAULT '',
  summary       TEXT NOT NULL DEFAULT '',
  tags          TEXT[] NOT NULL DEFAULT '{}',
  category      TEXT NOT NULL DEFAULT '기타',
  thumbnail_url TEXT,
  raw_content   TEXT,
  embedding     VECTOR(1536),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS items_user_id_idx ON public.items(user_id);
CREATE INDEX IF NOT EXISTS items_created_at_idx ON public.items(created_at DESC);
CREATE INDEX IF NOT EXISTS items_category_idx ON public.items(user_id, category);
CREATE INDEX IF NOT EXISTS items_tags_idx ON public.items USING GIN(tags);

-- pgvector HNSW 인덱스 (시맨틱 검색용)
CREATE INDEX IF NOT EXISTS items_embedding_idx
  ON public.items
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ============================================================
-- user_limits 테이블 (무료 300건 상한)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_limits (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  item_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RLS (Row Level Security) 설정
-- ============================================================
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_limits ENABLE ROW LEVEL SECURITY;

-- items 정책
CREATE POLICY "users_own_items" ON public.items
  FOR ALL USING (auth.uid() = user_id);

-- user_limits 정책
CREATE POLICY "users_own_limits" ON public.user_limits
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 트리거: items 삽입/삭제 시 user_limits 자동 갱신
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_item_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.user_limits(user_id, item_count)
    VALUES (NEW.user_id, 1)
    ON CONFLICT (user_id) DO UPDATE
    SET item_count = user_limits.item_count + 1,
        updated_at = NOW();
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.user_limits
    SET item_count = GREATEST(0, item_count - 1),
        updated_at = NOW()
    WHERE user_id = OLD.user_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER items_count_trigger
  AFTER INSERT OR DELETE ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.handle_item_count();

-- ============================================================
-- 시맨틱 검색 함수 (pgvector cosine similarity)
-- ============================================================
CREATE OR REPLACE FUNCTION public.search_items(
  query_embedding VECTOR(1536),
  match_user_id   UUID,
  match_threshold FLOAT DEFAULT 0.5,
  match_count     INT   DEFAULT 20
)
RETURNS TABLE (
  id            UUID,
  user_id       UUID,
  type          TEXT,
  original_url  TEXT,
  title         TEXT,
  summary       TEXT,
  tags          TEXT[],
  category      TEXT,
  thumbnail_url TEXT,
  created_at    TIMESTAMPTZ,
  similarity    FLOAT
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    i.user_id,
    i.type,
    i.original_url,
    i.title,
    i.summary,
    i.tags,
    i.category,
    i.thumbnail_url,
    i.created_at,
    1 - (i.embedding <=> query_embedding) AS similarity
  FROM public.items i
  WHERE
    i.user_id = match_user_id
    AND i.embedding IS NOT NULL
    AND 1 - (i.embedding <=> query_embedding) > match_threshold
  ORDER BY i.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================
-- 신규 유저 가입 시 user_limits 자동 생성
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.user_limits(user_id, item_count)
  VALUES (NEW.id, 0)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

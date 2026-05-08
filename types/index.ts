export type ItemType = "link" | "note";

export type Category =
  | "영상"
  | "레시피"
  | "여행"
  | "쇼핑"
  | "뉴스"
  | "개발"
  | "디자인"
  | "비즈니스"
  | "건강"
  | "교육"
  | "엔터테인먼트"
  | "기타";

export interface Item {
  id: string;
  user_id: string;
  type: ItemType;
  original_url: string;
  title: string;
  summary: string;
  tags: string[];
  category: Category;
  thumbnail_url: string | null;
  raw_content: string | null;
  embedding: number[] | null;
  created_at: string;
}

export interface SearchResult {
  item: Item;
  score: number;
  match_reason: string;
}

export interface SavePayload {
  url: string;
}

export interface Database {
  public: {
    Tables: {
      items: {
        Row: Item;
        Insert: Omit<Item, "id" | "created_at">;
        Update: Partial<Omit<Item, "id" | "user_id" | "created_at">>;
      };
      user_limits: {
        Row: {
          user_id: string;
          item_count: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          item_count?: number;
        };
        Update: {
          item_count?: number;
          updated_at?: string;
        };
      };
    };
  };
}

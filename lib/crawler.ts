import axios from "axios";
import * as cheerio from "cheerio";

export interface CrawlResult {
  title: string;
  description: string;
  thumbnail_url: string | null;
  raw_content: string;
  platform: "youtube" | "instagram" | "web";
}

const TIMEOUT = 10_000;
const UA = "Mozilla/5.0 (compatible; Nachungi/1.0)";

export async function crawlUrl(url: string): Promise<CrawlResult> {
  const parsed = new URL(url);
  const host = parsed.hostname.replace("www.", "");

  if (host === "youtube.com" || host === "youtu.be") {
    return crawlYoutube(url);
  }
  if (host === "instagram.com") {
    return crawlInstagram(url);
  }
  return crawlGeneric(url);
}

async function crawlYoutube(url: string): Promise<CrawlResult> {
  const videoId = extractYoutubeId(url);
  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

  try {
    const { data } = await axios.get(oembedUrl, { timeout: TIMEOUT });
    return {
      title: data.title ?? "YouTube 영상",
      description: data.author_name ? `${data.author_name}의 영상` : "",
      thumbnail_url: videoId
        ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        : null,
      raw_content: `YouTube | ${data.title} | ${data.author_name}`,
      platform: "youtube",
    };
  } catch {
    return fallback(url, "youtube");
  }
}

async function crawlInstagram(url: string): Promise<CrawlResult> {
  try {
    const oembedUrl = `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(oembedUrl, {
      timeout: TIMEOUT,
      headers: { "User-Agent": UA },
    });
    return {
      title: data.title ?? "Instagram 게시물",
      description: data.author_name ? `@${data.author_name}` : "",
      thumbnail_url: data.thumbnail_url ?? null,
      raw_content: `Instagram | ${data.title ?? ""} | @${data.author_name ?? ""}`,
      platform: "instagram",
    };
  } catch {
    return fallback(url, "instagram");
  }
}

async function crawlGeneric(url: string): Promise<CrawlResult> {
  try {
    const { data } = await axios.get(url, {
      timeout: TIMEOUT,
      headers: { "User-Agent": UA },
      maxContentLength: 2 * 1024 * 1024,
    });

    const $ = cheerio.load(data);

    const title =
      $('meta[property="og:title"]').attr("content") ||
      $("title").text().trim() ||
      url;

    const description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      "";

    const thumbnail =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      null;

    const bodyText = $("body")
      .find("p, h1, h2, h3, article")
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean)
      .slice(0, 30)
      .join(" ");

    const raw_content = [title, description, bodyText].filter(Boolean).join(" | ").slice(0, 4000);

    return { title, description, thumbnail_url: thumbnail, raw_content, platform: "web" };
  } catch {
    return fallback(url, "web");
  }
}

function extractYoutubeId(url: string): string | null {
  const patterns = [
    /[?&]v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /embed\/([^?]+)/,
    /shorts\/([^?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function fallback(url: string, platform: CrawlResult["platform"]): CrawlResult {
  return {
    title: url,
    description: "",
    thumbnail_url: null,
    raw_content: url,
    platform,
  };
}

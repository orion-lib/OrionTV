import { Router, Request, Response } from "express";
import { getCacheTime } from "../config";

const router = Router();

// --- Interfaces ---
interface DoubanItem {
  title: string;
  poster: string;
  rate: string;
}

interface DoubanResponse {
  code: number;
  message: string;
  list: DoubanItem[];
}

interface DoubanApiResponse {
  subjects: Array<{
    title: string;
    cover: string;
    rate: string;
  }>;
}

// --- Helper Functions ---

async function fetchDoubanData(url: string): Promise<DoubanApiResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const fetchOptions = {
    signal: controller.signal,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      Referer: "https://movie.douban.com/",
      Accept: "application/json, text/plain, */*",
    },
  };

  try {
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function handleTop250(pageStart: number, res: Response) {
  const target = `https://movie.douban.com/top250?start=${pageStart}&filter=`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const fetchOptions = {
    signal: controller.signal,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      Referer: "https://movie.douban.com/",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    },
  };

  try {
    const fetchResponse = await fetch(target, fetchOptions);
    clearTimeout(timeoutId);

    if (!fetchResponse.ok) {
      throw new Error(`HTTP error! Status: ${fetchResponse.status}`);
    }

    const html = await fetchResponse.text();
    const moviePattern =
      /<div class="item">[\s\S]*?<img[^>]+alt="([^"]+)"[^>]*src="([^"]+)"[\s\S]*?<span class="rating_num"[^>]*>([^<]+)<\/span>[\s\S]*?<\/div>/g;
    const movies: DoubanItem[] = [];
    let match;

    while ((match = moviePattern.exec(html)) !== null) {
      const title = match[1];
      const cover = match[2];
      const rate = match[3] || "";
      const processedCover = cover.replace(/^http:/, "https:");
      movies.push({ title, poster: processedCover, rate });
    }

    const apiResponse: DoubanResponse = {
      code: 200,
      message: "获取成功",
      list: movies,
    };
    const cacheTime = getCacheTime();
    res.setHeader("Cache-Control", `public, max-age=${cacheTime}`);
    res.json(apiResponse);
  } catch (error) {
    clearTimeout(timeoutId);
    res.status(500).json({
      error: "获取豆瓣 Top250 数据失败",
      details: (error as Error).message,
    });
  }
}

// --- Main Route Handler ---

router.get("/", async (req: Request, res: Response) => {
  const { type, tag } = req.query;
  const pageSize = parseInt((req.query.pageSize as string) || "16");
  const pageStart = parseInt((req.query.pageStart as string) || "0");

  if (!type || !tag) {
    return res.status(400).json({ error: "缺少必要参数: type 或 tag" });
  }
  if (typeof type !== "string" || !["tv", "movie"].includes(type)) {
    return res.status(400).json({ error: "type 参数必须是 tv 或 movie" });
  }
  if (pageSize < 1 || pageSize > 100) {
    return res.status(400).json({ error: "pageSize 必须在 1-100 之间" });
  }
  if (pageStart < 0) {
    return res.status(400).json({ error: "pageStart 不能小于 0" });
  }

  if (tag === "top250") {
    return handleTop250(pageStart, res);
  }

  const target = `https://movie.douban.com/j/search_subjects?type=${type}&tag=${tag}&sort=recommend&page_limit=${pageSize}&page_start=${pageStart}`;

  try {
    const doubanData = await fetchDoubanData(target);
    const list: DoubanItem[] = doubanData.subjects.map((item) => ({
      title: item.title,
      poster: item.cover,
      rate: item.rate,
    }));

    const response: DoubanResponse = {
      code: 200,
      message: "获取成功",
      list: list,
    };
    const cacheTime = getCacheTime();
    res.setHeader("Cache-Control", `public, max-age=${cacheTime}`);
    res.json(response);
  } catch (error) {
    res.status(500).json({
      error: "获取豆瓣数据失败",
      details: (error as Error).message,
    });
  }
});

export default router;

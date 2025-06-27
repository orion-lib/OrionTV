import { Router, Request, Response } from "express";
import { Readable } from "node:stream";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const imageUrl = req.query.url as string;

  if (!imageUrl) {
    return res.status(400).send("Missing image URL");
  }

  try {
    const imageResponse = await fetch(imageUrl, {
      headers: {
        Referer: "https://movie.douban.com/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      },
    });

    if (!imageResponse.ok) {
      return res.status(imageResponse.status).send(imageResponse.statusText);
    }

    const contentType = imageResponse.headers.get("content-type");
    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }

    if (imageResponse.body) {
      const nodeStream = Readable.fromWeb(imageResponse.body as any);
      nodeStream.pipe(res);
    } else {
      res.status(500).send("Image response has no body");
    }
  } catch (error) {
    console.error("Image proxy error:", error);
    res.status(500).send("Error fetching image");
  }
});

export default router;

import { Router, Request, Response } from "express";
import { getAllPlayRecords, savePlayRecord } from "../services/db";
import { PlayRecord } from "../types";

const router = Router();

// GET all play records
router.get("/", async (_req: Request, res: Response) => {
  try {
    const records = await getAllPlayRecords();
    res.json(records);
  } catch (err) {
    console.error("获取播放记录失败", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST a new play record
router.post("/", async (req: Request, res: Response) => {
  try {
    const { key, record }: { key: string; record: PlayRecord } = req.body;

    if (!key || !record) {
      return res.status(400).json({ error: "Missing key or record" });
    }

    // Basic validation
    if (!record.title || !record.source_name || record.index < 0) {
      return res.status(400).json({ error: "Invalid record data" });
    }

    const [source, id] = key.split("+");
    if (!source || !id) {
      return res.status(400).json({ error: "Invalid key format" });
    }

    // The user_id will be stripped and re-added in the service to ensure it's always 0
    const recordToSave: Omit<PlayRecord, "user_id"> = record;

    await savePlayRecord(source, id, recordToSave);

    res.status(201).json({ success: true });
  } catch (err) {
    console.error("保存播放记录失败", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

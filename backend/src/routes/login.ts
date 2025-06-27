import { Router, Request, Response } from "express";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const masterPassword = process.env.PASSWORD;

    // If no password is set in the environment, allow access.
    if (!masterPassword) {
      return res.json({ ok: true });
    }

    const { password } = req.body;
    if (typeof password !== "string") {
      return res.status(400).json({ error: "密码不能为空" });
    }

    const matched = password === masterPassword;

    if (!matched) {
      return res.status(401).json({ ok: false, error: "密码错误" });
    }

    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: "服务器错误" });
  }
});

export default router;

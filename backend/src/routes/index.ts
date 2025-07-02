import { Router } from "express";
import searchRouter from "./search";
import detailRouter from "./detail";
import doubanRouter from "./douban";
import imageProxyRouter from "./image-proxy";

const router = Router();

router.use("/search", searchRouter);
router.use("/detail", detailRouter);
router.use("/douban", doubanRouter);
router.use("/image-proxy", imageProxyRouter);

export default router;

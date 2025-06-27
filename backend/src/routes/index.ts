import { Router } from "express";
import searchRouter from "./search";
import detailRouter from "./detail";
import doubanRouter from "./douban";
import loginRouter from "./login";
import playRecordsRouter from "./playrecords";
import imageProxyRouter from "./image-proxy";

const router = Router();

router.use("/search", searchRouter);
router.use("/detail", detailRouter);
router.use("/douban", doubanRouter);
router.use("/login", loginRouter);
router.use("/playrecords", playRecordsRouter);
router.use("/image-proxy", imageProxyRouter);

export default router;

import { Router, type IRouter } from "express";
import healthRouter from "./health";
import geminiRouter from "./gemini/conversations";
import careerRouter from "./career/index";
import authRouter from "./auth/index";
import progressRouter from "./progress/index";
import battleRouter from "./battle/index";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/gemini", geminiRouter);
router.use("/career", careerRouter);
router.use("/auth", authRouter);
router.use("/progress", progressRouter);
router.use("/battle", battleRouter);

export default router;

import { Router, type IRouter } from "express";
import healthRouter from "./health";
import geminiRouter from "./gemini/conversations";
import careerRouter from "./career/index";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/gemini", geminiRouter);
router.use("/career", careerRouter);

export default router;

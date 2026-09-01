import { Router, type IRouter } from "express";
import healthRouter from "./health";
import catalogRouter from "./catalog";
import liveTvRouter from "./live-tv";

const router: IRouter = Router();

router.use(healthRouter);
router.use(catalogRouter);
router.use(liveTvRouter);

export default router;

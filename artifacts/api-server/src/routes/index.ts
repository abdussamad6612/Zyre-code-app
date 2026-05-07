import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import sessionsRouter from "./sessions";
import githubRouter from "./github";
import billingRouter from "./billing";
import webhooksRouter from "./webhooks";
import inngestRouter from "./inngest";
import extrasRouter from "./extras";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(sessionsRouter);
router.use(githubRouter);
router.use(billingRouter);
router.use(webhooksRouter);
router.use(inngestRouter);
router.use(extrasRouter);

export default router;

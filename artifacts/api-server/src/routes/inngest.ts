import { Router, type Request, type Response } from "express";
import { serve } from "inngest/express";
import { inngest } from "../lib/inngest";

const router = Router();

const handler = serve({
  client: inngest,
  functions: [],
  signingKey: process.env.INNGEST_SIGNING_KEY,
});

router.use("/inngest", (req: Request, res: Response) => {
  return (handler as any)(req, res);
});

export default router;

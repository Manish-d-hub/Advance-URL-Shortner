import { Router } from "express";

import authRouter from "./authRoute.js";
import urlRouter from "./urlRoute.js";
import analyticsRouter from "./analyticsRoute.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/url", urlRouter);
router.use("/analytics", analyticsRouter);

export default router;

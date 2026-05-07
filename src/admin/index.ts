import { Router } from "express";
import tokenRouter from "./tokens";
import positionRouter from "./position";
import candidateRouter from "./candidate";
import voterRouter from "./voter";

const router = Router();

router.use("/token", tokenRouter);
router.use("/position", positionRouter);
router.use("/candidate", candidateRouter);
router.use("/voter", voterRouter);

export default router;
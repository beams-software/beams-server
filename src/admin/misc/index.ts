import { Router } from "express";
import { returnIfNotAuthorized } from "../tokens/utils";
import prisma from "../../prisma";

const router = Router();

router.get("/dashboardStats", async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const totalVoters = await prisma.voters.count();
    const votedVoters = await prisma.voters.count({ where: { voted: true } })
    const totalPositions = await prisma.positions.count();
    const totalCandidates = await prisma.candidates.count();
    const votingEnabled: boolean = req.app.locals.votingEnabled;

    res.json({
        totalVoters, votedVoters, totalPositions, totalCandidates, votingEnabled
    })
})

router.post("/votingEnable/:stat", async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;

    const stat = req.params.stat
    if (stat === "false") {
        req.app.locals.votingEnabled = false;
    }else{
        req.app.locals.votingEnabled = true;
    }

    res.json({ status: 200 })
})

export default router;
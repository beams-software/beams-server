import { Router } from "express";
import { returnIfNotAuthorized } from "../tokens/utils";
import { createCandidate, deleteCandidate, getCandidateById, getCandidates, getCandidatesByPosition, updateCandidate } from "./utils";
import { uploadCandidate } from "../../mult";
import fs from "fs";

const router = Router();

router.get("/getCandidates", async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const candidates = await getCandidates();
    res.json({
        status: 200,
        result: candidates
    })
});

router.get("/getCandidatesByPosition/:id", async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const candidates = await getCandidatesByPosition(parseInt(req.params.id));
    res.json({
        status: 200,
        result: candidates
    })
});

router.post("/createCandidate", uploadCandidate.single('photo'), async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const { admid, name, grade, house, votes, positionId } = req.body;
    const parsedAdmid = parseInt(admid);
    const parsedVotes = parseInt(votes);
    const parsedPositionId = parseInt(positionId);
    const parsedGrade = parseInt(grade);
    try {
        const candidate = await createCandidate({
            admid: parsedAdmid,
            name,
            grade: parsedGrade,
            house,
            votes: parsedVotes,
            photo: req.file?.filename as string,
            positionId: parsedPositionId
        });
        res.json({
            status: 200,
            result: candidate
        })
    } catch (error) {
        res.json({
            status: 500,
            result: "Error creating candidate",
            error: error
        })
    }

}
);

router.post("/updateCandidate", uploadCandidate.single('photo'), async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const oldCandidate = await getCandidateById(parseInt(req.body.admid));
    if (!oldCandidate) {
        res.json({
            status: 404,
            result: "Candidate not found"
        })
        return;
    }
    fs.unlink(`./static/candidates/${oldCandidate.photo}`, async (err) => {
        const { admid, name, grade, house, votes, positionId } = req.body;
        const parsedAdmid = parseInt(admid);
        const parsedVotes = parseInt(votes);
        const parsedPositionId = parseInt(positionId);
        const parsedGrade = parseInt(grade);
        try {
            const candidate = await updateCandidate({
                admid: parsedAdmid,
                name,
                grade: parsedGrade,
                house,
                votes: parsedVotes,
                photo: req.file?.filename as string,
                positionId: parsedPositionId
            });
            res.json({
                status: 200,
                result: candidate
            })
        } catch (error) {
            res.json({
                status: 500,
                result: "Error updating candidate",
                error: error
            })
        }

    });
}
);

router.delete("/deleteCandidate/:admid", async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const admid = parseInt(req.params.admid);
    const candidate = await getCandidateById(admid);
    if (!candidate) {
        res.json({
            status: 404,
            result: "Candidate not found"
        })
        return;
    }
    fs.unlink(`./static/candidates/${candidate.photo}`, async (err) => {
        const deletedCandidate = await deleteCandidate(admid);
        res.json({
            status: 200,
            result: deletedCandidate
        })
    });
});

router.get("/getCandidateById/:admid", async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const admid = parseInt(req.params.admid);
    const candidate = await getCandidateById(admid);
    if (!candidate) {
        res.json({
            status: 404,
            result: "Candidate not found"
        })
        return;
    }
    res.json({
        status: 200,
        result: candidate
    })
});

router.delete("/deleteAllCandidates", async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const candidates = await getCandidates();
    candidates.forEach(async (candidate) => {
        fs.unlink(`./static/candidates/${candidate.photo}`, (err) => { })
        await deleteCandidate(candidate.admid);
    })
    res.json({
        status: 200,
        result: "All candidates deleted"
    })
});

export default router;
import { Router } from "express";
import { createPosition, deletePosition, getDetailedPositions, getPositionInfo, getPositions, updatePosition } from "./utils";
import { returnIfNotAuthorized } from "../tokens/utils";
import fs from "fs";

const router = Router();

router.get("/getPositions", async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const positions = await getPositions();
    res.json({
        status: 200,
        result: positions
    })
});

router.get("/getDetailedPositions", async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const positions = await getDetailedPositions();
    res.json({
        status: 200,
        result: positions
    })
});

router.get("/getPositionInfo/:id", async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const position = await getPositionInfo(parseInt(req.params.id));
    if (!position) {
        res.json({
            status: 404,
            result: "Position not found"
        })
        return;
    }
    res.json({
        status: 200,
        result: position
    })
});

router.post("/createPosition", async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const { priority, name, wcs } = req.body;
    const position = await createPosition(priority, name, wcs);
    res.json({
        status: 200,
        result: position
    })
});

router.post("/updatePosition", async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const { id, priority, name, wcs } = req.body;
    try {
        const position = await updatePosition(id, priority, name, wcs);
        res.json({
            status: 200,
            result: position
        })
    } catch (error) {
        res.json({
            status: 500,
            result: "Cannot find position with that ID",
            error: error
        })
    }
});

router.delete("/deletePosition/:id", async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const id = parseInt(req.params.id);

    const pos = await getPositionInfo(id);
    if (!pos) {
        res.json({
            status: 404,
            result: "Position not found"
        })
        return;
    }
    pos.candidates.forEach((candidate) => {
        fs.unlink(`./static/candidates/${candidate.photo}`, (err) => { })
    })

    try {
        const position = await deletePosition(id);
        res.json({
            status: 200,
            result: position
        })
    } catch (error) {
        res.json({
            status: 500,
            result: "Cannot find position with that ID",
            error: error
        })
    }
});

router.delete("/deleteAllPositions", async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const positions = await getDetailedPositions();
    positions.forEach(async (position) => {
        position.candidates.forEach((candidate) => {
            fs.unlink(`./static/candidates/${candidate.photo}`, (err) => { })
        })
        await deletePosition(position.id);
    })
    res.json({
        status: 200,
        result: "All positions deleted"
    })
});

export default router;
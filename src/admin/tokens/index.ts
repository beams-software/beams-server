import { Router } from "express";
import { getTokens, createToken, deleteToken, checkLoggedIn, returnIfNotAuthorized} from "./utils";

const router = Router();

router.get("/check", async (req, res) => {
    res.json({
        result: await checkLoggedIn(req),
        status: 200
    })
});

router.get("/getTokens", async (req, res) => { 
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const tokens = await getTokens();
    res.json({ result: tokens });
});

router.post("/createToken", async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const token  = req.body?.token;
    if (!token) {
        res.status(400).json({ error: "Token is required", status: 400 });
        return;
    }
    const result = await createToken(token);
    res.json({ result, status: 200 });
});

router.delete("/deleteToken", async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const token  = req.body?.token;
    if (!token) {
        res.status(400).json({ error: "Token is required", status: 400 });
        return;
    }
    try {
        const result = await deleteToken(token);
        res.json({ result, status: 200 });
    } catch (error) {
        res.status(500).json({ error: "Token not found", status: 500 });
    }
    
}
);

export default router;
import { Router } from "express";
import * as XLSX from "xlsx";
import { returnIfNotAuthorized } from "../tokens/utils";
import {
    createMultipleVoters,
    createVoter,
    deleteAllVoters,
    deleteVoter,
    deleteVotersByClassAndGrade,
    deleteVotersByGrade,
    deleteVotersByHouse,
    getUnvotedCount,
    getUnvotedVoters,
    getVotedCount,
    getVotedVoters,
    getVoters,
    getVotersByClass,
    getVotersByClassAndGrade,
    getVotersByHouse,
    getVotersWithoutVotedInfo,
    updateVoter,
    Voter
} from "./utils";
import { upload } from "../../mult";
import fs from "fs";

const router = Router();

interface PseudoVoter {
    admid: string;
    name: string;
    grade: string;
    house: string;
    class: string;
}

const pseudoVoterToVoter = (voters: PseudoVoter[]): Voter[] => {
    return voters.map((voter) => {
        return {
            admid: parseInt(voter.admid),
            name: voter.name,
            grade: parseInt(voter.grade),
            house: voter.house,
            class: voter.class
        }
    })
}

router.get("/getVoters", async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const voters = await getVotersWithoutVotedInfo();
    res.json({
        status: 200,
        result: voters
    })
});

router.get("/getDetailedVoters", async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const voters = await getVoters();
    res.json({
        status: 200,
        result: voters
    })
});

router.get("/getVotersByClass/:className", async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const className = req.params.className;
    const voters = await getVotersByClass(className);
    res.json({
        status: 200,
        result: voters
    })
});

router.get("/getVotersByHouse/:houseName", async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const houseName = req.params.houseName;
    const voters = await getVotersByHouse(houseName);
    res.json({
        status: 200,
        result: voters
    })
});

router.get('/getVotersByClassAndGrade/:grade/:className', async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const className = req.params.className;
    const grade = parseInt(req.params.grade);
    const voters = await getVotersByClassAndGrade(className, grade);
    res.json({
        status: 200,
        result: voters
    })
});

router.get('/getVotedVoters', async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const voters = await getVotedVoters();
    res.json({
        status: 200,
        result: voters
    });
});


router.get('/getUnvotedVoters', async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const voters = await getUnvotedVoters();
    res.json({
        status: 200,
        result: voters
    });
});

router.get('/getVotedCount', async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const count = await getVotedCount();
    res.json({
        status: 200,
        result: count
    });
});

router.get('/getUnvotedCount', async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const count = await getUnvotedCount();
    res.json({
        status: 200,
        result: count
    });
});

router.post('/createVoter', async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const { name, admid, class: class_, house, grade } = req.body;
    const voter = await createVoter({ admid, name, grade, house, class: class_ });
    res.json({
        status: 200,
        result: voter
    });
});

router.post('/createMultipleVoters', upload.single('file'), async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const fileName = req.file?.filename as string;
    const filePath = `./static/${fileName}`;
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const firstRow = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];
        if (firstRow[0] !== 'admid' || firstRow[1] !== 'name' || firstRow[2] !== 'grade' || firstRow[3] !== 'class' || firstRow[4] !== 'house') {
            res.json({
                status: 400,
                result: "Invalid file format"
            });
            fs.unlink(filePath, (err) => { });
            return;
        }
        const json = XLSX.utils.sheet_to_json(worksheet) as Voter[];
        await createMultipleVoters((json));
    } catch (error) {
        res.json({
            status: 500,
            result: "Error creating voters",
            error: error
        });
        fs.unlink(filePath, (err) => { });
        return;
    }

    res.json({
        status: 200,
        result: "Voters created successfully"
    });

    fs.unlink(filePath, (err) => { });
});

router.post('/updateVoter', async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const { name, admid, class: class_, house, grade, voted, votedInfo } = req.body;
    try {
        const voter = await updateVoter({ admid, name, grade, house, class: class_, voted, votedInfo });
        res.json({
            status: 200,
            result: voter
        });
    } catch (error) {
        res.json({
            status: 500,
            result: "Error updating voter",
            error: error
        });
    }
});

router.delete('/deleteVoter/:admid', async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const admid = parseInt(req.params.admid);
    try {
        const result = await deleteVoter(admid);
        res.json({
            status: 200,
            result: result
        });
    } catch (error) {
        res.json({
            status: 500,
            result: "Error deleting voter",
            error: error
        });
    }
});

router.delete('/deleteVotersByHouse/:house', async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const house = (req.params.house);
    try {
        const result = await deleteVotersByHouse(house);
        res.json({
            status: 200,
            result: result
        });
    } catch (error) {
        res.json({
            status: 500,
            result: "Error deleting voters",
            error: error
        });
    }
});

router.delete('/deleteVotersByGrade/:grade', async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const grade = parseInt(req.params.grade);
    try {
        const result = await deleteVotersByGrade(grade);
        res.json({
            status: 200,
            result: result
        });
    } catch (error) {
        res.json({
            status: 500,
            result: "Error deleting voters",
            error: error
        });
    }
});

router.delete('/deleteVotersByClassAndGrade/:className/:grade', async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    const className = req.params.className;
    const grade = parseInt(req.params.grade);
    try {
        const result = await deleteVotersByClassAndGrade(className, grade);
        res.json({
            status: 200,
            result: result
        });
    } catch (error) {
        res.json({
            status: 500,
            result: "Error deleting voters",
            error: error
        });
    }
});

router.delete('/deleteAllVoters', async (req, res) => {
    const loggedIn = await returnIfNotAuthorized(req, res);
    if (!loggedIn) return;
    try {
        const result = await deleteAllVoters();
        res.json({
            status: 200,
            result: result
        });
    }catch (error) {
        res.json({
            status: 500,
            result: "Error deleting voters",
            error: error
        });
    }
});


export default router;
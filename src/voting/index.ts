import { Router } from "express";
import { getVoterByAdmidAndHouse, submitVote, voteSubmissionSchema } from "../admin/voter/utils";
import { z } from "zod";
import { getCandidates } from "../admin/candidate/utils";
import { getIO } from "../socketManager"

const router = Router();

router.get("/heartbeat", async (req, res) => {
  res.json({
    v: req.app.locals.votingEnabled,
  });
});

router.get("/getVoter/:admid/:house", async (req, res) => {
  res.json({
    status: 200,
    voter: await getVoterByAdmidAndHouse(
      z.coerce.number().parse(req.params.admid),
      req.params.house,
    ),
  });
});

router.get("/getCandidates", async (req, res) => {
  const rawCandidates = await getCandidates();
  type CleanedCandidatesArray = Omit<typeof rawCandidates[number], 'position' | '_count'>[];
  const grouped = Object.values(
    rawCandidates.reduce(
      (acc, candidate) => {
        const positionId = candidate.position.id;

        if (!acc[positionId]) {
          acc[positionId] = {
            position: candidate.position,
            candidates: [],
          };
        }

        const { position, _count,...candidateWithoutPositionAndCount } = candidate;

        acc[positionId].candidates.push(candidateWithoutPositionAndCount);

        return acc;
      },
      {} as Record<
        number,
        {
          position: (typeof rawCandidates)[number]["position"];
          candidates: CleanedCandidatesArray;
        }
      >,
    ),
  ).sort(
    (a, b) =>
      b.position.priorityNumber -
      a.position.priorityNumber
  );

  res.json({
    status: 200,
    result: grouped
  })
});

router.post("/submitVote", async (req, res) => {
    const data = voteSubmissionSchema.parse(req.body);
    try {
        await submitVote(data);
        res.json({
            status: 200
        })
        getIO().emit("submitted-vote", { admid : data.admid, votedComputer : data.votedInfo.votingData.votedComputer })
    } catch (error) {
        res.status(500).json({
            status: 500
        })
    }
})

export default router;

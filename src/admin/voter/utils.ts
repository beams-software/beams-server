import z, { includes } from "zod";
import prisma from "../../prisma";

interface Voter {
  admid: number;
  name: string;
  grade: number;
  house: string;
  class: string;
  voted: boolean;
  votedInfo: object;
}

const voteSubmissionSchema = z.object({
  admid: z.number(),
  votedInfo: z.object({
    createdAt: z.string().default(() => new Date().toISOString()),
    editedAt: z.string().default(() => new Date().toISOString()),
    absent: z.stringbool().default(false).or(z.boolean().default(false)),
    votingData: z.object({
      votedAt: z.string(),
      votedComputer: z.string(),
      toWho: z.array(
        z.object({ positionId: z.number(), candidateAdmId: z.number() }),
      ),
    }),
  }),
});

const getVoters = async () => {
  const voters = await prisma.voters.findMany({});
  return voters;
};

const getVotersWithoutVotedInfo = async () => {
  const voters = await prisma.voters.findMany({
    select: {
      admid: true,
      name: true,
      grade: true,
      house: true,
      class: true,
      voted: true,
      votedInfo: false,
    },
  });

  return voters;
};
const getVotedVoters = async () => {
  const voters = await prisma.voters.findMany({
    where: {
      voted: true,
    },
  });
  return voters;
};

const getUnvotedVoters = async () => {
  const voters = await prisma.voters.findMany({
    where: {
      voted: false,
    },
  });
  return voters;
};

const getVotedCount = async () => {
  const count = await prisma.voters.count({
    where: {
      voted: true,
    },
  });
  return count;
};

const getUnvotedCount = async () => {
  const count = await prisma.voters.count({
    where: {
      voted: false,
    },
  });
  return count;
};

const getVotersByClass = async (className: string) => {
  const voters = await prisma.voters.findMany({
    where: {
      class: className,
    },
  });
  return voters;
};

const getVotersByGrade = async (grade: number) => {
  const voters = await prisma.voters.findMany({
    where: {
      grade: grade,
    },
  });
  return voters;
};

const getVotersByHouse = async (house: string) => {
  const voters = await prisma.voters.findMany({
    where: {
      house: house,
    },
  });
  return voters;
};

const getVotersByClassAndGrade = async (className: string, grade: number) => {
  const voters = await prisma.voters.findMany({
    where: {
      class: className,
      grade: grade,
    },
  });
  return voters;
};

const createVoter = async (voter: Voter) => {
  const voter_ = await prisma.voters.create({
    data: {
      name: voter.name,
      admid: voter.admid,
      grade: voter.grade,
      house: voter.house,
      class: voter.class,
      voted: voter.voted,
      votedInfo: voter.votedInfo,
    },
  });
  return voter_;
};

const createMultipleVoters = async (voters: Voter[]) => {
  const admids = voters.map((v) => v.admid);

  const existingVoters = await prisma.voters.findMany({
    where: {
      admid: {
        in: admids,
      },
    },
  });

  const existingMap = new Map(existingVoters.map((v) => [v.admid, v]));

  const conflicts = voters
    .filter((v) => existingMap.has(v.admid))
    .map((v) => ({
      uploadedRow: v,
      existingRow: existingMap.get(v.admid)!,
    }));

  if (conflicts.length > 0) {
    return {
      success: false,
      conflicts,
    };
  }

  const createdVoters = await prisma.voters.createMany({
    data: voters.map((voter) => ({
      name: voter.name,
      admid: voter.admid,
      grade: voter.grade,
      house: voter.house,
      class: voter.class,
      voted: voter.voted,
      votedInfo: voter.votedInfo,
    })),
  });

  return {
    success: true,
    created: createdVoters.count,
  };
};

const updateVoter = async (voter: Voter) => {
  const voter_ = await prisma.voters.update({
    where: {
      admid: voter.admid,
    },
    data: {
      name: voter.name,
      grade: voter.grade,
      house: voter.house,
      class: voter.class,
      voted: voter.voted,
      votedInfo: voter.votedInfo,
    },
  });
  return voter_;
};

const deleteVoter = async (admid: number) => {
  const voter = await prisma.voters.delete({
    where: {
      admid: admid,
    },
  });
  return voter;
};

const deleteVotersByClassAndGrade = async (
  className: string,
  grade: number,
) => {
  const voters = await prisma.voters.deleteMany({
    where: {
      class: className,
      grade: grade,
    },
  });
  return voters;
};

const deleteVotersByHouse = async (house: string) => {
  const voters = await prisma.voters.deleteMany({
    where: {
      house: house,
    },
  });
  return voters;
};

const deleteVotersByGrade = async (grade: number) => {
  const voters = await prisma.voters.deleteMany({
    where: {
      grade: grade,
    },
  });
  return voters;
};

const deleteAllVoters = async () => {
  const voters = await prisma.voters.deleteMany({});
  return voters;
};

const getGradesAndCount = async () => {
  const grades = await prisma.voters.groupBy({
    by: ["grade"],
    _count: {
      grade: true,
    },
  });
  return grades.map((grade) => ({
    grade: grade.grade,
    count: grade._count.grade,
  }));
};

const markAbsent = async (admids: number[]) => {
  await prisma.$transaction(async (tx) => {
    // Delete all votes cast by these voters
    await tx.vote.deleteMany({
      where: {
        voterAdmid: {
          in: admids,
        },
      },
    });

    // Mark them as absent and not voted
    const voters = await tx.voters.findMany({
      where: {
        admid: {
          in: admids,
        },
      },
    });

    await Promise.all(
      voters.map((voter) =>
        tx.voters.update({
          where: {
            admid: voter.admid,
          },
          data: {
            voted: false,
            votedInfo: {
              ...(voter.votedInfo as any),
              absent: true,
              editedAt: new Date().toISOString(),
              votingData: {},
            },
          },
        }),
      ),
    );
  });
};

const markPresent = async (admids: number[]) => {
  await prisma.$transaction(async (tx) => {
    const voters = await tx.voters.findMany({
      where: {
        admid: {
          in: admids,
        },
      },
    });

    await Promise.all(
      voters.map((voter) =>
        tx.voters.update({
          where: {
            admid: voter.admid,
          },
          data: {
            votedInfo: {
              ...(voter.votedInfo as any),
              absent: false,
              editedAt: new Date().toISOString(),
            },
          },
        }),
      ),
    );
  });
};

const deleteVotes = async (admids: number[]) => {
  await prisma.$transaction(async (tx) => {
    await tx.vote.deleteMany({
      where: {
        voterAdmid: {
          in: admids,
        },
      },
    });

    const voters = await tx.voters.findMany({
      where: {
        admid: {
          in: admids,
        },
      },
    });

    await Promise.all(
      voters.map((voter) =>
        tx.voters.update({
          where: {
            admid: voter.admid,
          },
          data: {
            voted: false,
            votedInfo: {
              ...(voter.votedInfo as any),
              editedAt: new Date().toISOString(),
              votingData: {},
            },
          },
        }),
      ),
    );
  });
};

const deleteVoters = async (admids: number[]) => {
  await prisma.$transaction(async (tx) => {
    await tx.voters.deleteMany({
      where: {
        admid: {
          in: admids,
        },
      },
    });
  });
};

const getClassesAndCount = async (grade: number) => {
  const classes = await prisma.voters.groupBy({
    by: ["class"],
    where: {
      grade: grade,
    },
    _count: {
      class: true,
    },
  });
  return classes.map((cls) => ({
    class: cls.class,
    count: cls._count.class,
  }));
};

const getVoterByAdmidAndHouse = async (admid: number, house: string) => {
  const voter = await prisma.voters.findUnique({
    where: {
      admid: admid,
    },
  });
  if (voter) {
    if (voter.house === house) {
      return voter;
    }
    return null;
  }
  return null;
};

const submitVote = async (
  voteSubmissionData: z.infer<typeof voteSubmissionSchema>,
) => {
  await prisma.$transaction([
    prisma.vote.createMany({
      data: voteSubmissionData.votedInfo.votingData.toWho.map((vote) => ({
        voterAdmid: voteSubmissionData.admid,
        candidateAdmid: vote.candidateAdmId,
        positionId: vote.positionId,
      })),
    }),

    prisma.voters.update({
      where: {
        admid: voteSubmissionData.admid,
      },
      data: {
        voted: true,
        votedInfo: voteSubmissionData.votedInfo,
      },
    }),
  ]);
};

const getVoterDetail = async (admid: number) => {
  const voter = await prisma.voters.findUnique(
    {
      where: {
        admid: admid
      },
      include: {
        votes: {
          include: {
            candidate: {
              select: {
                name: true
              }
            },
            position: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            position: {
              priorityNumber: 'desc'
            } 
          }
        }
      }
    }
  )
  return voter
}

const getLiveFeedVoterStats = async () => {
  const [totalPerGrade, votedPerGrade] = await Promise.all([
    prisma.voters.groupBy({
      by: ["grade"],
      _count: {
        _all: true,
      },
    }),

    prisma.voters.groupBy({
      by: ["grade"],
      where: {
        voted: true,
      },
      _count: {
        _all: true,
      },
    }),
  ]);

  const all_result = totalPerGrade.map((total) => ({
    grade: total.grade,
    totalVoters: total._count._all,
    votedVoters:
      votedPerGrade.find((v) => v.grade === total.grade)?._count._all ?? 0,
  }));

  const [totalClasses, votedClasses] = await Promise.all([
    prisma.voters.groupBy({
      by: ["grade", "class"],
      _count: {
        _all: true,
      },
    }),

    prisma.voters.groupBy({
      by: ["grade", "class"],
      where: {
        voted: true,
      },
      _count: {
        _all: true,
      },
    }),
  ]);

  const result = totalClasses.map((cls) => ({
    grade: cls.grade,
    class: cls.class,
    totalVoters: cls._count._all,
    votedVoters:
      votedClasses.find((v) => v.grade === cls.grade && v.class === cls.class)
        ?._count._all ?? 0,
  }));

  type GradeStats = {
    grade: number;
    classes: {
      class: string;
      totalVoters: number;
      votedVoters: number;
    }[];
  };

  const grouped: GradeStats[] = Object.values(
    result.reduce<Record<number, GradeStats>>((acc, row) => {
      if (!acc[row.grade]) {
        acc[row.grade] = {
          grade: row.grade,
          classes: [],
        };
      }

      acc[row.grade].classes.push({
        class: row.class,
        totalVoters: row.totalVoters,
        votedVoters: row.votedVoters,
      });

      return acc;
    }, {}),
  );

  const grouped_result = grouped.map((p) => {
    return [
      `Grade ${p.grade}`,
      p.classes.map((c) => {
        return {
          key: c.class,
          value: (c.votedVoters / c.totalVoters) * 100,
          realValue: c.votedVoters,
          total: c.totalVoters,
        };
      }),
    ];
  });

  const all_result_final = [
    "ALL GRADES",
    all_result.map((p) => {
      return {
        key: `Grade ${p.grade}`,
        value: (p.votedVoters / p.totalVoters) * 100,
        realValue: p.votedVoters,
        total: p.totalVoters,
      };
    }),
  ];

  const finalResult = [all_result_final, ...grouped_result];

  return finalResult
};

export {
  getVoters,
  getVotersWithoutVotedInfo,
  getVotedVoters,
  getUnvotedVoters,
  getVotedCount,
  getUnvotedCount,
  getVotersByClass,
  getVotersByGrade,
  getVotersByHouse,
  getVotersByClassAndGrade,
  createVoter,
  createMultipleVoters,
  updateVoter,
  deleteVoter,
  deleteVotersByClassAndGrade,
  deleteVotersByHouse,
  deleteVotersByGrade,
  deleteAllVoters,
  getGradesAndCount,
  markAbsent,
  markPresent,
  deleteVotes,
  deleteVoters,
  getClassesAndCount,
  getVoterByAdmidAndHouse,
  submitVote,
  voteSubmissionSchema,
  getVoterDetail,
  getLiveFeedVoterStats,
  Voter,
};

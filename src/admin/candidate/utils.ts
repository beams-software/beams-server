import prisma from "../../prisma";
import fs from "fs";

interface Candidate {
    admid: number,
    name: string,
    grade: number,
    house: string,
    startingVotes: number,
    photo: string,
    positionId: number
}

const getCandidates = async () => {
    const candidates = await prisma.candidates.findMany({
        include: {
            position: true,
            _count: {
                select: {
                    votes: true
                }
            }
        },
        orderBy: [
            {
                position: {
                    priorityNumber: 'desc'
                }
            },
            { 
                name: 'asc'
            }
        ]
    });
    return candidates;
};

const getCandidatesByPosition = async (positionId: number) => {
    const candidates = await prisma.candidates.findMany({
        where: {
            positionId: positionId
        },
        include: {
            _count: {
                select: {
                    votes: true
                }
            }
        },
        orderBy: {
            name: 'asc',
        }
    });
    return candidates;
}

const createCandidate = async ({ admid, name, grade, house, startingVotes, photo, positionId }: Candidate) => {
    const candidate = await prisma.candidates.create({
        data: {
            admid: admid,
            name: name,
            grade: grade,
            house: house,
            startingVotes: startingVotes,
            photo: photo,
            positionId: positionId
        }
    })
    return candidate;
}

const updateCandidate = async ({ admid, name, grade, house, startingVotes, photo, positionId }: Candidate) => {
    const candidate = await prisma.candidates.update({
        where: {
            admid: admid
        },
        data: {
            name: name,
            grade: grade,
            house: house,
            startingVotes: startingVotes,
            photo: photo,
            positionId: positionId
        }
    })
    return candidate;
}

const deleteCandidate = async (admid: number) => {
    const candidateToDelete = await getCandidateById(admid);
    if (!candidateToDelete) {
        return null;
    }

    fs.unlink(`./static/candidates/${candidateToDelete.photo}`, (err) => { })
    
    const candidate = await prisma.candidates.delete({
        where: {
            admid: admid
        }
    })
    return candidate;
}

const getCandidateById = async (admid: number) => {
    const candidate = await prisma.candidates.findUnique({
        where: {
            admid: admid
        },
        include: {
            position: true
        }
    })
    return candidate;
}

export {
    getCandidates,
    getCandidatesByPosition,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    getCandidateById,
}
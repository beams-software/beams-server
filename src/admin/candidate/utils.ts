import prisma from "../../prisma";

interface Candidate {
    admid: number,
    name: string,
    grade: number,
    house: string,
    votes: number,
    photo: string,
    positionId: number
}

const getCandidates = async () => {
    const candidates = await prisma.candidates.findMany({
        include: {
            position: true
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
        orderBy: {
            name: 'asc',
        }
    });
    return candidates;
}

const createCandidate = async ({ admid, name, grade, house, votes, photo, positionId }: Candidate) => {
    const candidate = await prisma.candidates.create({
        data: {
            admid: admid,
            name: name,
            grade: grade,
            house: house,
            votes: votes,
            photo: photo,
            positionId: positionId
        }
    })
    return candidate;
}

const updateCandidate = async ({ admid, name, grade, house, votes, photo, positionId }: Candidate) => {
    const candidate = await prisma.candidates.update({
        where: {
            admid: admid
        },
        data: {
            name: name,
            grade: grade,
            house: house,
            votes: votes,
            photo: photo,
            positionId: positionId
        }
    })
    return candidate;
}

const deleteCandidate = async (admid: number) => {
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
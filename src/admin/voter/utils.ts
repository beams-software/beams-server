import prisma from "../../prisma";

interface Voter{
    admid: number;
    name: string;
    grade: number;
    house: string;
    class: string;
    voted?: boolean;
    votedInfo?: object;
}

const getVoters = async () => {
    const voters = await prisma.voters.findMany({});
    return voters;
}

const getVotersWithoutVotedInfo = async () => {
    const voters = await prisma.voters.findMany({
        select:{
            admid: true,
            name: true,
            grade: true,
            house: true,
            class: true,
            voted: true,
            votedInfo: false
        }
    })
    
    return voters;
}
const getVotedVoters = async () => {
    const voters = await prisma.voters.findMany({
        where: {
            voted: true
        }
    });
    return voters;
}

const getUnvotedVoters = async () => {
    const voters = await prisma.voters.findMany({
        where: {
            voted: false
        }
    });
    return voters;
}

const getVotedCount = async () => {
    const count = await prisma.voters.count({
        where: {
            voted: true
        }
    });
    return count;
}

const getUnvotedCount = async () => {
    const count = await prisma.voters.count({
        where: {
            voted: false
        }
    });
    return count;
}

const getVotersByClass = async (className: string) => {
    const voters = await prisma.voters.findMany({
        where: {
            class: className
        }
    });
    return voters;
}

const getVotersByGrade = async (grade: number) => {
    const voters = await prisma.voters.findMany({
        where: {
            grade: grade
        }
    });
    return voters;
}

const getVotersByHouse = async (house: string) => {
    const voters = await prisma.voters.findMany({
        where: {
            house: house
        }
    });
    return voters;
}

const getVotersByClassAndGrade = async (className: string, grade: number) => {
    const voters = await prisma.voters.findMany({
        where: {
            class: className,
            grade: grade
        }
    });
    return voters;
}

const createVoter = async (voter : Voter) => {
    const voter_ = await prisma.voters.create({
        data: {
            name: voter.name,
            admid: voter.admid,
            grade: voter.grade,
            house: voter.house,
            class: voter.class,
            voted: false,
            votedInfo: {}
        }
    })
    return voter_;
}

const createMultipleVoters = async (voters:Voter[]) => {
    const createdVoters = await prisma.voters.createMany({
        data: voters.map(voter => ({
            name: voter.name,
            admid: voter.admid,
            grade: voter.grade,
            house: voter.house,
            class: voter.class,
            voted: false,
            votedInfo: {}
        }))
    })
    return createdVoters;
}

const updateVoter = async (voter:Voter) => {
    const voter_ = await prisma.voters.update({
        where: {
            admid: voter.admid
        },
        data: {
            name: voter.name,
            grade: voter.grade,
            house: voter.house,
            class: voter.class,
            voted: voter.voted,
            votedInfo: voter.votedInfo
        }
    })
    return voter_;
}

const deleteVoter = async (admid: number) => {
    const voter = await prisma.voters.delete({
        where: {
            admid: admid
        }
    })
    return voter;
}

const deleteVotersByClassAndGrade = async (className: string, grade: number) => {
    const voters = await prisma.voters.deleteMany({
        where: {
            class: className,
            grade: grade
        }
    })
    return voters;
}

const deleteVotersByHouse = async (house: string) => {
    const voters = await prisma.voters.deleteMany({
        where: {
            house: house
        }
    })
    return voters;
}

const deleteVotersByGrade = async (grade: number) => {
    const voters = await prisma.voters.deleteMany({
        where: {
            grade: grade
        }
    })
    return voters;
}

const deleteAllVoters = async () => {
    const voters = await prisma.voters.deleteMany({})
    return voters;

}


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
    Voter
}
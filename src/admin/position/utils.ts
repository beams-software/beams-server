import prisma from "../../prisma";

const getPositions = async () => {
    const positions = await prisma.positions.findMany({
        include: {
            _count: {
                select: {
                    candidates: true
                }
            }
        },
        orderBy: {
            priorityNumber: 'desc'
        }
    });
    return positions;
}

const getPositionInfo = async (id: number) => {
    const position = await prisma.positions.findUnique({
        where: {
            id: id
        },
        include: {
            candidates: true
        }
    });

    return position;
}

const createPosition = async (priority: number, name: string, wcs: string) => {
    const position = await prisma.positions.create({
        data: {
            name: name,
            wcs: wcs,
            priorityNumber: priority
        }
    })
    return position;
}

const updatePosition = async (id: number, priority: number, name: string, wcs: string) => {
    const position = await prisma.positions.update({
        where: {
            id: id
        },
        data: {
            name: name,
            wcs: wcs,
            priorityNumber: priority
        }
    })
    return position;
}

const deletePosition = async (id: number) => {
    const position = await prisma.positions.delete({
        where: {
            id: id
        }
    })

    return position;
}

const getDetailedPositions = async () => {
    const positions = await prisma.positions.findMany({
        include: {
            _count: {
                select: {
                    candidates: true
                }
            },
            candidates: {
                orderBy: {
                    name: 'asc'
                }
            }
        },
        orderBy: {
            priorityNumber: 'desc'
        }
    });
    return positions;
}


export { getPositions, createPosition, updatePosition, deletePosition, getDetailedPositions, getPositionInfo };
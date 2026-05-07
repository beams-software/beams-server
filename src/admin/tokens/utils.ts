import prisma from "../../prisma";
import { Request, Response } from "express";

const checkToken = async (token: string) => {
    const token_data = await prisma.tokens.findFirst({where: { token: token }});
    return !!token_data;
}

const returnIfNotAuthorized = async (req: Request, res: Response) => {
    if (!await checkLoggedIn(req)) {
        res.status(401).json({ error: "Unauthorized", status: 401 });
        return false;
    }
    return true;
}

const checkLoggedIn = async (req: Request) => {
    const token = req.headers["x-token"] as string;
    if (!token) return false;
    return await checkToken(token);
}

const getTokens = async () => {
    const tokens = await prisma.tokens.findMany();
    return tokens
}

const createToken = async (token: string) => {
    const token_data = await prisma.tokens.create({data: { token: token }});
    return token_data
}

const deleteToken = async (token: string) => {
    const token_data = await prisma.tokens.delete({where: { token: token }});
    return token_data
}

export { checkToken, getTokens, createToken, deleteToken, checkLoggedIn, returnIfNotAuthorized};

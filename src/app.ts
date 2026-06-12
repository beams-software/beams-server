import express, { Request, Response } from 'express';
import prisma from './prisma';
import adminRoutes from './admin'
import votingRoutes from './voting'
import cors from "cors"

require('dotenv').config()
const app = express();
app.use(cors());

app.use(express.json());

app.get('/ping', (req: Request, res: Response) => {
    res.send('pong');
});

app.use('/static', express.static('./static'))

app.use('/admin', adminRoutes);

app.use("/voting", votingRoutes)

export default app;
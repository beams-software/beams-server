import express, { Request, Response } from 'express';
import prisma from './prisma';
import adminRoutes from './admin'
import votingRoutes from './voting'
import cors from "cors"
import { createServer } from 'http';
import { init } from './socketManager';

require('dotenv').config()
const app = express();
const server = createServer(app); // Bind Express to native HTTP server
init(server)

app.use(cors());

app.use(express.json());

app.locals.votingEnabled = true;

app.get('/ping', (req: Request, res: Response) => {
    res.send('pong');
});

app.use('/static', express.static('./static'))

app.use('/admin', adminRoutes);

app.use("/voting", votingRoutes)

export {
    app,
    server
}
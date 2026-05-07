import express, { Request, Response } from 'express';
import prisma from './prisma';
import adminRoutes from './admin'

require('dotenv').config()
const app = express();

app.use(express.json());

app.get('/ping', (req: Request, res: Response) => {
    res.send('pong');
});

app.use('/static', express.static('./static'))

app.use('/admin', adminRoutes);

export default app;
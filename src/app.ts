import express, { Request, Express } from 'express';
import { loadRoute } from './loader/route.loader';

const app: Express = express();

loadRoute(app);

export default app;

import express, { Express } from 'express';
import { requestContext } from './common/context';
import { dependencyLoader } from './loader/di.loader';
import { loadRoute } from './loader/route.loader';

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req: any, res, next) => {
	requestContext.enterWith('ewq');
	next();
});

const configApp = async (): Promise<void> => {
	await dependencyLoader();

	loadRoute(app);
};

configApp();

export default app;

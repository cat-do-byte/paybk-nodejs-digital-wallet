import { useContainer, useExpressServer } from 'routing-controllers';
import Container from 'typedi';
import { Express } from 'express';
import path from 'path';

export const loadRoute = (app: Express) => {
	useContainer(Container);

	console.log(path.join(__dirname, '..', '/controllers/*.ts'));
	useExpressServer(app, {
		controllers: [path.join(__dirname, '..', '/controllers/*.ts')],
		/*  authorizationChecker: authMiddleware,
        currentUserChecker,
        defaultErrorHandler: false, */
		validation: { stopAtFirstError: true },
		cors: {
			origin: '*',
		},
		// middlewares: [HandleNotFound, CustomErrorHandler],
	});
};

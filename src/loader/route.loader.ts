import { useContainer, useExpressServer } from 'routing-controllers';
import Container from 'typedi';
import { Express } from 'express';
import path from 'path';
import { HandleNotFound } from '../middlewares/notFound.middleware';
import { HandleErrorResponse } from '../middlewares/handleErrorResponse.middleware';

export const loadRoute = (app: Express) => {
	useContainer(Container);

	useExpressServer(app, {
		// controllers: [AuthController],
		controllers: [path.join(__dirname, '..', '/controllers/*.ts')],
		// authorizationChecker: authMiddleware,
		/*    currentUserChecker, */
		defaultErrorHandler: false,
		validation: {
			stopAtFirstError: true,
			forbidUnknownValues: false,
			whitelist: true,
			forbidNonWhitelisted: true,
		},
		cors: {
			origin: '*',
		},
		middlewares: [HandleNotFound, HandleErrorResponse],
	});
};

import { NextFunction, Request, Response } from 'express';
import { Action, ExpressMiddlewareInterface, HttpError } from 'routing-controllers';
import { requestContext } from '../common/context';
import { verifyToken } from '../utils';

/* export const authMiddleware = async (action: Action, roles: string[]) => {
	const authHeader = action.request.headers['authorization'];

	if (!authHeader) return false;
	const token = authHeader.split(' ')[1];
	const currentUser = await verifyToken(token);

	// console.log(currentUser, roles);
	// requestContext.enterWith(currentUser);
	// requestContext.enterWith(41234);

	const toe = requestContext.getStore();
	console.log('toe midde::', toe);

	if (currentUser && !roles.length) return true;
	if (currentUser && roles.find((role) => currentUser.role.indexOf(role) !== -1)) return true;

	return false;
};
 */
export const authMiddleware =
	(roles: string[]) => async (request: Request, response: Response, next: NextFunction) => {
		const authHeader = request.headers['authorization'];

		if (!authHeader) return false;
		const token = authHeader.split(' ')[1];
		const currentUser = await verifyToken(token);

		// console.log(currentUser, roles);
		requestContext.enterWith(currentUser);

		if (currentUser && !roles.length) {
			next();
			return false;
		}
		if (currentUser && roles.find((role) => currentUser.role.indexOf(role) !== -1)) {
			next();
			return false;
		}
		throw new HttpError(401, 'You dont have permission for this action');
	};

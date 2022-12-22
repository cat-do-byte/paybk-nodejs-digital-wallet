import { ExpressMiddlewareInterface, Middleware, NotFoundError } from 'routing-controllers';

@Middleware({ type: 'after' })
export class HandleNotFound implements ExpressMiddlewareInterface {
	use(request: Request, response: any, next: (err: any) => any) {
		if (!response.headersSent) {
			const error = new NotFoundError();
			next(error);
		}
	}
}

import { ExpressErrorMiddlewareInterface, Middleware } from 'routing-controllers';
import { Request, Response, NextFunction } from 'express';

@Middleware({ type: 'after' })
export class HandleErrorResponse implements ExpressErrorMiddlewareInterface {
	error(error: any, request: Request, response: Response, next: NextFunction) {
		if (!response.headersSent) {
			// console.log(error);

			/* console.log(error)
      
      if (error.errors)
        errorMsg = Object.values(error.errors[0]["constraints"])[0] */
			let errorMsg = error.message;
			const statusCode = error.status || 400;
			response.status(statusCode).json({
				success: false,
				status: statusCode,
				message: errorMsg,
				path: request.path,
				errors: error.errors,
			});
		}
	}
}

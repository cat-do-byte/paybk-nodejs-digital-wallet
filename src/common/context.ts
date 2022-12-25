import { AsyncLocalStorage } from 'async_hooks';
import { IRequestContext } from '../interfaces/requestContext.interface';

type ContextKey = 'reqId';

export const requestContext = new AsyncLocalStorage<any>();
// export const requestContext = new AsyncLocalStorage<IRequestContext>();

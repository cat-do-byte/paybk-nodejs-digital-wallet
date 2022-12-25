import jwt from 'jsonwebtoken';
import config from '../configuration';
import { IJwtPayload } from '../interfaces/jwt.interface';

const omit = (obj: object, exludes: string[]): object => {
	const excludeKeys = new Set(exludes);
	return Object.fromEntries(Object.entries(obj).filter(([key]) => !excludeKeys.has(key)));
};

const generateToken = (payload: IJwtPayload): string => {
	return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expires });
};

const verifyToken = (token: string): IJwtPayload => {
	return jwt.verify(token, config.jwt.secret) as IJwtPayload;
};

export { omit, generateToken, verifyToken };

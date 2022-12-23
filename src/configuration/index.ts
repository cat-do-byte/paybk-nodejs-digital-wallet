import 'reflect-metadata';
import * as dotenv from 'dotenv';
import path from 'path';
import { IConfigEnv } from '../interfaces/knexEnv.interface';
import { Config } from './validate/config.dto';
import { validateEnv } from './validateConfig';

dotenv.config({ path: path.join(__dirname, '..', '..', '/.env') });

const {
	DATABASE_NAME,
	DATABASE_USER,
	DATABASE_PASSWORD,
	DATABASE_HOST,
	PORT,
	NODE_ENV,
	REDIS_QUEUE_URL,
} = process.env;

const configOptions: Config = {
	env: (NODE_ENV as IConfigEnv) || IConfigEnv.DEVELOPMENT,
	database: {
		name: DATABASE_NAME || '',
		user: DATABASE_USER || '',
		password: DATABASE_PASSWORD || '',
		host: DATABASE_HOST || '',
		port: 5432,
		client: 'postgres',
	},
	port: Number(PORT),
	queue: {
		redisServer: REDIS_QUEUE_URL || '',
	},
};

const config: Config = new Config(configOptions);

validateEnv(config);

export default config;

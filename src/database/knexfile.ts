import { knexSnakeCaseMappers } from 'objection';
import path from 'path';
import config from '../configuration';
import { IKnexConfig } from '../interfaces/knexEnv.interface';

const knexConfig: IKnexConfig = {
	development: {
		client: config.database.client,
		connection: {
			database: config.database.name,
			user: config.database.user,
			password: config.database.password,
			host: config.database.host,
			port: config.database.port,
		},
		migrations: {
			directory: path.join(__dirname, '/migrations'),
		},
		seeds: {
			directory: path.join(__dirname, '/seeds'),
		},
	},
	production: {
		client: config.database.client,
		connection: {
			database: config.database.name,
			user: config.database.user,
			password: config.database.password,
			host: config.database.host,
			port: config.database.port,
		},
		migrations: {
			directory: path.join(__dirname, '/migrations'),
		},
		seeds: {
			directory: path.join(__dirname, '/seeds'),
		},
	},
};

export default knexConfig;

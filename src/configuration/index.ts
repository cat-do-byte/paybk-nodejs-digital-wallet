import 'reflect-metadata';
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '..', '..', '/.env') });

import {
	validate,
	validateOrReject,
	IsString,
	IsNumber,
	IsNotEmpty,
	ValidateNested,
	IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

class DatabaseConfig {
	@IsString()
	@IsNotEmpty()
	name!: string;

	@IsString()
	@IsNotEmpty()
	host!: string;

	@IsString()
	@IsNotEmpty()
	user!: string;

	@IsString()
	@IsNotEmpty()
	password!: string;

	@IsNumber()
	port!: number;

	@IsString()
	client!: string;

	constructor(params: DatabaseConfig) {
		Object.assign(this, params);
	}
}

class Config {
	@IsObject()
	@ValidateNested()
	@Type(() => DatabaseConfig)
	database!: DatabaseConfig;

	@IsNumber()
	port: number = 8000;

	constructor(params: Config) {
		Object.assign(this, params);
		this.database = new DatabaseConfig(params.database);
	}
}

const { DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD, DATABASE_HOST, PORT } = process.env;

const configOptions: Config = {
	database: {
		name: DATABASE_NAME || '',
		user: DATABASE_USER || '',
		password: DATABASE_PASSWORD || '',
		host: DATABASE_HOST || '',
		port: 5432,
		client: 'postgres',
	},
	port: Number(PORT),
};

const config: Config = new Config(configOptions);

validateOrReject(config, {
	whitelist: true,
	forbidNonWhitelisted: true,
	validationError: { target: false, value: false },
}).catch((errors: any) => {
	console.log(`Validation failed with following Errors:`);
	errors.forEach((obj: any) => {
		console.log(`${obj}`);
	});

	process.exit();
});

export default config;

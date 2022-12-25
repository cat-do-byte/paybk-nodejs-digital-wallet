import { IsString, IsNumber, IsNotEmpty, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

import { IConfigEnv } from '../../interfaces/knexEnv.interface';

export class DatabaseConfig {
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

export class QueueConfig {
	@IsString()
	redisServer: string;

	constructor(params: QueueConfig) {
		Object.assign(this, params);
	}
}

export class JwtConfig {
	@IsString()
	secret: string;

	@IsString()
	expires: string;

	constructor(params: JwtConfig) {
		Object.assign(this, params);
	}
}

export class Config {
	@IsString()
	env: IConfigEnv;

	@IsObject()
	@ValidateNested()
	@Type(() => DatabaseConfig)
	database!: DatabaseConfig;

	@IsNumber()
	port: number = 8000;

	@IsObject()
	@ValidateNested()
	@Type(() => QueueConfig)
	queue: QueueConfig;

	@IsObject()
	@ValidateNested()
	@Type(() => JwtConfig)
	jwt: JwtConfig;

	constructor(params: Config) {
		Object.assign(this, params);
		this.database = new DatabaseConfig(params.database);
		this.queue = new QueueConfig(params.queue);
		this.jwt = new JwtConfig(params.jwt);
	}
}

import * as bcrypt from 'bcrypt';
import { Model } from 'objection';
import { BaseModel } from './base.model';
import Wallet from './wallet.model';

export enum UserStatus {
	INACTIVE = 'inactive',
	ACTIVE = 'active',
	BANNED = 'banned',
}

export enum UserRole {
	CUSTOMER = 'customer',
	MERCHANT = 'merchant',
}

export default class User extends BaseModel {
	id: string;
	username: string;
	email: string;
	password: string;
	role: UserRole;
	status: UserStatus;

	wallet?: Wallet;

	static tableName = 'users';

	hiddens() {
		return ['password'];
	}

	static get jsonSchema() {
		return {
			type: 'object',
			required: ['username', 'email', 'password', 'role', 'status'],

			properties: {
				username: { type: 'string', minLength: 1, maxLength: 255 },
				email: { type: 'string', format: 'email' },
				password: { type: 'string', minLength: 6 },
				status: { type: 'string', enum: Object.values(UserStatus), default: UserStatus.INACTIVE },
				role: { type: 'string', enum: Object.values(UserRole) },
			},
		};
	}

	async $beforeInsert(): Promise<void> {
		super.$beforeInsert();

		this.username = this.username.trim();
		this.password = await bcrypt.hash(this.password, 10);
	}

	static relationMappings = () => ({
		wallet: {
			relation: Model.HasOneRelation,
			modelClass: Wallet,
			join: {
				from: 'users.id',
				to: 'wallets.userId',
			},
		},
	});
}

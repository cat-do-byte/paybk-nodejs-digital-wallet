import { BaseModel } from './base.model';

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
	username: string;
	email: string;
	password: string;
	role: UserRole;
	status: UserStatus;

	static tableName = 'users';

	static get jsonSchema() {
		return {
			type: 'object',
			required: ['username', 'email', 'password', 'role', 'status'],

			properties: {
				username: { type: 'string', minLength: 1, maxLength: 255 },
				email: { type: 'string', format: 'email' },
				password: { type: 'string', minLength: 6 },
				status: { type: 'string', enum: Object.values(UserStatus) },
				role: { type: 'string', enum: Object.values(UserRole) },
			},
		};
	}
}

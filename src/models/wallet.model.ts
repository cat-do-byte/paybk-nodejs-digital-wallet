import { Model, snakeCaseMappers } from 'objection';
import { BaseModel } from './base.model';
import User from './user.model';

export default class Wallet extends BaseModel {
	userId: number;
	balance: number;

	static tableName = 'wallets';

	static get jsonSchema() {
		return {
			type: 'object',
			required: ['userId', 'balance'],

			properties: {
				userId: { type: 'uuid' },
				balance: { type: 'number' },
			},
		};
	}

	$parseDatabaseJson(jsonRaw: Model): any {
		// process exclude properties is setted in hidden
		const json = super.$parseDatabaseJson(jsonRaw);
		return {
			...json,
			balance: Number(json.balance),
		};
	}

	static relationMappings = () => ({
		user: {
			relation: Model.BelongsToOneRelation,
			modelClass: User,

			join: {
				from: 'wallets.userId',
				to: 'users.id',
			},
		},
	});
}

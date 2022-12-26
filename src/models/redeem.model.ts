import { Model } from 'objection';
import { BaseModel } from './base.model';
import Transaction from './transaction.model';

export default class Redeem extends BaseModel {
	code: number;
	transactionId: string;

	transaction: Transaction;

	static tableName = 'redeems';

	static get jsonSchema() {
		return {
			type: 'object',
			required: ['code', 'transactionId'],

			properties: {
				transactionId: { type: 'uuid' },
				code: { type: 'string' },
			},
		};
	}

	static relationMappings = () => ({
		transaction: {
			relation: Model.BelongsToOneRelation,
			modelClass: Transaction,

			join: {
				from: 'redeems.transactionId',
				to: 'transactions.id',
			},
		},
	});
}

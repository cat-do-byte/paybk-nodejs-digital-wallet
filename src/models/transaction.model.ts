import { Model } from 'objection';
import { BaseModel } from './base.model';

export enum TransactionType {
	TRANSFER = 'transfer',
	REQUEST = 'request',
	PAYMENT = 'payment',
	WITHDRAW = 'withdraw',
	DEPOSIT = 'deposit',
}

export enum TransactionStatus {
	PROCESSING = 'processing',
	PENDING = 'pending',
	SUCCESS = 'success',
	CANCELED = 'canceled',
}

export default class Transaction extends BaseModel {
	id: string;
	senderId!: string;
	receiverId: string;
	charge: number;
	amount!: number;
	sendAmount: number;
	receiveAmount: number;
	note: string;
	type!: TransactionType;
	status: TransactionStatus;

	static tableName = 'transactions';

	static get jsonSchema() {
		return {
			type: 'object',
			required: ['senderId', 'amount', 'type'],

			properties: {
				senderId: { type: 'uuid' },
				receiverId: { type: 'uuid' },
				amount: { type: 'number', minimum: 0.01 },
				type: {
					type: 'string',
					enum: Object.values(TransactionType),
					default: TransactionType.TRANSFER,
				},
				status: {
					type: 'string',
					enum: Object.values(TransactionStatus),
					default: TransactionStatus.PROCESSING,
				},
			},
		};
	}

	static relationMappings = () => ({
		sender: {
			relation: Model.BelongsToOneRelation,
			modelClass: 'user.model',
			join: {
				from: 'transactions.senderId',
				to: 'users.id',
			},
		},

		receiver: {
			relation: Model.BelongsToOneRelation,
			modelClass: 'user.model',
			join: {
				from: 'transactions.receiverId',
				to: 'users.id',
			},
		},
	});
}

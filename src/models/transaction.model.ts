import { Model, QueryContext } from 'objection';
import { BaseModel } from './base.model';
import Redeem from './redeem.model';

export enum TransactionAction {
	// for Redeem
	CREATE_CODE = 'create_code',
	USE_CODE = 'use_code',
}

export enum TransactionType {
	TRANSFER = 'transfer',
	REQUEST = 'request',
	REDEEM = 'redeem',
	PAYMENT = 'payment',
	PAYMENT_VOUCHER = 'payment_voucher',
	WITHDRAW = 'withdraw',
	DEPOSIT = 'deposit',
}

export enum TransactionStatus {
	INIT = 'init',
	PROCESSING = 'processing',
	PENDING = 'pending',
	SUCCESS = 'success',
	CANCELED = 'canceled',
	REJECTED = 'rejected',
}

// NOTE you maybe use only one table transactions and store other info of
// NOTE transfer/ request / redeem... in one column with json format

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

	info?: any;

	static tableName = 'transactions';

	static get jsonSchema() {
		return {
			type: 'object',
			required: ['senderId', 'amount', 'type'],

			properties: {
				senderId: { type: 'uuid' },
				receiverId: { type: 'uuid' },
				amount: { type: 'number', minimum: 0.01 },
				charge: { type: 'number' },
				sendAmount: { type: 'number', minimum: 0.01 },
				receiveAmount: { type: 'number', minimum: 0.01 },
				type: {
					type: 'string',
					enum: Object.values(TransactionType),
					default: TransactionType.TRANSFER,
				},
				status: {
					type: 'string',
					enum: Object.values(TransactionStatus),
					default: TransactionStatus.INIT,
				},
			},
		};
	}

	$parseDatabaseJson(jsonRaw: Model): any {
		const json = super.$parseDatabaseJson(jsonRaw);
		return {
			...json,
			charge: Number(json.charge),
			amount: Number(json.amount),
			sendAmount: Number(json.sendAmount),
			receiveAmount: Number(json.receiveAmount),
		};
	}

	async $afterFind() {
		if (this.type === TransactionType.REDEEM) {
			const redeem = await Redeem.query().findOne({ transactionId: this.id });
			this.info = redeem;
		}
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

		redeem: {
			relation: Model.HasOneRelation,
			modelClass: 'redeem.model',
			join: {
				from: 'users.id',
				to: 'redeems.userId',
			},
		},
	});
}

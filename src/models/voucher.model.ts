import { BaseModel } from './base.model';

export enum VoucherType {
	FIXED = 'fixed',
	PERCENT = 'percent',
}

export enum VoucherStatus {
	AVAILABLE = 'available',
	UNAVAILABLE = 'unavailable',
}

export default class Voucher extends BaseModel {
	creatorId: string;
	value: number;
	type: VoucherType;
	applyFor: string;
	maxUsage: number;
	maxUsageByAccount: number;
	status: VoucherStatus;
	expireAt: Date;
	code: string;
	usedBy: string[];

	static tableName = 'vouchers';

	static get jsonSchema() {
		return {
			type: 'object',
			required: [
				'value',
				'type',
				'applyFor',
				'maxUsage',
				'maxUsageByAccount',
				'expireAt',
				'code',
				'creatorId',
			],

			properties: {
				creatorId: { type: 'uuid' },
				value: { type: 'number' },
				type: { type: 'string', enum: Object.values(VoucherType) },
				status: {
					type: 'string',
					enum: Object.values(VoucherStatus),
					default: VoucherStatus.AVAILABLE,
				},
				maxUsage: { type: 'integer', minimum: 1 },
				maxUsageByAccount: { type: 'integer', minimum: 1 },
				expireAt: { type: 'date-time' },
				code: { type: 'string' },
			},
		};
	}
}

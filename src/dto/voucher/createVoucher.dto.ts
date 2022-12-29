import {
	IsDate,
	IsDateString,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	IsUUID,
	Min,
	MinLength,
} from 'class-validator';
import { VoucherStatus, VoucherType } from '../../models/voucher.model';

export class CreateVoucherDto {
	@IsNumber()
	@Min(0.01)
	value: number;

	@IsEnum(VoucherType)
	@IsOptional()
	type: VoucherType;

	@IsUUID()
	@IsOptional()
	applyFor: string;

	@IsNumber()
	@Min(1)
	maxUsage: number;

	@IsNumber()
	@Min(1)
	maxUsageByAccount: number;

	@IsEnum(VoucherStatus)
	@IsOptional()
	status: VoucherStatus;

	@IsDateString()
	expireAt: Date;

	@IsString()
	@MinLength(3)
	code: string;
}

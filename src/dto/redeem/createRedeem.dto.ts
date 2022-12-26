import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateRedeemDto {
	@Type(() => Number)
	@IsNumber({ maxDecimalPlaces: 2 })
	@Min(0.01)
	amount: number;

	@IsString()
	@IsOptional()
	note: string;

	@IsBoolean()
	@IsOptional()
	chargeForSender?: boolean = false;
}

import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateRequestMoneyDto {
	@IsUUID()
	senderId: string;

	@Type(() => Number)
	@IsNumber({ maxDecimalPlaces: 2 })
	@Min(0.01)
	amount: number;

	@IsString()
	@IsOptional()
	note: string;
}

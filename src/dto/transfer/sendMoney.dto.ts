import { Transform, Type } from 'class-transformer';
import { IsNumber, IsUUID, Min } from 'class-validator';

export class SendMoneyDto {
	@IsUUID()
	receiverId: string;

	@Type(() => Number)
	@IsNumber({ maxDecimalPlaces: 2 })
	@Min(0.01)
	amount: number;
}

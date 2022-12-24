import { TransactionType } from '../../models/transaction.model';

export class CreateTransactionDto {
	senderId: string;
	receiverId?: string;
	sendAmount: number;
	receiveAmount: number;
	charge: number;
	amount: number;
	note?: string;
	type: TransactionType;
}

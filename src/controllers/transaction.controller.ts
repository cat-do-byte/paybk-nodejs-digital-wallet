import { Body, Get, JsonController, Post, UseBefore } from 'routing-controllers';
import { SendMoneyDto } from '../dto/transfer/sendMoney.dto';
import { authMiddleware } from '../middlewares/auth.middleware';
import Transaction from '../models/transaction.model';
import { UserRole } from '../models/user.model';
import TransferService from '../services/transfer.service';

@JsonController('/transfer')
@UseBefore(authMiddleware([UserRole.CUSTOMER]))
export default class TransactionController {
	constructor(private readonly transferService: TransferService) {}

	@Post('/send')
	async sendMoney(@Body() sendData: SendMoneyDto): Promise<Transaction> {
		return await this.transferService.sendMoney(sendData);
	}
}

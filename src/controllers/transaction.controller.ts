import { Authorized, Body, Get, JsonController, Post, UseBefore } from 'routing-controllers';
import { requestContext } from '../common/context';
import { SendMoneyDto } from '../dto/transfer/sendMoney.dto';
import { authMiddleware } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';
import TransferService from '../services/transfer.service';

@JsonController('/transfer')
@UseBefore(authMiddleware([UserRole.CUSTOMER]))
export default class TransactionController {
	constructor(private readonly transferService: TransferService) {}

	@Post('/send')
	async sendMoney(@Body() sendData: SendMoneyDto) {
		const toe = requestContext.getStore();
		console.log('toe contr', toe);
		return await this.transferService.sendMoney(sendData);
	}
}

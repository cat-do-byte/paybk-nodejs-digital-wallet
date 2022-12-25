import { Authorized, Body, Get, JsonController, Post, UseBefore } from 'routing-controllers';
import { CreateRequestMoneyDto } from '../dto/request/createRequest.dto';
import { authMiddleware } from '../middlewares/auth.middleware';
import Transaction from '../models/transaction.model';
import { UserRole } from '../models/user.model';
import RequestService from '../services/request.service';

@JsonController('/request-money')
@UseBefore(authMiddleware([UserRole.CUSTOMER]))
export default class RequestController {
	constructor(private readonly requestService: RequestService) {}

	@Post('/')
	async sendMoney(@Body() sendData: CreateRequestMoneyDto): Promise<Transaction> {
		return await this.requestService.create(sendData);
	}
}

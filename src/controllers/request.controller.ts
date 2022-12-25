import { Body, Get, JsonController, Post } from 'routing-controllers';
import { CreateRequestMoneyDto } from '../dto/request/createRequest.dto';
import Transaction from '../models/transaction.model';
import RequestService from '../services/request.service';

@JsonController('/request-money')
export default class RequestController {
	constructor(private readonly requestService: RequestService) {}

	@Post('/')
	async sendMoney(@Body() sendData: CreateRequestMoneyDto): Promise<Transaction> {
		return await this.requestService.create(sendData);
	}
}

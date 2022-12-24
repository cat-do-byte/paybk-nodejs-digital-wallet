import { Body, Get, JsonController, Post } from 'routing-controllers';
import { SendMoneyDto } from '../dto/transfer/sendMoney.dto';
import TransferService from '../services/transfer.service';

@JsonController('/transfer')
export default class TransactionController {
	constructor(private readonly transferService: TransferService) {}

	@Post('/send')
	async sendMoney(@Body() sendData: SendMoneyDto) {
		return await this.transferService.sendMoney(sendData);
	}
}

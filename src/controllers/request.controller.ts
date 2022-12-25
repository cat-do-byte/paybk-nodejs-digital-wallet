import { Body, Get, JsonController, Post } from 'routing-controllers';
import { CreateRequestDto } from '../dto/request/createRequest.dto';
import TransferService from '../services/transfer.service';

@JsonController('/request')
export default class RequestController {
	constructor(private readonly transferService: TransferService) {}

	@Post('/create')
	async sendMoney(@Body() sendData: CreateRequestDto) {
		return await this.transferService.sendMoney(sendData);
	}
}

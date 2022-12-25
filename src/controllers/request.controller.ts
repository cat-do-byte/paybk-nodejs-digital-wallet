import {
	Authorized,
	Body,
	Get,
	JsonController,
	Param,
	Patch,
	Post,
	UseBefore,
} from 'routing-controllers';
import { CreateRequestMoneyDto } from '../dto/request/createRequest.dto';
import { authMiddleware } from '../middlewares/auth.middleware';
import Transaction from '../models/transaction.model';
import { UserRole } from '../models/user.model';
import RequestService from '../services/request.service';

@JsonController('/request-money')
@UseBefore(authMiddleware([UserRole.CUSTOMER]))
export default class RequestController {
	constructor(private readonly requestService: RequestService) {}

	// TODO list all request money

	@Post('/')
	async requestMoney(@Body() sendData: CreateRequestMoneyDto): Promise<Transaction> {
		return await this.requestService.create(sendData);
	}

	@Patch('/:id/confirm')
	async confirmRequestMoney(@Param('id') id: string) {
		return await this.requestService.confirm(id);
	}

	@Patch('/:id/reject')
	async rejectRequestMoney(@Param('id') id: string) {
		return await this.requestService.reject(id);
	}

	@Patch('/:id/cancel')
	async cancelRequestMoney(@Param('id') id: string) {
		return await this.requestService.cancel(id);
	}
}

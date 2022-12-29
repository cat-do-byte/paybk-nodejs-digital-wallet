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
import { PayDto } from '../dto/payment/pay.dto';
import { CreateRequestMoneyDto } from '../dto/request/createRequest.dto';
import { authMiddleware } from '../middlewares/auth.middleware';
import Transaction from '../models/transaction.model';
import { UserRole } from '../models/user.model';
import PaymentService from '../services/payment.service';
import RequestService from '../services/request.service';

@JsonController('/pay')
@UseBefore(authMiddleware([UserRole.CUSTOMER]))
export default class RequestController {
	constructor(private readonly paymentService: PaymentService) {}

	// TODO list all request money

	@Post('/')
	async pay(@Body() payData: PayDto): Promise<Transaction> {
		return this.paymentService.pay(payData);
	}
}

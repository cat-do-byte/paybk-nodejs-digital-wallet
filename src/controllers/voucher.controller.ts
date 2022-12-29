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
import { CreateVoucherDto } from '../dto/voucher/createVoucher.dto';
import { authMiddleware } from '../middlewares/auth.middleware';
import Redeem from '../models/redeem.model';
import { UserRole } from '../models/user.model';
import Voucher from '../models/voucher.model';
import VoucherService from '../services/voucher.service';

@JsonController('/vouchers')
@UseBefore(authMiddleware([UserRole.MERCHANT]))
export default class VoucherController {
	constructor(private readonly voucherService: VoucherService) {}

	@Post('/')
	async createVoucher(@Body() voucherData: CreateVoucherDto): Promise<Voucher> {
		return await this.voucherService.create(voucherData);
	}
}

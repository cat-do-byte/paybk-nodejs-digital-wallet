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
import { CreateRedeemDto } from '../dto/redeem/createRedeem.dto';
import { authMiddleware } from '../middlewares/auth.middleware';
import Redeem from '../models/redeem.model';
import { UserRole } from '../models/user.model';
import RedeemService from '../services/redeem.service';

@JsonController('/redeems')
@UseBefore(authMiddleware([UserRole.CUSTOMER]))
export default class RedeemController {
	constructor(private readonly redeemService: RedeemService) {}

	@Post('/')
	async requestMoney(@Body() redeemData: CreateRedeemDto): Promise<Redeem> {
		return await this.redeemService.create(redeemData);
	}

	@Patch('/:code/use')
	async confirmRequestMoney(@Param('code') code: string) {
		return await this.redeemService.useCode(code);
	}
	/* 
	@Patch('/:id/reject')
	async rejectRequestMoney(@Param('id') id: string) {
		return await this.requestService.reject(id);
	}

	@Patch('/:id/cancel')
	async cancelRequestMoney(@Param('id') id: string) {
		return await this.requestService.cancel(id);
	} */
}

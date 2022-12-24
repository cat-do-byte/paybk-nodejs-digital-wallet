import { Body, Get, JsonController, Post } from 'routing-controllers';
import { RegisterDto } from '../dto/auth/register.dto';
import { SendMoneyDto } from '../dto/transaction/sendMoney.dto';
import AuthService from '../services/auth.service';
import WalletService from '../services/wallet.service';

@JsonController('/transaction')
export default class TransactionController {
	constructor(private readonly walletService: WalletService) {}

	@Post('/send')
	async sendMoney(@Body() sendData: SendMoneyDto) {
		return await this.walletService.sendMoney(sendData);
	}
}

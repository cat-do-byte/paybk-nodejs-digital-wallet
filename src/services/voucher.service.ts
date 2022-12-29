import { ModelClass } from 'objection';
import { Inject, Service } from 'typedi';
import { requestContext } from '../common/context';
import { CreateVoucherDto } from '../dto/voucher/createVoucher.dto';
import { IRequestContext } from '../interfaces/requestContext.interface';
import Voucher, { VoucherType } from '../models/voucher.model';

@Service()
export default class VoucherService {
	constructor(@Inject(Voucher.name) private voucherModel: ModelClass<Voucher>) {}

	async create(voucherData: CreateVoucherDto) {
		const { userId } = requestContext.getStore() as IRequestContext;

		// TODO
		// validate code

		return await this.voucherModel
			.query()
			.insert({ ...voucherData, creatorId: userId, applyFor: userId });
	}

	async findVoucher(code: string, merchantId: string) {
		return await this.voucherModel.query().findOne({
			code,
			applyFor: merchantId,
		});
	}

	calculateAmountWithVoucher(amount: number, voucher: Voucher): number {
		let amountWithVoucher: number;
		const { value } = voucher;

		if (voucher.type === VoucherType.FIXED) {
			amountWithVoucher = amount - value;
			amountWithVoucher = amountWithVoucher > 0 ? amountWithVoucher : 0;
		} else {
			amountWithVoucher = amount - amount * value;
		}

		return amountWithVoucher;
	}

	async validateCode(code: string) {
		// check format code
		// is code is unique for merchant available
	}
}

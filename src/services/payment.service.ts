import { ModelClass } from 'objection';
import { HttpError } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import { requestContext } from '../common/context';
import { PayDto } from '../dto/payment/pay.dto';
import { IRequestContext } from '../interfaces/requestContext.interface';
import Transaction, { TransactionStatus, TransactionType } from '../models/transaction.model';
import User, { UserRole } from '../models/user.model';
import Voucher, { VoucherStatus } from '../models/voucher.model';
import Wallet from '../models/wallet.model';
import TransactionService from './transaction.service';
import VoucherService from './voucher.service';

@Service()
export default class PaymentService {
	constructor(
		@Inject(Wallet.name) private walletModel: ModelClass<Wallet>,

		@Inject(User.name) private userModel: ModelClass<User>,

		@Inject(Transaction.name) private transactionModel: ModelClass<Transaction>,

		private transactionService: TransactionService,

		private voucherService: VoucherService
	) {}

	async pay(payData: PayDto): Promise<Transaction> {
		const { userId: senderId } = requestContext.getStore() as IRequestContext;
		const { receiverId, amount: payAmount, voucher } = payData;

		// receiver must be merchant
		const receiverMerchant = await this.userModel.query().findById(receiverId);
		if (!receiverMerchant) throw new HttpError(400, `The receiver does not exist`);
		if (receiverMerchant.role !== UserRole.MERCHANT)
			throw new HttpError(400, `The receiver is not merchant`);

		// check exist user
		const { senderWallet } = await this.transactionService.checkAccountsExist(senderId, receiverId);

		// use voucher

		// find voucher and validate
		let amount = payAmount;

		let voucherData: Voucher | null = null;
		if (voucher) {
			voucherData = await this.voucherService.findVoucher(voucher, receiverId);
			if (!voucherData) throw new HttpError(400, `The voucher does not exist`);

			// TODO compare expiresAt with currenttime, even it status changed on schedule cron job
			if (voucherData.status === VoucherStatus.UNAVAILABLE)
				throw new HttpError(400, `The voucher is unavailable`);

			// TODO check max usage
			// console.log('voucherData:::', voucherData);

			// change amount by voucher value
			amount = this.voucherService.calculateAmountWithVoucher(amount, voucherData);
		}

		// calculate after charge
		const { sendAmount, receiveAmount, chargeFee } = this.transactionService.calculateAmount(
			amount,
			false
		);

		// check available balance for sender
		if (senderWallet.balance < sendAmount)
			throw new HttpError(400, `The balance is not enough to make the transaction`);

		const newTransaction = await this.transactionService.create({
			senderId,
			receiverId,
			amount,
			sendAmount,
			receiveAmount,
			charge: chargeFee,
			type: TransactionType.PAYMENT_VOUCHER,
		});

		try {
			await this.transactionModel.transaction(async (trx) => {
				if (voucherData) {
					voucherData.usedBy = voucherData.usedBy ? [...voucherData.usedBy, senderId] : [senderId];
					await voucherData.$query(trx).patch();
				}

				await this.transactionService.startProcess(newTransaction, undefined, trx);

				//TODO update status voucher
			});
		} catch (err) {
			throw new HttpError(400, 'Can not pay');
		}

		return newTransaction;
	}
}

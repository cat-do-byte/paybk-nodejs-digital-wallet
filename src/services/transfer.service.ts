import { ModelClass } from 'objection';
import { HttpError } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import { requestContext } from '../common/context';
import { SendMoneyDto } from '../dto/transfer/sendMoney.dto';
import { IRequestContext } from '../interfaces/requestContext.interface';
import { IWalletSent } from '../interfaces/wallet.interface';
import { TransactionQueue } from '../jobs/queues/transaction.queue';
import { TransactionStatus, TransactionType } from '../models/transaction.model';
import User from '../models/user.model';
import Wallet from '../models/wallet.model';
import TransactionService from './transaction.service';

@Service()
export default class TransferService {
	constructor(
		@Inject(Wallet.name) private walletModel: ModelClass<Wallet>,

		@Inject(User.name) private userModel: ModelClass<User>,

		private transactionService: TransactionService
	) {}

	async sendMoney(sendData: SendMoneyDto) {
		const { userId: currentUserId } = requestContext.getStore() as IRequestContext;
		const { receiverId, amount } = sendData;

		return await this.handleSend({
			senderId: currentUserId,
			receiverId,
			amount,
		});
	}

	async handleSend(transactionData: IWalletSent): Promise<boolean> {
		const { senderId, receiverId, amount, chargeForSender, note } = transactionData;

		// check exist user
		const { senderWallet, receiverWallet } = await this.transactionService.checkAccountsExist(
			senderId,
			receiverId
		);

		// calculate after charge
		const { sendAmount, receiveAmount, chargeFee } = this.transactionService.calculateAmount(
			amount,
			chargeForSender
		);

		// check available balance for sender
		if (senderWallet.balance < sendAmount)
			throw new HttpError(400, `The balance is not enough to make the transaction`);
		try {
			const newTransaction = await this.transactionService.create({
				senderId,
				receiverId,
				amount,
				sendAmount,
				receiveAmount,
				charge: chargeFee,
				type: TransactionType.TRANSFER,
			});

			await this.transactionService.startProcess(newTransaction);
		} catch (err) {
			throw err;
		}

		return true;
	}
}

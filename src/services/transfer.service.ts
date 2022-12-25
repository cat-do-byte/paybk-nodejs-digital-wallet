import { ModelClass } from 'objection';
import { HttpError } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import { SendMoneyDto } from '../dto/transfer/sendMoney.dto';
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
		const currentId = '494a9185-2818-409c-901b-f6e0839a153f';
		const { receiverId, amount } = sendData;

		return await this.handleSend({
			senderId: currentId,
			receiverId,
			amount,
		});
	}

	async handleSend(transactionData: IWalletSent): Promise<boolean> {
		const { senderId, receiverId, amount, chargeForSender, note } = transactionData;

		// check exist user
		const { senderWallet, receiverWallet } = await this.transactionService.checkAccountExisted(
			senderId,
			receiverId
		);
		// console.log('usersInTransaction:::', senderWallet, receiverWallet);

		// calculate after charge
		const { sendAmount, receiveAmount, chargeFee } = this.transactionService.calculateAmount(
			amount,
			chargeForSender
		);

		// check available balance for sender
		if (senderWallet.balance < sendAmount)
			throw new HttpError(400, `The balance is not enough to make the transaction`);

		// reduce from sender
		/* senderWallet.balance -= sendAmount;
		await senderWallet.$query().patch();

		// increment from receiver
		receiverWallet.balance += receiveAmount;
		await receiverWallet.$query().patch(); */

		const newTransaction = await this.transactionService.create({
			senderId,
			receiverId,
			amount,
			sendAmount,
			receiveAmount,
			charge: chargeFee,
			type: TransactionType.TRANSFER,
			status: TransactionStatus.PENDING,
		});

		return true;
	}

	/* async checkAccountExisted(
		senderId: string,
		receiverId: string
	): Promise<{ senderWallet: Wallet; receiverWallet: Wallet }> {
		const querySender = this.userModel.query().withGraphJoined('wallet').findById(senderId);
		const queryReceiver = this.userModel.query().withGraphJoined('wallet').findById(receiverId);
		const [senderAccount, receiverAccount] = await Promise.all([querySender, queryReceiver]);

		const missingUserErr: string[] = [];

		if (!senderAccount || !senderAccount?.wallet) missingUserErr.push('Sender');
		if (!receiverAccount || !receiverAccount?.wallet) missingUserErr.push('Receiver');
		if (missingUserErr.length > 0)
			throw new HttpError(404, `Account of ${missingUserErr.join(', ')} is not existed`);

		const senderWallet = senderAccount.wallet as Wallet;
		const receiverWallet = receiverAccount.wallet as Wallet;

		return {
			senderWallet,
			receiverWallet,
		};
	} */
}

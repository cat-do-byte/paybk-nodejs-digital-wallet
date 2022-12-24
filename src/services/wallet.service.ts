import { ModelClass } from 'objection';
import { HttpError } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import { SendMoneyDto } from '../dto/transaction/sendMoney.dto';
import { IWalletSent } from '../interfaces/wallet.interface';
import Wallet from '../models/wallet.model';

@Service()
export default class WalletService {
	chargeFeeValue: number = 0.02;

	constructor(@Inject(Wallet.name) private walletModel: ModelClass<Wallet>) {}

	async sendMoney(sendData: SendMoneyDto) {
		const currentId = 'a786a3b1-69c0-406c-8292-5c3bdd012c11';
		const { receiverId, amount } = sendData;

		return await this.handleSend({
			senderId: currentId,
			receiverId,
			amount,
		});
	}

	async handleSend(transactionData: IWalletSent): Promise<boolean> {
		const { senderId, receiverId, amount, chargeForSender, note } = transactionData;

		let sendAmount: number;
		let receiveAmount: number;

		// check exist user
		const querySenderWallet = this.walletModel.query().findById(senderId);
		const queryReceiverWallet = this.walletModel.query().findById(receiverId);
		const [senderWallet, receiverWallet] = await Promise.all([
			querySenderWallet,
			queryReceiverWallet,
		]);

		console.log('usersInTransaction:::', senderWallet, receiverWallet);

		const missingUserErr: string[] = [];

		if (!senderWallet) missingUserErr.push('Sender');
		if (!receiverWallet) missingUserErr.push('Receiver');
		if (missingUserErr.length > 0)
			throw new HttpError(404, `Account of ${missingUserErr.join(', ')} is not existed`);

		// calculate after charge
		const chargeFee = amount * this.chargeFeeValue;
		if (chargeForSender === false) {
			// charge for receiver
			sendAmount = amount;
			receiveAmount = amount - chargeFee;
		} else {
			// charge for sender
			sendAmount = amount + chargeFee;
			receiveAmount = amount;
		}

		// check available balance for sender
		if (senderWallet.balance < sendAmount)
			throw new HttpError(400, `The balance is not enough to make the transaction`);

		// reduce from sender
		senderWallet.balance -= sendAmount;
		await senderWallet.$query().patch();

		// increment from receiver
		receiverWallet.balance += receiveAmount;
		console.log(receiverWallet.balance, 'receiverWallet.balance:::');
		await receiverWallet.$query().patch();

		return true;
	}
}

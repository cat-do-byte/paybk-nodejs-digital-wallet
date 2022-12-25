import { ModelClass } from 'objection';
import { HttpError } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import { CreateTransactionDto } from '../dto/transaction/createTransaction.dto';
import { ITransferData } from '../interfaces/transaction.interface';
import Transaction, { TransactionStatus, TransactionType } from '../models/transaction.model';
import User from '../models/user.model';
import Wallet from '../models/wallet.model';

@Service()
export default class TransactionService {
	chargeFeeValue: number = 0.02;

	handleByTransactionTypes: { [key in TransactionType]: Function } = {
		[TransactionType.TRANSFER]: this.handleTransferMoney,
		[TransactionType.REQUEST]: this.handleTransferMoney,
		[TransactionType.PAYMENT]: this.handleTransferMoney,
		[TransactionType.WITHDRAW]: this.handleTransferMoney,
		[TransactionType.DEPOSIT]: this.handleTransferMoney,
	};

	constructor(
		@Inject(Transaction.name) private transactionModel: ModelClass<Transaction>,

		@Inject(Wallet.name) private walletModel: ModelClass<Wallet>,

		@Inject(User.name) private userModel: ModelClass<User>
	) {}

	async create(transactionData: CreateTransactionDto): Promise<Transaction> {
		const newTransaction = await this.transactionModel.query().insert(transactionData);
		return newTransaction;
	}

	async process(transactionData: Transaction) {
		const { senderId, receiverId, sendAmount, id, type } = transactionData;

		const { senderWallet, receiverWallet } = await this.checkAccountExisted(senderId, receiverId);
		if (senderWallet.balance < sendAmount)
			throw new HttpError(400, `The balance is not enough to make the transaction`);

		this.handleByTransactionTypes[type]({ senderWallet, receiverWallet, transactionData });

		await this.transactionModel.query().findById(id).patch({
			status: TransactionStatus.SUCCESS,
		});

		return true;
	}

	async handleTransferMoney(transferData: ITransferData): Promise<void> {
		const {
			senderWallet,
			receiverWallet,
			transactionData: { sendAmount, receiveAmount },
		} = transferData;

		senderWallet.balance -= sendAmount;
		await senderWallet.$query().patch();

		// increment from receiver
		receiverWallet.balance += receiveAmount;
		await receiverWallet.$query().patch();
	}

	async checkAccountExisted(
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
	}

	calculateAmount(
		amount: number,
		chargeForSender?: boolean
	): { sendAmount: number; receiveAmount: number; chargeFee: number } {
		let sendAmount: number;
		let receiveAmount: number;

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

		return {
			sendAmount,
			receiveAmount,
			chargeFee,
		};
	}
}

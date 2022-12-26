import { ModelClass } from 'objection';
import { HttpError } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import { requestContext } from '../common/context';
import { CreateTransactionDto } from '../dto/transaction/createTransaction.dto';
import { IRequestContext } from '../interfaces/requestContext.interface';
import { ITransferData } from '../interfaces/transaction.interface';
import { TransactionQueue } from '../jobs/queues/transaction.queue';
import Transaction, {
	TransactionAction,
	TransactionStatus,
	TransactionType,
} from '../models/transaction.model';
import User from '../models/user.model';
import Wallet from '../models/wallet.model';

@Service()
export default class TransactionService {
	chargeFeeValue: number = 0.02;

	handleByTransactionTypes: { [key in TransactionType]: Function } = {
		[TransactionType.TRANSFER]: this.handleTransferMoneyTransaction,
		[TransactionType.REQUEST]: this.handleRequestMoneyTransaction,
		[TransactionType.REDEEM]: this.handleRedeemTransaction.bind(this),
		[TransactionType.PAYMENT]: this.handleTransferMoneyTransaction,
		[TransactionType.WITHDRAW]: this.handleTransferMoneyTransaction,
		[TransactionType.DEPOSIT]: this.handleTransferMoneyTransaction,
	};

	constructor(
		@Inject(Transaction.name) private transactionModel: ModelClass<Transaction>,

		@Inject(Wallet.name) private walletModel: ModelClass<Wallet>,

		@Inject(User.name) private userModel: ModelClass<User>,

		private transactionQueue: TransactionQueue
	) {}

	async create(transactionData: CreateTransactionDto): Promise<Transaction> {
		// console.log('transactionData:::', transactionData);
		const newTransaction = await this.transactionModel.query().insert(transactionData);

		return newTransaction;
	}

	async process(transactionData: Transaction, action?: TransactionAction) {
		const { type } = transactionData;

		this.handleByTransactionTypes[type]({ transactionData, action });
		return true;

		/* const { senderId, receiverId, sendAmount, id, type } = transactionData;

		const { senderWallet, receiverWallet } = await this.checkAccountsExist(senderId, receiverId);
		console.log(senderWallet, 'titi');
		if (senderWallet.balance < sendAmount)
			throw new HttpError(400, `The balance is not enough to make the transaction`);

		// start process
		console.log('start processs');
		// TODO handle race condition

		// TODO handle transaction

		await this.transactionModel.query().findById(id).patch({
			status: TransactionStatus.PROCESSING,
		});

		this.handleByTransactionTypes[type]({ senderWallet, receiverWallet, transactionData, action });

		console.log('success process');
		await this.transactionModel.query().findById(id).patch({
			status: TransactionStatus.SUCCESS,
		});

		return true; */
	}

	async handleTransferMoneyTransaction(transferData: ITransferData): Promise<void> {
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

	async handleRequestMoneyTransaction(transferData: ITransferData): Promise<void> {
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

	async handleRedeemTransaction(transferData: ITransferData): Promise<void> {
		const { action, transactionData } = transferData;
		const { sendAmount, senderId, id } = transactionData;

		if (action === TransactionAction.CREATE_CODE) {
			const senderWallet = await this.checkAccountExist(senderId);

			if (senderWallet.balance < sendAmount)
				throw new HttpError(400, `The balance is not enough to make the transaction`);

			this.changeStatus(id, TransactionStatus.PROCESSING);

			senderWallet.balance -= sendAmount;
			await senderWallet.$query().patch();

			this.changeStatus(id, TransactionStatus.PENDING);
		} else if (action === TransactionAction.USE_CODE) {
			const { userId: receiverId } = requestContext.getStore() as IRequestContext;
			const { receiveAmount, id } = transactionData;

			const receiverWallet = await this.checkAccountExist(receiverId);

			receiverWallet.balance += receiveAmount;
			await receiverWallet.$query().patch();

			this.changeStatus(id, TransactionStatus.SUCCESS);
		}
	}

	startProcess(transactionData: Transaction, action?: TransactionAction) {
		this.transactionQueue.add(transactionData, action);
	}

	async getTransaction(id: string) {
		return this.transactionModel.query().findById(id);
	}

	async changeStatus(transaction: Transaction | string, status: TransactionStatus) {
		if (transaction instanceof Transaction) {
			transaction.status = status;
			transaction.$query().patch();
			return true;
		}
		return this.transactionModel.query().findById(transaction).patch({
			status: status,
		});
	}

	async checkAccountExist(accountId: string, role?: string): Promise<Wallet> {
		const user = await this.userModel.query().withGraphJoined('wallet').findById(accountId);
		if (!user || !user?.wallet) throw new HttpError(404, `Account ${role || ''} does not exist`);

		return user.wallet;
	}

	async checkAccountsExist(
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
			throw new HttpError(404, `Account of ${missingUserErr.join(', ')} does not exist`);

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

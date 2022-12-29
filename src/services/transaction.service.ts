import { ModelClass } from 'objection';
import { HttpError } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import { requestContext } from '../common/context';
import logger from '../common/logger';
import { CreateTransactionDto } from '../dto/transaction/createTransaction.dto';
import { IRequestContext } from '../interfaces/requestContext.interface';
import {
	ITransferData,
	ITransferReceive,
	ITransferSend,
} from '../interfaces/transaction.interface';
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
		[TransactionType.TRANSFER]: this.handleTransferMoneyTransaction.bind(this),
		[TransactionType.REQUEST]: this.handleRequestMoneyTransaction.bind(this),
		[TransactionType.REDEEM]: this.handleRedeemTransaction.bind(this),
		[TransactionType.PAYMENT]: this.handleTransferMoneyTransaction.bind(this),
		[TransactionType.PAYMENT_VOUCHER]: this.handleTransferMoneyTransaction.bind(this),
		[TransactionType.WITHDRAW]: this.handleTransferMoneyTransaction.bind(this),
		[TransactionType.DEPOSIT]: this.handleTransferMoneyTransaction.bind(this),
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
		const { type, id } = transactionData;

		const transaction = await this.transactionModel.query().findById(id);
		if (!transaction) throw new HttpError(404, `The transaction does not exist`);

		this.handleByTransactionTypes[type]({ transactionData: transaction, action });
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
		const { transactionData } = transferData;
		const { sendAmount, senderId, receiverId } = transactionData;

		const { senderWallet, receiverWallet } = await this.checkAccountsExist(senderId, receiverId);
		if (senderWallet.balance < sendAmount)
			throw new HttpError(400, `The balance is not enough to make the transaction`);

		await this.changeStatus(transactionData, TransactionStatus.PROCESSING);

		/* senderWallet.balance -= sendAmount;
		await senderWallet.$query().patch(); */
		await this.doTransfer(senderWallet, transactionData, true);

		// increment from receiver
		/* receiverWallet.balance += receiveAmount;
		await receiverWallet.$query().patch(); */
		await this.doTransfer(receiverWallet, transactionData, false);

		await this.changeStatus(transactionData, TransactionStatus.SUCCESS);
	}

	async handleRequestMoneyTransaction(transferData: ITransferData): Promise<void> {
		const { transactionData } = transferData;
		const { sendAmount, receiveAmount, senderId, receiverId } = transactionData;

		const { senderWallet, receiverWallet } = await this.checkAccountsExist(senderId, receiverId);
		if (senderWallet.balance < sendAmount)
			throw new HttpError(400, `The balance is not enough to make the transaction`);

		await this.changeStatus(transactionData, TransactionStatus.PROCESSING);

		senderWallet.balance -= sendAmount;
		await senderWallet.$query().patch();

		// increment from receiver
		receiverWallet.balance += receiveAmount;
		await receiverWallet.$query().patch();

		await this.changeStatus(transactionData, TransactionStatus.SUCCESS);
	}

	async handleRedeemTransaction(transferData: ITransferData): Promise<void> {
		const { action, transactionData } = transferData;
		const { sendAmount, senderId, id } = transactionData;

		if (action === TransactionAction.CREATE_CODE) {
			const senderWallet = await this.checkAccountExist(senderId);

			if (senderWallet.balance < sendAmount)
				throw new HttpError(400, `The balance is not enough to make the transaction`);

			await this.changeStatus(id, TransactionStatus.PROCESSING);

			senderWallet.balance -= sendAmount;
			await senderWallet.$query().patch();

			await this.changeStatus(id, TransactionStatus.PENDING);
		} else if (action === TransactionAction.USE_CODE) {
			const { userId: receiverId } = requestContext.getStore() as IRequestContext;
			const { receiveAmount, id } = transactionData;

			const receiverWallet = await this.checkAccountExist(receiverId);

			receiverWallet.balance += receiveAmount;
			await receiverWallet.$query().patch();

			await this.changeStatus(id, TransactionStatus.SUCCESS);
		}
	}

	startProcess(transactionData: Transaction, action?: TransactionAction) {
		this.transactionQueue.add(transactionData, action);
	}

	async getTransaction(id: string) {
		return this.transactionModel.query().findById(id);
	}

	async changeStatus(
		transaction: Transaction | string,
		status: TransactionStatus
	): Promise<boolean> {
		if (transaction instanceof Transaction) {
			await transaction.$query().patch({ status });
			return true;
		}
		await this.transactionModel.query().findById(transaction).patch({
			status: status,
		});
		return true;
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

	async doTransfer(wallet: Wallet, transactionData: Transaction, isSend: boolean = true) {
		throw new Error('kaka');
		if (isSend) {
			const { sendAmount, charge, senderId, id } = transactionData;

			wallet.balance -= sendAmount;
			await wallet.$query().patch();

			this.logTranferSend({
				senderId,
				sendAmount,
				charge,
				createdAt: new Date(),
				transactionId: id,
			});
		} else {
			const { receiveAmount, receiverId, id } = transactionData;

			wallet.balance += receiveAmount;
			await wallet.$query().patch();

			this.logTranferReceive({
				receiverId,
				receiveAmount,
				createdAt: new Date(),
				transactionId: id,
			});
		}
	}

	logTranferSend(sendData: ITransferSend) {
		logger.info(sendData);
	}

	logTranferReceive(receiveData: ITransferReceive) {
		logger.info(receiveData);
	}
}

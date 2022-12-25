import { ModelClass } from 'objection';
import { HttpError } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import { requestContext } from '../common/context';
import { CreateRequestMoneyDto } from '../dto/request/createRequest.dto';
import { SendMoneyDto } from '../dto/transfer/sendMoney.dto';
import { IRequestContext } from '../interfaces/requestContext.interface';
import Transaction, { TransactionStatus, TransactionType } from '../models/transaction.model';
import TransactionService from './transaction.service';

@Service()
export default class RequestService {
	constructor(private transactionService: TransactionService) {}

	async create(requestMoneyData: CreateRequestMoneyDto): Promise<Transaction> {
		const { userId: receiverId } = requestContext.getStore() as IRequestContext;
		const { senderId, amount, note } = requestMoneyData;

		// calculate after charge
		const { sendAmount, receiveAmount, chargeFee } = this.transactionService.calculateAmount(
			amount,
			false
		);

		const result = await this.transactionService.create({
			senderId,
			receiverId,
			amount,
			sendAmount,
			receiveAmount,
			charge: chargeFee,
			note,
			type: TransactionType.REQUEST,
			status: TransactionStatus.PENDING,
		});

		return result;
	}

	async confirm(transactionId: string) {
		// check is who requested
		const { userId } = requestContext.getStore() as IRequestContext;

		const transaction = await this.transactionService.getTransaction(transactionId);
		if (transaction.senderId !== userId) {
			throw new HttpError(401, 'You dont have permission confirm this transaction');
		}

		this.transactionService.startProcess(transaction);
		return true;
	}

	async reject(transactionId: string) {
		// check is who requested
		const { userId } = requestContext.getStore() as IRequestContext;

		const transaction = await this.transactionService.getTransaction(transactionId);
		if (transaction.senderId !== userId) {
			throw new HttpError(401, 'You dont have permission confirm this transaction');
		}

		await this.transactionService.changeStatus(transaction, TransactionStatus.REJECTED);
		return true;
	}

	async cancel(transactionId: string) {
		const { userId } = requestContext.getStore() as IRequestContext;

		const transaction = await this.transactionService.getTransaction(transactionId);
		if (transaction.receiverId !== userId) {
			throw new HttpError(401, 'You dont have permission confirm this transaction');
		}

		await this.transactionService.changeStatus(transaction, TransactionStatus.CANCELED);
		return true;
	}
}

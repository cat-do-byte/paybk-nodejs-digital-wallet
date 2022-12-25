import { ModelClass } from 'objection';
import { HttpError } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import { requestContext } from '../common/context';
import { CreateRequestMoneyDto } from '../dto/request/createRequest.dto';
import { SendMoneyDto } from '../dto/transfer/sendMoney.dto';
import Transaction, { TransactionStatus, TransactionType } from '../models/transaction.model';
import TransactionService from './transaction.service';

@Service()
export default class RequestService {
	constructor(private transactionService: TransactionService) {}

	async create(requestMoneyData: CreateRequestMoneyDto): Promise<Transaction> {
		const { id: senderId } = requestContext.getStore();
		const { receiverId, amount, note } = requestMoneyData;

		// check exist user
		/* const { senderWallet, receiverWallet } = await this.transactionService.checkAccountExisted(
			senderId,
			receiverId
		); */
		// console.log('usersInTransaction:::', senderWallet, receiverWallet);

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
}

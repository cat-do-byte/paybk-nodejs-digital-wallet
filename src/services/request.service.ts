import { ModelClass } from 'objection';
import { HttpError } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import { CreateRequestMoneyDto } from '../dto/request/createRequest.dto';
import { SendMoneyDto } from '../dto/transfer/sendMoney.dto';
import Transaction, { TransactionStatus, TransactionType } from '../models/transaction.model';
import TransactionService from './transaction.service';

@Service()
export default class RequestService {
	constructor(private transactionService: TransactionService) {}

	async create(requestMoneyData: CreateRequestMoneyDto): Promise<Transaction> {
		const senderId = '494a9185-2818-409c-901b-f6e0839a153f';
		const { receiverId, amount, note } = requestMoneyData;

		// check exist user
		const { senderWallet, receiverWallet } = await this.transactionService.checkAccountExisted(
			senderId,
			receiverId
		);
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
			type: TransactionType.REQUEST,
			status: TransactionStatus.PENDING,
		});

		return result;
	}
}

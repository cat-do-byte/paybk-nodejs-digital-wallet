import { ModelClass } from 'objection';
import { Inject, Service } from 'typedi';
import { CreateTransactionDto } from '../dto/transaction/createTransaction.dto';
import Transaction from '../models/transaction.model';

@Service()
export default class TransactionService {
	constructor(@Inject(Transaction.name) private walletModel: ModelClass<Transaction>) {}

	async create(transactionData: CreateTransactionDto): Promise<Transaction> {
		const newTransaction = await this.walletModel.query().insert(transactionData);
		return newTransaction;
	}
}

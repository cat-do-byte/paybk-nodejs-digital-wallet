import { Job } from 'bull';
import Container, { Service } from 'typedi';
import { ITransactionQueue } from '../../interfaces/queues/transactionQueue.interface';
import Transaction, { TransactionStatus } from '../../models/transaction.model';
import TransactionService from '../../services/transaction.service';

@Service()
export class TransactionProcess {
	// constructor(private readonly transactionService: TransactionService) {}

	async process(job: Job<ITransactionQueue>) {
		const transactionService = Container.get(TransactionService);
		const { transaction, action } = job.data;
		await transactionService.process(transaction, action);
	}
}

export default TransactionProcess;

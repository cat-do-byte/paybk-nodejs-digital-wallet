import { Job } from 'bull';
import Container, { Service } from 'typedi';
import Transaction, { TransactionStatus } from '../../models/transaction.model';
import TransactionService from '../../services/transaction.service';

@Service()
export class TransactionProcess {
	// constructor(private readonly transactionService: TransactionService) {}

	async process(job: Job<Transaction>) {
		const transactionService = Container.get(TransactionService);
		console.log('job.data.status:::', job.data.status);
		if (job.data.status === TransactionStatus.PROCESSING)
			await transactionService.process(job.data);
	}
}

export default TransactionProcess;

import { Job } from 'bull';
import Container, { Service } from 'typedi';
import TransactionService from '../../services/transaction.service';

@Service()
export class TransactionProcess {
	// constructor(private readonly transactionService: TransactionService) {}

	async process(job: Job) {
		const transactionService = Container.get(TransactionService);
		const result = await transactionService.process(job.data);
	}
}

export default TransactionProcess;

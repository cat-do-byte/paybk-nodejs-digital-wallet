import Queue from 'bull';
import { Service } from 'typedi';
import config from '../../configuration';
import { ITransactionQueue } from '../../interfaces/queues/transactionQueue.interface';
import Transaction, { TransactionAction } from '../../models/transaction.model';
import TransactionProcess from '../processes/transaction.process';
import queues from '../queues';
import { BaseQueue } from './base.queue';

const QueueTypes = {
	TRANSFER_MONEY: 'transfer_money',
};

@Service()
export class TransactionQueue implements BaseQueue {
	queue: Queue.Queue<ITransactionQueue>;

	constructor(private transactionProcess: TransactionProcess) {
		this.initQueue();
		this.setProcess();
	}

	initQueue() {
		this.queue = new Queue<ITransactionQueue>(queues.TRANSACTION, {
			redis: config.queue.redisServer,
		});
	}

	setProcess() {
		this.queue.process(this.transactionProcess.process);
	}

	add(transaction: Transaction, action?: TransactionAction, options?: Queue.JobOptions) {
		this.queue.add({ transaction, action }, options);
	}
}

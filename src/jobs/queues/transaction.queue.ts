import Queue from 'bull';
import { Transaction } from 'objection';
import { Service } from 'typedi';
import config from '../../configuration';
import { IEmailQueue } from '../../interfaces/queues/emailQueue.interface';
import TransactionProcess from '../processes/transaction.process';
import queues from '../queues';
import { BaseQueue } from './base.queue';

const QueueTypes = {
	TRANSFER_MONEY: 'transfer_money',
};

@Service()
export class TransactionQueue implements BaseQueue {
	queue: Queue.Queue;

	constructor(private transactionProcess: TransactionProcess) {
		this.initQueue();
		this.setProcess();
	}

	initQueue() {
		this.queue = new Queue<IEmailQueue>(queues.TRANSACTION, {
			redis: config.queue.redisServer,
		});
	}

	setProcess() {
		this.queue.process(this.transactionProcess.process);
	}

	add(data: Transaction, type?: string, options?: Queue.JobOptions) {
		type ? this.queue.add(type, data, options) : this.queue.add(data, options);
	}
}

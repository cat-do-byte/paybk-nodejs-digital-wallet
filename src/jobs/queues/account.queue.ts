import Queue from 'bull';
import config from '../../configuration';
import { IQueueAccount } from '../../interfaces/queues/accountQueue.interface';
import accountProcess from '../processes/account.process';
import queues from '../queues';
import { BaseQueue } from './base.queue';

export class AccountQueue implements BaseQueue {
	queue: Queue.Queue;

	initQueue() {
		this.queue = new Queue<IQueueAccount>(queues.ACCOUNT, {
			redis: config.queue.redisServer,
		});
	}

	setProcess() {
		this.queue.process(accountProcess);
	}

	add(data: any, type?: string | undefined, options?: Queue.JobOptions | undefined) {
		this.add(data);
	}
}

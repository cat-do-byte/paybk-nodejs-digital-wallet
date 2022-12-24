import Queue from 'bull';
import { Service } from 'typedi';
import config from '../../configuration';
import { IEmailQueue } from '../../interfaces/queues/emailQueue.interface';
import emailProcess from '../processes/email.process';
import queues from '../queues';
import { BaseQueue } from './base.queue';

const QueueTypes = {
	REGISTER_USER: 'register_user',
};

@Service()
export class EmailQueue implements BaseQueue {
	queue: Queue.Queue;

	constructor() {
		this.initQueue();
		this.setProcess();
	}

	initQueue() {
		this.queue = new Queue<IEmailQueue>(queues.EMAIL, {
			redis: config.queue.redisServer,
		});
	}

	setProcess() {
		this.queue.process(QueueTypes.REGISTER_USER, emailProcess);
	}

	add(data: IEmailQueue, type?: string, options?: Queue.JobOptions) {
		type ? this.queue.add(type, data, options) : this.queue.add(data, options);
	}

	addRegisterUser(data: IEmailQueue) {
		this.add(data, QueueTypes.REGISTER_USER);
	}
}

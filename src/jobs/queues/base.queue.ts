import Queue from 'bull';

export abstract class BaseQueue {
	abstract queue: Queue.Queue;

	abstract initQueue(): void;

	abstract setProcess(): void;

	abstract add(data: any, type?: string, options?: Queue.JobOptions): void;
}

import { Job } from 'bull';
import { IQueueAccount } from '../../interfaces/queues/accountQueue.interface';

const accountProcess = async (job: Job<IQueueAccount>) => {};

export default accountProcess;

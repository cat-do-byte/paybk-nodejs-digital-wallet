import { Job } from 'bull';
import { IQueueEmail } from '../../interfaces/queues/emailQueue.interface';
import EmailService from '../../services/email.service';

const emailProcess = async (job: Job<IQueueEmail>) => {
	const { email } = job.data;
	const emailService = new EmailService();

	emailService.send({
		to: email,
		subject: 'Register success',
		contentText: 'Your registration is successful',
	});
};

export default emailProcess;

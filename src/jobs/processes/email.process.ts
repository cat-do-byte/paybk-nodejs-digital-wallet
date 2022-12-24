import { Job } from 'bull';
import { IEmailQueue } from '../../interfaces/queues/emailQueue.interface';
import EmailService from '../../services/email.service';

const emailProcess = async (job: Job<IEmailQueue>) => {
	const { email } = job.data;
	const emailService = new EmailService();

	emailService.send({
		to: email,
		subject: 'Register success',
		contentText: 'Your registration is successful',
	});
};

export default emailProcess;

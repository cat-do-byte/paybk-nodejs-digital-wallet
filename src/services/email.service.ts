import nodemailer from 'nodemailer';

interface IEmailOption {
	to: string;
	subject: string;
	contentText: string;
	contentHtml?: string;
}
export default class EmailService {
	private transporter: nodemailer.Transporter;

	constructor() {
		// better change this information

		this.transporter = nodemailer.createTransport({
			host: 'smtp.ethereal.email',
			port: 587,
			secure: false,
			auth: {
				user: 'broderick.greenholt@ethereal.email',
				pass: 'pUkHJqxzYAJsGnwg3S',
			},
			tls: {
				rejectUnauthorized: false,
			},
		});
	}

	async send(emailOptions: IEmailOption): Promise<void> {
		const { to, subject, contentText, contentHtml } = emailOptions;
		const mainOptions = {
			from: 'PayBk Wallet',
			to: to,
			subject: subject,
			text: contentText,
			html: contentHtml,
		};

		try {
			const result = await this.transporter.sendMail(mainOptions);
		} catch (err) {
			// handle process error send mail
			console.log(err);
		}
	}
}

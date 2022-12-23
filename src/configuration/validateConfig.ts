import { validateOrReject } from 'class-validator';
import { Config } from './validate/config.dto';

export const validateEnv = (config: Config) =>
	validateOrReject(config, {
		whitelist: true,
		forbidNonWhitelisted: true,
		validationError: { target: false, value: false },
	}).catch((errors: any) => {
		console.log(`Validation failed with following Errors:`);
		errors.forEach((obj: any) => {
			console.log(`${obj}`);
		});

		process.exit();
	});

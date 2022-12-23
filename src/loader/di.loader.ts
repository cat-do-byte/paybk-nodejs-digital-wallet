import Container from 'typedi';
import User from '../models/user.model';
// import EmailService from '../services/email.service';
import databaseLoader from './database.loader';

export const dependencyLoader = async (): Promise<void> => {
	const modelLoader = await databaseLoader();
	modelLoader.forEach((model) => {
		Container.set(model.name, model.model);
	});
	// Container.set(EmailService, EmailService);
};

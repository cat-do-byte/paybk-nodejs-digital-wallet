import { Service } from 'typedi';
import { eventEmitter, Events } from '../common/event';

@Service()
export default class EmailService {
	constructor() {
		console.log('fjksdjfksdjlk');
		this.initializeEventListeners();
	}

	private initializeEventListeners(): void {
		eventEmitter.on(Events.USER_REGISTRATION, ({ email }) => {
			console.log(email, 'email maillll::');
		});
	}
}

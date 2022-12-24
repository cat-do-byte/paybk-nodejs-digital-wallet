import { ModelClass } from 'objection';
import { HttpError } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import { eventEmitter, Events } from '../common/event';
import { RegisterDto } from '../dto/auth/register.dto';
import { EmailQueue } from '../jobs/queues/email.queue';
import User from '../models/user.model';
import { UserRepository } from '../respository/user.repository';
import UserService from './user.service';

@Service()
export default class AuthService {
	constructor(
		@Inject(User.name) private userModel: ModelClass<User>,
		private userService: UserService,
		private emailQueue: EmailQueue
	) {}
	// constructor(private readonly userRepository: UserRepository) {}

	async register(registerData: RegisterDto): Promise<User> {
		const { username, email, password, role } = registerData;

		// check exist
		const user = await this.userModel.query().where({ username }).orWhere({ email }).first();

		if (user) {
			throw new HttpError(400, `User is existed`);
		}

		// create user
		// const newUser = await this.userModel.query().insert(registerData);
		const newUser = await this.userService.createUser({
			username,
			password,
			email,
			role,
		});

		console.log('newUser::', newUser);

		this.emailQueue.addRegisterUser({ email: newUser.email });
		// send email
		return newUser;
		//
	}
}

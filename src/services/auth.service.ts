import { ModelClass } from 'objection';
import { HttpError } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import { eventEmitter, Events } from '../common/event';
import { LoginDto } from '../dto/auth/login.dto';
import { RegisterDto } from '../dto/auth/register.dto';
import { EmailQueue } from '../jobs/queues/email.queue';
import User from '../models/user.model';
import { UserRepository } from '../respository/user.repository';
import { generateToken } from '../utils';
import UserService from './user.service';

@Service()
export default class AuthService {
	constructor(
		@Inject(User.name) private userModel: ModelClass<User>,
		private userService: UserService,
		private emailQueue: EmailQueue
	) {}

	async register(registerData: RegisterDto): Promise<User> {
		const { username, email, password, role } = registerData;

		// check exist
		const user = await this.userModel.query().where({ email }).first();

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

		this.emailQueue.addRegisterUser({ email: newUser.email });
		// send email
		return newUser;
		//
	}

	async login(loginData: LoginDto): Promise<{ token: string }> {
		const { email, password } = loginData;

		const user = await this.userModel.query().findOne({ email });
		if (!user) throw new HttpError(404, 'User is not existed');

		const verifyPassword = await user.comparePassword(password);
		if (verifyPassword !== true) throw new HttpError(401, 'Password is not correct');

		const token = generateToken({
			id: user.id,
			role: user.role,
		});

		return { token };
	}
}

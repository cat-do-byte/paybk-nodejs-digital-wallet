import { ModelClass } from 'objection';
import { HttpError } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import { RegisterDto } from '../dto/auth/register.dto';
import User from '../models/user.model';
import { UserRepository } from '../respository/user.repository';

@Service()
export default class AuthService {
	constructor(@Inject(User.name) private userModel: ModelClass<User>) {}
	// constructor(private readonly userRepository: UserRepository) {}

	async register(registerData: RegisterDto): Promise<User> {
		const { username, email } = registerData;

		const users = await this.userModel.query().findById(4);
		// check exist
		const user = await this.userModel.query().where({ username }).orWhere({ email }).first();
		if (user) {
			throw new HttpError(400, `User is existed`);
		}

		// create user
		const newUser = await this.userModel.query().insert(registerData);
		// send email
		return newUser;
		//
	}
}

import { ModelClass } from 'objection';
import { HttpError } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import User from '../models/user.model';

@Service()
export default class UserService {
	constructor(@Inject(User.name) private userModel: ModelClass<User>) {}

	async createUser(userData: Partial<User>): Promise<User> {
		const newUser = await this.userModel.query().insertGraph({
			...userData,
			wallet: {
				balance: 0,
			},
		});

		if (!newUser) throw new HttpError(400, `Can not create user`);

		return newUser;
	}
}

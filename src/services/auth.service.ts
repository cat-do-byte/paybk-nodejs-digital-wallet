import { Model } from 'objection';
import { Inject, Service, Container } from 'typedi';
import User from '../models/user.model';
import { UserRepository } from '../respository/user.repository';

@Service()
export default class AuthService {
	// constructor(@Inject(User.name) private userModel: typeof User) {}
	constructor(private readonly userRepository: UserRepository) {}
	async register() {
		/* console.log(await this.userRepository.find());
		return 2; */
		return await this.userRepository.find();
	}
}

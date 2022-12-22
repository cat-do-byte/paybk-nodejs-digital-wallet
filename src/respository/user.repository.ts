import { Service } from 'typedi';
import User from '../models/user.model';
import BaseRepository from './base.repository';

@Service()
export class UserRepository extends BaseRepository<User> {
	constructor() {
		super(User);
	}
}

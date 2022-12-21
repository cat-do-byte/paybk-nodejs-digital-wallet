import { Get, JsonController, Post } from 'routing-controllers';

@JsonController('/')
export default class AuthController {
	@Post('/register')
	async register() {
		return 'categories';
	}
}

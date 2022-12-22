import { Get, JsonController, Post } from 'routing-controllers';
import AuthService from '../services/auth.service';

@JsonController('/')
export default class AuthController {
	/* @Get('/')
	async register() {
		return 4;
	} */
	constructor(private readonly authService: AuthService) {}

	@Get('register')
	async register() {
		return await this.authService.register();
		return 3;
	}
}

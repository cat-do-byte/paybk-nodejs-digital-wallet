import { Body, Get, JsonController, Post } from 'routing-controllers';
import { RegisterDto } from '../dto/auth/register.dto';
import AuthService from '../services/auth.service';

@JsonController('/')
export default class AuthController {
	/* @Get('/')
	async register() {
		return 4;
	} */
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	async register(@Body() registerData: RegisterDto) {
		return await this.authService.register(registerData);
	}
}

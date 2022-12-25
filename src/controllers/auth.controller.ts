import { Body, Get, JsonController, Post } from 'routing-controllers';
import { LoginDto } from '../dto/auth/login.dto';
import { RegisterDto } from '../dto/auth/register.dto';
import AuthService from '../services/auth.service';

@JsonController('/')
export default class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	async register(@Body() registerData: RegisterDto) {
		return await this.authService.register(registerData);
	}

	@Post('login')
	async login(@Body() loginData: LoginDto): Promise<{ token: string }> {
		return await this.authService.login(loginData);
	}
}

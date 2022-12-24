import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../models/user.model';

export class RegisterDto {
	@IsString()
	@MinLength(3)
	username: string;

	@IsEmail()
	email: string;

	@IsString()
	@MinLength(6)
	password: string;

	@IsEnum(UserRole)
	@IsOptional()
	role: UserRole = UserRole.CUSTOMER;
}

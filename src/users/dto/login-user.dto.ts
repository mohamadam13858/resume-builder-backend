import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ 
    example: 'user@example.com',
    required: true 
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    example: 'Password123',
    required: true 
  })
  @IsString()
  @MinLength(6)
  password: string;
}
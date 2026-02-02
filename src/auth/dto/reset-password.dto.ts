import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'توکن ریست ارسال شده به ایمیل' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'NewPassword123' })
  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'رمز عبور باید شامل حروف بزرگ، کوچک و عدد باشد',
  })
  newPassword: string;

  @ApiProperty({ example: 'NewPassword123' })
  @IsString()
  confirmPassword: string;
}
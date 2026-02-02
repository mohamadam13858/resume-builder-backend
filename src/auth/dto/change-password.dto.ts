// src/auth/dto/change-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ 
    example: 'OldPassword123',
    description: 'رمز عبور فعلی' 
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({ 
    example: 'NewPassword123',
    description: 'رمز عبور جدید باید حداقل ۶ کاراکتر داشته باشد' 
  })
  @IsString()
  @MinLength(6)
  @Matches(/(?=.*\d)/, {
    message: 'رمز عبور باید حداقل یک عدد داشته باشد',
  })
  newPassword: string;

  @ApiProperty({ 
    example: 'NewPassword123',
    description: 'تکرار رمز عبور جدید' 
  })
  @IsString()
  confirmPassword: string;
}
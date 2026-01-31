import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'user@example.com' })
  @Expose()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @Expose()
  fullName: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @Expose()
  phone?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  @Expose()
  profileImage?: string;

  @ApiProperty({ example: false })
  @Expose()
  isVerified: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  @Expose()
  createdAt: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
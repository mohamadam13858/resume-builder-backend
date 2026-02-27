import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResumeResponseDto } from '../../resumes/dto/resume-response.dto';

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  fullName: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  bio?: string;

  @ApiPropertyOptional()
  profileImage?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()              
  updatedAt?: Date;

  @ApiPropertyOptional({ type: [ResumeResponseDto] })
  resumes?: ResumeResponseDto[];

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }

  static fromUser(user: any): UserResponseDto {
    const values = user.toJSON ? user.toJSON() : { ...user };

    return new UserResponseDto({
      id: values.id,
      email: values.email,
      fullName: values.fullName,
      phone: values.phone,
      bio: values.bio,
      profileImage: values.profileImage,
      createdAt: values.createdAt,
      updatedAt: values.updatedAt,          
      resumes: values.resumes?.map((r: any) => new ResumeResponseDto(r)),
    });
  }
}
import { Exclude, Expose, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ResumeResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'Senior Software Engineer Resume' })
  @Expose()
  title: string;

  @ApiProperty({
    example: {
      personalInfo: {
        name: 'John Doe',
        email: 'john@example.com',
      },
    },
  })
  @Expose()
  @Transform(({ value }) => value || {})
  content: any;

  @ApiProperty({ example: 'draft', enum: ['draft', 'published', 'archived'] })
  @Expose()
  status: string;

  @ApiProperty({ example: false })
  @Expose()
  isPublic: boolean;

  @ApiProperty({ example: 0 })
  @Expose()
  viewCount: number;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  @Expose()
  updatedAt: Date;

  @Exclude()
  userId: number;

  @Exclude()
  deletedAt: Date;

  constructor(partial: Partial<ResumeResponseDto>) {
    Object.assign(this, partial);
  }
}
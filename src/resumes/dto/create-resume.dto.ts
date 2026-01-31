import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsEnum, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import type { ResumeContent } from '../resume.model';

export class CreateResumeDto {
  @ApiProperty({
    description: 'Title of the resume',
    example: 'Senior Software Engineer Resume',
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Resume content in JSON format',
    example: {
      personalInfo: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        location: 'San Francisco, CA',
        linkedin: 'https://linkedin.com/in/johndoe',
        github: 'https://github.com/johndoe',
      },
      summary: 'Experienced software engineer...',
      experience: [
        {
          id: 'exp1',
          company: 'Tech Corp',
          position: 'Senior Developer',
          startDate: '2020-01-01',
          isCurrent: true,
          description: ['Lead team of developers', 'Architected microservices'],
        },
      ],
    },
  })
  @IsObject()
  @Type(() => Object)
  content: ResumeContent;

  @ApiPropertyOptional({
    description: 'Status of the resume',
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  })
  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'])
  status?: 'draft' | 'published' | 'archived';

  @ApiPropertyOptional({
    description: 'Template ID for styling',
    example: 'modern-blue',
  })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional({
    description: 'Whether the resume is publicly accessible',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

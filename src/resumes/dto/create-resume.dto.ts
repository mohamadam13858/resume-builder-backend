
import { IsString, IsOptional, IsObject, IsEnum, IsBoolean, MinLength, MaxLength, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import type { ResumeContent } from '../resume.model';

export class CreateResumeDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @IsObject()
  @Type(() => Object)
  content: ResumeContent;

  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'])
  status?: 'draft' | 'published' | 'archived';

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

// src/resumes/dto/update-resume.dto.ts


// src/resumes/dto/resume-response.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateResumeDto } from './create-resume.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { ResumeContent } from '../resume.model';

export class UpdateResumeDto extends PartialType(CreateResumeDto) {
  @ApiPropertyOptional({ description: 'Title of the resume' })
  title?: string;

  @ApiPropertyOptional({ description: 'Resume content in JSON format' })
  content?: ResumeContent;
}
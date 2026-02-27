import { PartialType } from '@nestjs/mapped-types';
import { CreateResumeDto } from './create-resume.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateResumeDto extends PartialType(CreateResumeDto) {
  @ApiPropertyOptional({ description: 'Title of the resume' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Resume content in JSON format',
    type: 'object',
    additionalProperties: true,
  })
  content?: any;   // یا نوع دقیق ResumeContent

  // اگر در مدل Resume فیلد templateId از نوع INTEGER است → اینجا هم number بگذار
  @ApiPropertyOptional({ description: 'شناسه قالب', example: 1 })
  templateId?: string;   // ← اگر مدل string است، string بگذار
}
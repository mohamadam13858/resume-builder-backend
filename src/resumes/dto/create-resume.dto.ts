import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsObject,
  IsEnum,
  IsBoolean,
  MinLength,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { ResumeContent } from '../resume.model';

// اگر ساختار content پیچیده است، بهتر است یک DTO جداگانه برای آن تعریف کنی
// اما فعلاً با همین @IsObject و @Type پیش می‌رویم

export class CreateResumeDto {
  @ApiProperty({
    description: 'عنوان رزومه',
    example: 'رزومه مهندس نرم‌افزار ارشد',
    minLength: 3,
    maxLength: 255,
  })
  @IsString({ message: 'عنوان باید رشته باشد' })
  @MinLength(3, { message: 'عنوان حداقل ۳ کاراکتر باید باشد' })
  @MaxLength(255, { message: 'عنوان حداکثر ۲۵۵ کاراکتر می‌تواند باشد' })
  title: string;

  @ApiProperty({
    description: 'محتوای رزومه به صورت ساختار JSON',
    example: {
      personalInfo: {
        name: 'علی محمدی',
        email: 'ali@example.com',
        phone: '+989123456789',
      },
      summary: 'مهندس نرم‌افزار با ۵ سال تجربه...',
      experience: [
        {
          company: 'شرکت نمونه',
          position: 'برنامه‌نویس ارشد',
          startDate: '۱۴۰۰-۰۱-۰۱',
          description: ['طراحی و توسعه API', 'رهبری تیم فنی'],
        },
      ],
    },
  })
  @IsObject({ message: 'محتوا باید یک شیء JSON معتبر باشد' })
  @ValidateNested({ each: false }) // اگر content آرایه یا شیء پیچیده دارد مفید است
  @Type(() => Object)               // کمک می‌کند transformer کار کند
  content: ResumeContent;

  @ApiPropertyOptional({
    description: 'وضعیت رزومه',
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
    example: 'draft',
  })
  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'], {
    message: 'وضعیت باید یکی از draft, published, archived باشد',
  })
  status?: 'draft' | 'published' | 'archived';

  @ApiPropertyOptional({
    description: 'شناسه یا نام قالب مورد استفاده',
    example: 'modern-blue',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  templateId?: string;

  @ApiPropertyOptional({
    description: 'آیا رزومه برای عموم قابل مشاهده است؟',
    default: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isPublic باید مقدار بولی باشد' })
  isPublic?: boolean;
}
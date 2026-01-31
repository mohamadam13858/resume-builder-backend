import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Resume } from './resume.model';
import { User } from '../users/user.model';
import { ResumeResponseDto } from './dto/resume-response.dto';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { Op, Sequelize } from 'sequelize';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume)
    private resumeModel: typeof Resume,
    private sequelize: Sequelize,
  ) {}

  
async create(userId: number, createResumeDto: CreateResumeDto): Promise<ResumeResponseDto> {
  const resumeData = {
    userId,
    title: createResumeDto.title,
    content: createResumeDto.content || {},
    status: createResumeDto.status || 'draft',
    templateId: createResumeDto.templateId || null,
    isPublic: createResumeDto.isPublic || false,
  };

  const resume = await this.resumeModel.create(resumeData as any);
  return new ResumeResponseDto(resume.toJSON());
}



  async findAll(userId: number, options?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: ResumeResponseDto[]; total: number; page: number; totalPages: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;
    
    const where: any = { userId };
    if (options?.status) {
      where.status = options.status;
    }

    const { rows, count } = await this.resumeModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [['updated_at', 'DESC']],
    });

    return {
      data: rows.map(resume => new ResumeResponseDto(resume.toJSON())),
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

  async findOne(id: number, userId: number): Promise<ResumeResponseDto> {
    const resume = await this.resumeModel.findOne({
      where: { id, userId },
    });

    if (!resume) {
      throw new NotFoundException(`Resume with ID ${id} not found`);
    }
    await resume.markAsViewed();

    return new ResumeResponseDto(resume.toJSON());
  }

  
  async update(id: number, userId: number, updateResumeDto: UpdateResumeDto): Promise<ResumeResponseDto> {
    const resume = await this.resumeModel.findOne({
      where: { id, userId },
    });

    if (!resume) {
      throw new NotFoundException(`Resume with ID ${id} not found`);
    }

    await resume.update(updateResumeDto);

    return new ResumeResponseDto(resume.toJSON());
  }

  // حذف رزومه (soft delete)
  async remove(id: number, userId: number): Promise<void> {
    const resume = await this.resumeModel.findOne({
      where: { id, userId },
    });

    if (!resume) {
      throw new NotFoundException(`Resume with ID ${id} not found`);
    }

    await resume.destroy();
  }

  
  async search(userId: number, query: string): Promise<ResumeResponseDto[]> {
    const resumes = await this.resumeModel.findAll({
      where: {
        userId,
        [Op.or]: [
          { title: { [Op.like]: `%${query}%` } },
          this.sequelize.where(
            this.sequelize.fn('JSON_EXTRACT', this.sequelize.col('content'), '$.personalInfo.name'),
            { [Op.like]: `%${query}%` }
          ),
        ],
      },
    });

    return resumes.map(resume => new ResumeResponseDto(resume.toJSON()));
  }


  async findPublic(id: number): Promise<ResumeResponseDto> {
    const resume = await this.resumeModel.findOne({
      where: { id, isPublic: true, status: 'published' },
    });

    if (!resume) {
      throw new NotFoundException(`Public resume with ID ${id} not found`);
    }

    await resume.markAsViewed();

    return new ResumeResponseDto(resume.toJSON());
  }

  
  async changeStatus(id: number, userId: number, status: 'draft' | 'published' | 'archived'): Promise<ResumeResponseDto> {
    const resume = await this.resumeModel.findOne({
      where: { id, userId },
    });

    if (!resume) {
      throw new NotFoundException(`Resume with ID ${id} not found`);
    }

    resume.status = status;
    if (status === 'published') {
      resume.publishedAt = new Date();
    }
    await resume.save();

    return new ResumeResponseDto(resume.toJSON());
  }
}
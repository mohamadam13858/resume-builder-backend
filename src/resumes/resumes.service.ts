import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Resume } from './resume.model';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { ResumeResponseDto } from './dto/resume-response.dto';
import { Op, Sequelize } from 'sequelize';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume)
    private resumeModel: typeof Resume,
  ) { }

  async create(userId: number, dto: CreateResumeDto): Promise<ResumeResponseDto> {
    const resume = await this.resumeModel.create({
      userId,
      title: dto.title,
      content: dto.content ?? {},
      status: dto.status ?? 'draft',
      templateId: dto.templateId,     
      isPublic: dto.isPublic ?? false,
    } as any);

    return new ResumeResponseDto(resume.toJSON());
  }


  async findAll(
    userId: number,
    options?: {
      status?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<{
    data: ResumeResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
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

    await (resume as any).markAsViewed();

    return new ResumeResponseDto(resume.toJSON());
  }


  async update(
    id: number,
    userId: number,
    updateResumeDto: UpdateResumeDto,
  ): Promise<ResumeResponseDto> {
    const resume = await this.resumeModel.findOne({
      where: { id, userId },
    });

    if (!resume) {
      throw new NotFoundException(`Resume with ID ${id} not found`);
    }

    await resume.update(updateResumeDto);

    return new ResumeResponseDto(resume.toJSON());
  }


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
          { title: { [Op.iLike]: `%${query}%` } },
          Sequelize.where(
            Sequelize.cast(Sequelize.col('content'), 'text'),
            { [Op.iLike]: `%${query}%` }
          ),
        ],
      },
      limit: 20,
    });

    return resumes.map((r) => new ResumeResponseDto(r.toJSON()));
  }

  async findPublic(id: number): Promise<ResumeResponseDto> {
    const resume = await this.resumeModel.findOne({
      where: { id, isPublic: true, status: 'published' },
    });

    if (!resume) {
      throw new NotFoundException(`Public resume with ID ${id} not found`);
    }

    await (resume as any).markAsViewed();

    return new ResumeResponseDto(resume.toJSON());
  }




  async changeStatus(
    id: number,
    userId: number,
    status: 'draft' | 'published' | 'archived',
  ): Promise<ResumeResponseDto> {
    const resume = await this.resumeModel.findOne({
      where: { id, userId },
    });

    if (!resume) {
      throw new NotFoundException(`Resume with ID ${id} not found`);
    }

    resume.status = status;
    if (status === 'published') {
      (resume as any).publishedAt = new Date();
    }
    await resume.save();

    return new ResumeResponseDto(resume.toJSON());
  }
}
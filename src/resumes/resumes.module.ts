import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ResumesService } from './resumes.service';
import { ResumesController, PublicResumesController } from './resumes.controller';
import { Resume } from './resume.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Resume]),
  ],
  controllers: [ResumesController, PublicResumesController],
  providers: [ResumesService],
  exports: [ResumesService],
})
export class ResumesModule {}
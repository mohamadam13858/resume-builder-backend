import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('resumes')
@ApiBearerAuth()
@Controller('resumes')
@UseGuards(JwtAuthGuard) 
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new resume' })
  @ApiResponse({ status: 201, description: 'Resume created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Request() req, @Body() createResumeDto: CreateResumeDto) {
    return this.resumesService.create(req.user.id, createResumeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all resumes for current user' })
  async findAll(
    @Request() req,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.resumesService.findAll(req.user.id, { status, page, limit });
  }

  @Get('search')
  @ApiOperation({ summary: 'Search resumes' })
  async search(@Request() req, @Query('q') query: string) {
    return this.resumesService.search(req.user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a resume by ID' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.resumesService.findOne(+id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a resume' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateResumeDto: UpdateResumeDto,
  ) {
    return this.resumesService.update(+id, req.user.id, updateResumeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a resume' })
  async remove(@Request() req, @Param('id') id: string) {
    return this.resumesService.remove(+id, req.user.id);
  }

  @Patch(':id/status/:status')
  @ApiOperation({ summary: 'Change resume status' })
  async changeStatus(
    @Request() req,
    @Param('id') id: string,
    @Param('status') status: 'draft' | 'published' | 'archived',
  ) {
    return this.resumesService.changeStatus(+id, req.user.id, status);
  }
}


@ApiTags('public')
@Controller('public/resumes')
export class PublicResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a public resume' })
  @ApiResponse({ status: 200, description: 'Public resume found' })
  @ApiResponse({ status: 404, description: 'Resume not found or not public' })
  async findOne(@Param('id') id: string) {
    return this.resumesService.findPublic(+id);
  }
}
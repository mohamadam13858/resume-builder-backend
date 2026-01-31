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
import { ResumeResponseDto } from './dto/resume-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('resumes')
@ApiBearerAuth('JWT-auth')
@Controller('resumes')
@UseGuards(JwtAuthGuard)
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new resume',
    description: 'Create a new resume for the authenticated user',
  })
  @ApiBody({ type: CreateResumeDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Resume created successfully',
    type: ResumeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
  async create(@Request() req, @Body() createResumeDto: CreateResumeDto) {
    return this.resumesService.create(req.user.id, createResumeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all resumes for current user' })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    enum: ['draft', 'published', 'archived'],
    description: 'Filter by status' 
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number,
    description: 'Page number for pagination',
    example: 1 
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number,
    description: 'Number of items per page',
    example: 10 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of resumes',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ResumeResponseDto' },
        },
        total: { type: 'number', example: 15 },
        page: { type: 'number', example: 1 },
        totalPages: { type: 'number', example: 2 },
      },
    },
  })
  async findAll(
    @Request() req,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.resumesService.findAll(req.user.id, { status, page, limit });
  }

  @Get('search')
  @ApiOperation({ summary: 'Search resumes by title or content' })
  @ApiQuery({ 
    name: 'q', 
    required: true, 
    description: 'Search query',
    example: 'software engineer' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Search results',
    type: [ResumeResponseDto],
  })
  async search(@Request() req, @Query('q') query: string) {
    return this.resumesService.search(req.user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific resume by ID' })
  @ApiParam({ 
    name: 'id', 
    description: 'Resume ID',
    type: Number,
    example: 1 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Resume found',
    type: ResumeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Resume not found' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.resumesService.findOne(+id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a resume' })
  @ApiParam({ name: 'id', description: 'Resume ID' })
  @ApiBody({ type: UpdateResumeDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Resume updated successfully',
    type: ResumeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Resume not found' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateResumeDto: UpdateResumeDto,
  ) {
    return this.resumesService.update(+id, req.user.id, updateResumeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a resume (soft delete)' })
  @ApiParam({ name: 'id', description: 'Resume ID' })
  @ApiResponse({ status: 204, description: 'Resume deleted successfully' })
  @ApiResponse({ status: 404, description: 'Resume not found' })
  async remove(@Request() req, @Param('id') id: string) {
    return this.resumesService.remove(+id, req.user.id);
  }

  @Patch(':id/status/:status')
  @ApiOperation({ summary: 'Change resume status' })
  @ApiParam({ name: 'id', description: 'Resume ID' })
  @ApiParam({ 
    name: 'status', 
    enum: ['draft', 'published', 'archived'],
    description: 'New status' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Status updated successfully',
    type: ResumeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Resume not found' })
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
  @ApiOperation({ summary: 'Get a public resume (no authentication required)' })
  @ApiParam({ name: 'id', description: 'Resume ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Public resume found',
    type: ResumeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Resume not found or not public' })
  async findOne(@Param('id') id: string) {
    return this.resumesService.findPublic(+id);
  }
}
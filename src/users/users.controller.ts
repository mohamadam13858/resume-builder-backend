import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserResponseDto } from './dto/user.response.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { CurrentUser } from '../auth/types/current-user.interface';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user with their resumes' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@GetUser() currentUser: CurrentUser): Promise<UserResponseDto> {
    const user = await this.usersService.findById(currentUser.id, true); // true = with resumes

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID (resumes visible only to the owner)',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() currentUser: CurrentUser,
  ): Promise<UserResponseDto> {
    const withResumes = currentUser.id === id;

    const user = await this.usersService.findById(id, withResumes);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @Get()
  @ApiOperation({ summary: 'Get list of all users (admin only)' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  async findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }
}
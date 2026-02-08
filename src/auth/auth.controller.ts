import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) { }


  @Post('register')
  @ApiOperation({ summary: 'ثبت‌نام کاربر جدید' })
  @ApiResponse({
    status: 201,
    description: 'ثبت‌نام موفقیت‌آمیز بود',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIs...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIs...',
        token_type: 'Bearer',
        expires_in: 900,
        user: {
          id: 1,
          email: 'user@example.com',
          fullName: 'John Doe',
          phone: '+1234567890',
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'ایمیل تکراری است'
  })
  @ApiBody({ type: CreateUserDto })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }


  @Post('login')
  @ApiOperation({ summary: 'ورود به سیستم' })
  @ApiResponse({
    status: 201,
    description: 'ورود موفقیت‌آمیز بود',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIs...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIs...',
        token_type: 'Bearer',
        expires_in: 900,
        user: {
          id: 1,
          email: 'user@example.com',
          fullName: 'John Doe',
          phone: '+1234567890',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'ایمیل یا رمز عبور نادرست است'
  })
  @ApiBody({ type: LoginUserDto })
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }


  @Post('refresh')
  @ApiOperation({ summary: 'تازه‌سازی توکن دسترسی' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'توکن جدید صادر شد' })
  @ApiResponse({ status: 401, description: 'رفرش توکن نامعتبر یا منقضی' })
  async refreshTokens(@Body() body: RefreshTokenDto) {
    return this.authService.refreshTokens(body.refreshToken);
  }


  // @Post('refresh')
  // @UseGuards(RefreshTokenGuard)
  // @ApiBearerAuth('refresh-token')
  // @ApiOperation({ summary: 'تازه‌سازی توکن دسترسی' })
  // @ApiResponse({ 
  //   status: 200, 
  //   description: 'توکن‌ها با موفقیت تازه‌سازی شدند',
  // })
  // @ApiResponse({ 
  //   status: 401, 
  //   description: 'توکن نامعتبر است' 
  // })
  // async refreshTokens(@Request() req) {
  //   const refreshToken = req.user?.refreshToken || req.body?.refreshToken;

  //   if (!refreshToken) {
  //     throw new BadRequestException('Refresh token is required');
  //   }

  //   return this.authService.refreshTokens(refreshToken);
  // }


  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تغییر رمز عبور' })
  @ApiResponse({
    status: 200,
    description: 'رمز عبور با موفقیت تغییر یافت',
    schema: {
      example: {
        message: 'رمز عبور با موفقیت تغییر یافت',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'رمزهای عبور جدید مطابقت ندارند'
  })
  @ApiResponse({
    status: 401,
    description: 'رمز عبور فعلی نادرست است'
  })
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }


  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'دریافت پروفایل کاربر جاری' })
  @ApiResponse({
    status: 200,
    description: 'اطلاعات پروفایل',
    schema: {
      example: {
        id: 1,
        email: 'user@example.com',
        fullName: 'John Doe',
        phone: '+1234567890',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'توکن نامعتبر است'
  })
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }
}
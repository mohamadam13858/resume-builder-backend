import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Patch,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import type { Response as ExpressResponse, Request as ExpressRequest } from 'express'; 
import { AuthService } from './auth.service';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'ثبت‌نام کاربر جدید' })
  @ApiResponse({ status: 201, description: 'ثبت‌نام موفقیت‌آمیز بود' })
  @ApiResponse({ status: 409, description: 'ایمیل تکراری است' })
  @ApiBody({ type: CreateUserDto })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'ورود به سیستم' })
  @ApiResponse({
    status: 201,
    description: 'ورود موفقیت‌آمیز بود',
  })
  @ApiResponse({ status: 401, description: 'ایمیل یا رمز عبور نادرست است' })
  @ApiBody({ type: LoginUserDto })
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const result = await this.authService.login(loginUserDto);

    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      path: '/',
    });

    return {
      access_token: result.access_token,
      token_type: 'Bearer',
      expires_in: result.expires_in || 900,
      user: result.user,
    };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'تازه‌سازی توکن دسترسی' })
  @ApiResponse({ status: 200, description: 'توکن جدید صادر شد' })
  @ApiResponse({ status: 401, description: 'رفرش توکن نامعتبر یا منقضی' })
  async refreshTokens(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found in cookie');
    }
    const result = await this.authService.refreshTokens(refreshToken);
    if (result.refresh_token) {
      res.cookie('refresh_token', result.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });
    }
    return {
      access_token: result.access_token,
      token_type: 'Bearer',
      expires_in: result.expires_in || 900,
    };
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تغییر رمز عبور' })
  @ApiResponse({ status: 200, description: 'رمز عبور با موفقیت تغییر یافت' })
  @ApiResponse({ status: 400, description: 'رمزهای عبور جدید مطابقت ندارند' })
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
  @ApiResponse({ status: 200, description: 'اطلاعات پروفایل' })
  @ApiResponse({ status: 401, description: 'توکن نامعتبر است' })
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }

  @Post('logout')
  @ApiOperation({ summary: 'خروج از سیستم' })
  @ApiResponse({ status: 200, description: 'با موفقیت خارج شدید' })
  async logout(@Res({ passthrough: true }) res: ExpressResponse) {
    res.clearCookie('refresh_token', { path: '/' });
    return { message: 'Logged out successfully' };
  }
}
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(  
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }


  async register(createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);
      const tokens = await this.generateTokens(user);

      await this.updateLastLogin(user.id);

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_type: 'Bearer',
        expires_in: tokens.expires_in,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException('این ایمیل قبلاً ثبت شده است');
      }
      throw error;
    }
  }


  async login(loginUserDto: LoginUserDto) {
    try {
      if (!loginUserDto?.email?.trim() || !loginUserDto?.password?.trim()) {
        throw new BadRequestException('ایمیل و رمز عبور الزامی هستند');
      }

      const email = loginUserDto.email.trim();
      const password = loginUserDto.password.trim();

      const user = await this.usersService.findByEmail(email, true);
     console.log(user)
      if (!user) {
        throw new NotFoundException('ایمیل یا رمز عبور نادرست است');
      }

      const hashedPassword = user.get('password');

      if (!hashedPassword) {
        throw new BadRequestException('خطای سیستمی - لطفاً با پشتیبانی تماس بگیرید');
      }

      const isPasswordValid = await bcrypt.compare(password, hashedPassword);

      if (!isPasswordValid) {
        throw new NotFoundException('ایمیل یا رمز عبور نادرست است');
      }

      const tokens = await this.generateTokens(user);

      await this.updateLastLogin(user.id);

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_type: 'Bearer',
        expires_in: tokens.expires_in,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
        },
      };
    } catch (error) {
      console.error('Login error:', error.message);
      throw error;
    }
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh-secret-key',
      });

      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('کاربر یافت نشد');
      }

      const tokens = await this.generateTokens(user);

      await this.updateLastLogin(user.id);

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_type: 'Bearer',
        expires_in: tokens.expires_in,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
        },
      };
    } catch (error) {
      console.error('Refresh token error:', error.message);

      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('توکن منقضی شده است');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('توکن نامعتبر است');
      }

      throw new UnauthorizedException('خطای احراز هویت');
    }
  }


  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      // role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET') || 'secret-key',
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh-secret-key',
      expiresIn: '7d',
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 900,
    };
  }


  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    if (
      !changePasswordDto?.currentPassword?.trim() ||
      !changePasswordDto?.newPassword?.trim() ||
      !changePasswordDto?.confirmPassword?.trim()
    ) {
      throw new BadRequestException('همه فیلدهای رمز عبور الزامی هستند');
    }

    const user = await this.usersService.findByIdWithPassword(userId);
    console.log(user)

    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }

    if (!user.password) {
      throw new NotFoundException('این حساب کاربری با رمز عبور ساخته نشده است.');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('رمز عبور فعلی نادرست است');
    }

    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException('رمزهای عبور جدید مطابقت ندارند');
    }

    if (changePasswordDto.currentPassword === changePasswordDto.newPassword) {
      throw new BadRequestException('رمز عبور جدید باید با رمز عبور فعلی متفاوت باشد');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.usersService.updatePassword(userId, hashedPassword);

    return { message: 'رمز عبور با موفقیت تغییر یافت' };
  }


  async getProfile(userId: number) {
    const userDto = await this.usersService.findById(userId);  
    if (!userDto) {
      throw new NotFoundException('کاربر یافت نشد');
    }

    return {
      id: userDto.id,
      email: userDto.email,
      fullName: userDto.fullName,
      phone: userDto.phone,
      createdAt: userDto.createdAt,
      updatedAt: userDto.updatedAt ?? null,   
    };
  }


  private async updateLastLogin(userId: number) {
    await this.usersService.update(userId, {
      lastLoginAt: new Date(),
    } as any);
  }
}
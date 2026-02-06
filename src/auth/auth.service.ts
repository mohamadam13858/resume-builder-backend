import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
  ) { }


  async register(createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);
      const tokens = await this.generateTokens(user);

      return {
        ...tokens,
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
    console.log('Login attempt for:', loginUserDto.email);
    
    if (!loginUserDto?.email?.trim() || !loginUserDto?.password?.trim()) {
      throw new BadRequestException('ایمیل و رمز عبور الزامی هستند');
    }

    const email = loginUserDto.email.trim();
    const password = loginUserDto.password.trim();

    const user = await this.usersService.findByEmail(email, true);
    
    if (!user) {
      console.log('User not found');
      throw new UnauthorizedException('ایمیل یا رمز عبور نادرست است');
    }


    const hashedPassword = user.get('password');
    
    if (!hashedPassword) {
      console.error('No password in DB for user:', user.id);
      throw new UnauthorizedException('خطای سیستمی - لطفاً با پشتیبانی تماس بگیرید');
    }

    const isPasswordValid = await bcrypt.compare(password, hashedPassword);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      throw new UnauthorizedException('ایمیل یا رمز عبور نادرست است');
    }

    const tokens = await this.generateTokens(user);
    
    return {
      ...tokens,
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
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
      });

  
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('کاربر یافت نشد');
      }

      const tokens = await this.generateTokens(user);

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('توکن نامعتبر است');
    }
  }


  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {

    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('کاربر یافت نشد');
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

  
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

  
    await this.usersService.updatePassword(userId, hashedPassword);

    return { message: 'رمز عبور با موفقیت تغییر یافت' };
  }

  async getProfile(userId: number) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  
  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: process.env.JWT_SECRET || 'secret-key',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 900,
    };
  }

  private async updateLastLogin(userId: number) {
    await this.usersService.update(userId, {
      lastLoginAt: new Date(),
    });
  }
}
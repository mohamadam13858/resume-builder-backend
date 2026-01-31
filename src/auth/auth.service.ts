import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserResponseDto } from 'src/users/dto/user.response.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.validateUser(email, password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    return user;
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.validateUser(loginUserDto.email, loginUserDto.password);
    
    if (!user || !user.id) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const payload = { 
      email: user.email, 
      sub: user.id,
      fullName: user.fullName,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: new UserResponseDto(user),
    };
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const payload = { 
      email: user.email, 
      sub: user.id,
      fullName: user.fullName,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
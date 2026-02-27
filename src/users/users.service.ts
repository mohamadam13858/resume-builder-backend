import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UserResponseDto } from './dto/user.response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const existingUser = await this.userModel.findOne({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const user = await this.userModel.create({
        email: createUserDto.email,
        password: hashedPassword,
        fullName: createUserDto.fullName,
        phone: createUserDto.phone ?? undefined,
        bio: createUserDto.bio ?? undefined,
        profileImage: createUserDto.profileImage ?? undefined,
      } as any);

      return UserResponseDto.fromUser(user);
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      console.error('Error creating user:', error);
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findById(id: number, withResumes = false): Promise<UserResponseDto | null> {
    const options: any = {
      attributes: { exclude: ['password'] },
    };

    if (withResumes) {
      options.include = [{ model: this.userModel.associations.resumes?.target }];
    }

    const user = await this.userModel.findByPk(id, options);
    if (!user) return null;

    return UserResponseDto.fromUser(user);
  }

  async findByIdWithPassword(id: number): Promise<User | null> {
    return this.userModel.findByPk(id, {
      attributes: ['id', 'email', 'password', 'fullName', 'phone', 'createdAt'],
      raw: true
    });
  }

  async findByEmail(email: string, includePassword = false): Promise<User | null> {
    const attributes = ['id', 'email', 'fullName', 'phone', 'createdAt'];

    if (includePassword) attributes.push('password');

    return this.userModel.findOne({ where: { email }, attributes });
  }

  async validateUser(email: string, password: string): Promise<UserResponseDto | null> {
    const user = await this.findByEmail(email, true);
    if (!user || !user.password) return null;

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;

    return UserResponseDto.fromUser(user);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userModel.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
    return users.map(u => UserResponseDto.fromUser(u));
  }

  async update(
    id: number,
    updateData: Partial<CreateUserDto & { bio?: string; profileImage?: string }>,
  ): Promise<UserResponseDto> {
    const user = await this.userModel.findByPk(id);
    if (!user) throw new NotFoundException('User not found');

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    await user.update(updateData);

    const refreshed = await this.findById(id);
    if (!refreshed) throw new InternalServerErrorException();

    return refreshed;
  }

  async updatePassword(userId: number, newPassword: string): Promise<void> {
    const user = await this.userModel.findByPk(userId);
    if (!user) throw new NotFoundException('User not found');

    const hashed = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashed });
  }
}
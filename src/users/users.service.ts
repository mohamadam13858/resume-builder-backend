import { Injectable, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
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
    ) { }

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
                phone: createUserDto.phone || null,
            } as any);


            const userJson = user.toJSON();
            delete userJson.password;

            return new UserResponseDto(userJson);
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            console.error('Error creating user:', error);
            throw new InternalServerErrorException('Failed to create user');
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({
            where: { email },
            attributes: ['id', 'email', 'password', 'fullName', 'phone', 'createdAt', 'updatedAt'],
        });
    }

    async findById(id: number): Promise<Partial<User> | null> {
        const user = await this.userModel.findByPk(id, {
            attributes: { exclude: ['password'] },
        });

        if (!user) return null;


        return user.toJSON();
    }

    async validateUser(email: string, password: string): Promise<Partial<User> | null> {
        const user = await this.findByEmail(email);

        if (!user || !user.password) {
            return null;
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return null;
        }


        const { password: _, ...userWithoutPassword } = user.toJSON();
        return userWithoutPassword;
    }

    async update(id: number, updateData: Partial<User>): Promise<UserResponseDto> {
        const user = await this.userModel.findByPk(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }


        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        await user.update(updateData as any);

        const userJson = user.toJSON();
        delete userJson.password;

        return new UserResponseDto(userJson);
    }


    async findAll(): Promise<Partial<User>[]> {
        const users = await this.userModel.findAll({
            attributes: { exclude: ['password'] },
            order: [['created_at', 'DESC']],
        });

        return users.map(user => user.toJSON());
    }
}
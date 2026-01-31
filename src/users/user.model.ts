// src/users/user.model.ts
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  HasMany,
  CreatedAt,
  UpdatedAt,
  BeforeCreate,
  BeforeUpdate,
} from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';
import { Resume } from '../resumes/resume.model';

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true, 
})
export class User extends Model<User> {
  // @PrimaryKey
  // @AutoIncrement
  // @Column({
  //   type: DataType.INTEGER,
  //   field: 'id',
  // })
  // id: number;

  @Column({
    type: DataType.STRING(255),
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true,
      notNull: { msg: 'Email is required' },
      notEmpty: { msg: 'Email cannot be empty' },
    },
  })
  email: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    validate: {
      notNull: { msg: 'Password is required' },
      len: { args: [6, 100], msg: 'Password must be between 6 and 100 characters' },
    },
  })
  password: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: 'full_name',
    validate: {
      notNull: { msg: 'Full name is required' },
      notEmpty: { msg: 'Full name cannot be empty' },
    },
  })
  fullName: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
    field: 'phone',
  })
  phone?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  bio?: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    field: 'profile_image',
  })
  profileImage?: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: 'linkedin_url',
  })
  linkedinUrl?: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: 'github_url',
  })
  githubUrl?: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    field: 'is_verified',
  })
  isVerified: boolean;

  @HasMany(() => Resume)
  resumes: Resume[];

  // @CreatedAt
  // @Column({
  //   field: 'created_at',
  // })
  // createdAt: Date;

  // @UpdatedAt
  // @Column({
  //   field: 'updated_at',
  // })
  // updatedAt: Date;

  
  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(user: User) {
    if (user.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  }

  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
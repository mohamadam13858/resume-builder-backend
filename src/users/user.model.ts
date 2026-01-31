
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
export class User extends Model {
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


  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }


  toJSON() {
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
  }
}
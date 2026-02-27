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
} from 'sequelize-typescript';
import { Resume } from '../resumes/resume.model';

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true,
})
export class User extends Model<User> {

  // @PrimaryKey
  // @AutoIncrement
  // @Column(DataType.INTEGER)
  // id!: number;

  @Column({
    type: DataType.STRING(255),
    unique: true,
    allowNull: false,
    validate: { isEmail: true },
  })
  email!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  password!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: 'full_name',
  })
  fullName!: string;

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
    type: DataType.DATE,
    allowNull: true,
    field: 'last_login_at',
  })
  lastLoginAt?: Date;

  @HasMany(() => Resume, { onDelete: 'CASCADE' })
  resumes!: Resume[];

  // @CreatedAt
  // createdAt!: Date;

  // @UpdatedAt
  // updatedAt!: Date;

  async comparePassword(candidatePassword: string): Promise<boolean> {
    const bcrypt = await import('bcrypt');
    return bcrypt.compare(candidatePassword, this.password);
  }


  toJSON() {
    const values = { ...this.get({ plain: true }) };

    const { password, ...rest } = values;

    return rest;
  }
}
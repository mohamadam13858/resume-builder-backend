
// src/users/user.model.ts - نسخه اصلاح شده
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
export class User extends Model {
  @Column({
    type: DataType.STRING(255),
    unique: true,
    allowNull: false,
    validate: { isEmail: true },
  })
  declare email: string; // 👈 declare

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare password: string; // 👈 declare

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: 'full_name',
  })
  declare fullName: string; // 👈 declare

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
    field: 'phone',
  })
  declare phone?: string; // 👈 declare

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare bio?: string; // 👈 declare

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    field: 'profile_image',
  })
  declare profileImage?: string; // 👈 declare

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'last_login_at',
  })
  declare lastLoginAt?: Date;

  @HasMany(() => Resume)
  declare resumes: Resume[]; // 👈 declare


  // متدهای instance
  async comparePassword(password: string): Promise<boolean> {
    const bcrypt = await import('bcrypt');
    // 🔴 مهم: از get() استفاده کن نه property مستقیم
    const hashedPassword = this.get('password');
    return bcrypt.compare(password, hashedPassword);
  }

  toJSON() {
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
  }
}




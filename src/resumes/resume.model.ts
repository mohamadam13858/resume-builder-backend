// src/resumes/resume.model.ts
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  DefaultScope,
  Scopes,
} from 'sequelize-typescript';
import { User } from '../users/user.model';


export interface ResumeContent {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  summary?: string;
  experience?: Array<{
    id: string;
    company: string;
    position: string;
    location?: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    description: string[];
  }>;
  education?: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    location?: string;
    startDate: string;
    endDate?: string;
    gpa?: string;
    description?: string[];
  }>;
  skills?: Array<{
    id: string;
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    category: string;
    years?: number;
  }>;
  projects?: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    startDate?: string;
    endDate?: string;
  }>;
  certifications?: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }>;
  languages?: Array<{
    id: string;
    name: string;
    proficiency: 'basic' | 'intermediate' | 'fluent' | 'native';
  }>;
}


@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt'] },
  order: [['updated_at', 'DESC']],
}))

@Scopes(() => ({
  withUser: {
    include: [{
      model: User,
      attributes: ['id', 'email', 'fullName'],
    }],
  },
  published: {
    where: { status: 'published' },
  },
  userResumes: (userId: number) => ({
    where: { userId },
  }),
}))

@Table({
  tableName: 'resumes',
  timestamps: true,
  underscored: true,
  paranoid: true, 
})
export class Resume extends Model<Resume> {
  // @PrimaryKey
  // @AutoIncrement
  // @Column({
  //   type: DataType.INTEGER,
  //   field: 'id',
  // })
  // id: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    validate: {
      notNull: { msg: 'Title is required' },
      notEmpty: { msg: 'Title cannot be empty' },
    },
  })
  title: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
    defaultValue: {},
  })
  content: ResumeContent;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'user_id',
  })
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @Column({
    type: DataType.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft',
    allowNull: false,
  })
  status: 'draft' | 'published' | 'archived';

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: 'template_id',
  })
  templateId?: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    field: 'is_public',
  })
  isPublic: boolean;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    field: 'view_count',
  })
  viewCount: number;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    field: 'share_url',
  })
  shareUrl?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'last_viewed_at',
  })
  lastViewedAt?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'published_at',
  })
  publishedAt?: Date;

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

  // @Column({
  //   type: DataType.DATE,
  //   allowNull: true,
  //   field: 'deleted_at',
  // })
  // deletedAt?: Date;

  
  async markAsViewed(): Promise<void> {
    this.lastViewedAt = new Date();
    this.viewCount += 1;
    await this.save();
  }

  
  async publish(): Promise<void> {
    this.status = 'published';
    this.publishedAt = new Date();
    await this.save();
  }
}
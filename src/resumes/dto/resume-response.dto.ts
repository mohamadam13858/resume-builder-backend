import { Exclude, Expose, Transform } from 'class-transformer';

export class ResumeResponseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  @Transform(({ value }) => value || {})
  content: any;

  @Expose()
  status: string;

  @Expose()
  isPublic: boolean;

  @Expose()
  viewCount: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Exclude()
  userId: number;

  @Exclude()
  deletedAt: Date;

  constructor(partial: Partial<ResumeResponseDto>) {
    Object.assign(this, partial);
  }
}
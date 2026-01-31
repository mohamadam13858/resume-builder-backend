import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './users/user.model';
import { Resume } from './resumes/resume.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_DATABASE', 'resume_builder'),
        models: [User, Resume],
        autoLoadModels: true,
        synchronize: configService.get('NODE_ENV') === 'development',
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
        logging: configService.get('NODE_ENV') === 'development' 
          ? console.log 
          : false,
        dialectOptions: {
          useUTC: false,
          dateStrings: true,
          typeCast: true,
        },
        timezone: '+03:30', 
      }),
    }),
    
    SequelizeModule.forFeature([User, Resume]),
  ],
})
export class AppModule {}
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import dbConfig from '../config/db.config';
import { UsersModule } from './auth/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { TagsModule } from './tags/tags.module';
import { CategoriesModule } from './categories/categories.module';
import { PostsModule } from './posts/posts.module';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UploadsModule } from './uploads/uploads.module';


console.log(join(__dirname, '..', 'uploads'));
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [dbConfig],
    }),
    PassportModule.register({ defaultStrategy: 'google' }),
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'uploads'),
    //   exclude: ['/api/(.*)'],
    //   serveStaticOptions: {
    //     redirect: false,
    //     index: false,
    //   },
    // }),
    UsersModule,
    TagsModule,
    CategoriesModule,
    PostsModule,
    UploadsModule,
  ],
  controllers: [],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}

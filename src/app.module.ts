import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import dbConfig from '../config/db.config';
import { TagsModule } from './tags/tags.module';
import { CategoriesModule } from './categories/categories.module';
import { PostsModule } from './posts/posts.module';
import { UploadsModule } from './uploads/uploads.module';
import { MongooseModule } from '@nestjs/mongoose'; // Import MongooseModule
import { MongooseService } from './prisma/connectiondb.service';
import { UsersModule } from './auth/users/users.module';
import { CloudinaryService } from './cloudinary/cloudinary.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [dbConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: 'mongodb+srv://blog_v1:o3vUAMh5BAzFH0pD@atlascluster.kur4ae8.mongodb.net/blog-v1',
      }),
      inject: [ConfigService],
    }),
    // PassportModule.register({ defaultStrategy: 'google' }),
    UsersModule,
    TagsModule,
    CategoriesModule,
    PostsModule,
    UploadsModule,
  ],
  controllers: [],
  providers: [MongooseService, CloudinaryService],
  exports: [MongooseService, CloudinaryService],
})
export class AppModule {}

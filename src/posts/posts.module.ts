import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { postSchema } from '../../models/post';
import { tagSchema } from '../../models/tag';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Post', schema: postSchema },
      { name: 'Tag', schema: tagSchema },
    ]),
  ],
  controllers: [PostsController],
  providers: [PostsService, CloudinaryService],
})
export class PostsModule {}

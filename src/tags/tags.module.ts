import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { tagSchema } from '../../models/tag';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Tag', schema: tagSchema }])],
  controllers: [TagsController],
  providers: [TagsService],
  // Remove the exports array since it's not needed and causes the issue
})
export class TagsModule {}

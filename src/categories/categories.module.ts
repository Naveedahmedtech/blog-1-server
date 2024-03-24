import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { categorySchema } from '../../models/category';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Category', schema: categorySchema }])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}

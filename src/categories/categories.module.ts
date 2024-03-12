import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoriesController } from './categories.controller';

@Module({
  exports: [],
  controllers: [CategoriesController],
  providers: [CategoriesService, PrismaService],
})
  
export class CategoriesModule {}

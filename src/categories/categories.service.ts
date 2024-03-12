import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddTags } from './dto/tags.dto';
import { commonResponse, createApiResponse } from 'src/utils/commonResponse.utli';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);
  constructor(private prisma: PrismaService) {}
  async add(body: AddTags) {
    const { name } = body;
    try {
      const existingTag = await this.prisma.categories.findUnique({
        where: { name: name },
      });

      if (existingTag) {
        throw new ConflictException('Tag with this name already exists.');
      }

      // If tag doesn't exist, create a new one
      const newTag = await this.prisma.categories.create({
        data: { name: name },
      });
      return createApiResponse(201, 'categories added successfully', newTag);
    } catch (error) {
      this.logger.error(`Error adding tag: ${error.message}`);
      throw new InternalServerErrorException(`${error.message}`);
    }
  }

  async getAll() {
    try {
      const tags = await this.prisma.categories.findMany({});
      return createApiResponse(201, 'categories retrieved successfully', tags);
    } catch (error) {
      this.logger.error(`Error adding tag: ${error.message}`);
      throw new InternalServerErrorException(`${error.message}`);
    }
  }
}

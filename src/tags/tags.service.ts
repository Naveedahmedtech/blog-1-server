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
export class TagsService {
  private readonly logger = new Logger(TagsService.name);
  constructor(private prisma: PrismaService) {}
  async add(body: AddTags) {
    const { name } = body;
    try {
      const existingTag = await this.prisma.tags.findUnique({
        where: { name: name },
      });

      if (existingTag) {
        throw new ConflictException('Tag with this name already exists.');
      }

      // If tag doesn't exist, create a new one
      const newTag = await this.prisma.tags.create({
        data: { name: '#' + name },
      });
      return createApiResponse(201, 'Tag added successfully', newTag);
    } catch (error) {
      this.logger.error(`Error adding tag: ${error.message}`);
      throw new InternalServerErrorException(`${error.message}`);
    }
  }

  async getAll() {
    try {
      const tags = await this.prisma.tags.findMany({});
      return createApiResponse(201, 'Tag retrieved successfully', tags);
    } catch (error) {
      this.logger.error(`Error adding tag: ${error.message}`);
      throw new InternalServerErrorException(`${error.message}`);
    }
  }
}

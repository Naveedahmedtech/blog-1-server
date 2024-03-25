import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AddTags } from './dto/tags.dto';
import { createApiResponse } from '../utils/commonResponse.utli';

@Injectable()
export class TagsService {
  private readonly logger = new Logger(TagsService.name);

  constructor(@InjectModel('Tag') private tagModel) {}

  async add(body: AddTags) {
    const { name } = body;
    try {
      const existingTag = await this.tagModel
        .findOne({ name: '#' + name })
        .exec();

      if (existingTag) {
        throw new ConflictException('Tag with this name already exists.');
      }

      const newTag = new this.tagModel({ name: '#' + name });
      await newTag.save();

      return createApiResponse(201, 'Tag added successfully', newTag);
    } catch (error) {
      this.logger.error(`Error adding tag: ${error.message}`);
      throw new InternalServerErrorException(`${error.message}`);
    }
  }

  async getAll() {
    try {
      const tags = await this.tagModel.find({}).exec();
      return createApiResponse(200, 'Tags retrieved successfully', tags); // Note the status code change to 200 for successful retrieval
    } catch (error) {
      this.logger.error(`Error retrieving tags: ${error.message}`);
      throw new InternalServerErrorException(`${error.message}`);
    }
  }
}

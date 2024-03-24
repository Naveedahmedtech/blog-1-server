import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createApiResponse } from 'src/utils/commonResponse.utli';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectModel('Category')
    private categoryModel,
  ) {}

  async add(body: any): Promise<any> {
    const { name } = body;
    try {
      const existingCategory = await this.categoryModel
        .findOne({ name })
        .exec();

      if (existingCategory) {
        throw new ConflictException('Category with this name already exists.');
      }

      const newCategory = new this.categoryModel({ name });
      await newCategory.save();

      return createApiResponse(201, 'Category added successfully', newCategory);
    } catch (error) {
      this.logger.error(`Error adding category: ${error.message}`);
      throw new InternalServerErrorException(`${error.message}`);
    }
  }

  async getAll(): Promise<any> {
    try {
      const categories = await this.categoryModel.find().exec();
      return createApiResponse(
        200,
        'Categories retrieved successfully',
        categories,
      ); // Note: Changed status code to 200 for successful retrieval
    } catch (error) {
      this.logger.error(`Error retrieving categories: ${error.message}`);
      throw new InternalServerErrorException(`${error.message}`);
    }
  }
}

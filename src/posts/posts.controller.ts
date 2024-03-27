import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { diskStorage } from 'multer';
import * as cloudinary from 'cloudinary';
import { extname } from 'path';
import * as streamifier from 'streamifier';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly configService: ConfigService,
  ) {
    cloudinary.v2.config({
      cloud_name: this.configService.get<string>('cloudinary_name'),
      api_key: this.configService.get<string>('cloudinary_api_key'),
      api_secret: this.configService.get<string>('cloudinary_secret'),
    });
  }

  @Post('add')
  @UseInterceptors(FileInterceptor('image'))
  async add(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    if (!file) {
      throw new BadRequestException('An image file is required');
    }

    let tagIds = [];
    try {
      if (body.tagIds && typeof body.tagIds === 'string') {
        tagIds = JSON.parse(body.tagIds);
      }
    } catch (error) {
      throw new BadRequestException('tagIds must be a valid JSON array string');
    }

    try {
      // Adjusted upload process for handling buffer
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.v2.uploader.upload_stream(
          { resource_type: 'auto', folder: 'blog_v1/posts' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });

      const postData = {
        ...body,
        tagIds,
      };

      // Call your service layer to save the post data
      return this.postsService.add(postData, result?.secure_url);
    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      throw new BadRequestException('Failed to upload image');
    }
  }

  @Put('update')
  @UseInterceptors(FileInterceptor('image'))
  async update(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    let tagIds = [];
    try {
      if (body.tagIds && typeof body.tagIds === 'string') {
        tagIds = JSON.parse(body.tagIds);
      }
    } catch (error) {
      throw new BadRequestException('tagIds must be a valid JSON array string');
    }

    // Default to existing image URL if provided, otherwise upload new image
    let imageUrl = body.image;

    if (file) {
      try {
        // Adjusted upload process for handling buffer
        const result = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.v2.uploader.upload_stream(
            { resource_type: 'auto', folder: 'blog_v1/posts' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          );

          streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });

        imageUrl = result.secure_url;
      } catch (error) {
        console.error('Cloudinary upload failed:', error);
        throw new BadRequestException('Failed to upload image');
      }
    }

    // Include the resolved imageUrl (either newly uploaded or existing) in postData
    const postData = {
      ...body,
      tagIds,
      image: imageUrl,
    };

    return this.postsService.update(postData);
  }

  @Get('get-all')
  async getAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: string = '-1',
    @Query('categoryId') categoryId: string,
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const sortOrderNumber = sortOrder === '-1' ? -1 : 1;

    return this.postsService.getAll({
      page: pageNumber,
      limit: limitNumber,
      sortBy,
      sortOrder: sortOrderNumber,
      categoryId,
    });
  }

  @Get('get-trending')
  async getTrendingPosts(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: string = '-1',
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const sortOrderNumber = sortOrder === '-1' ? -1 : 1;

    return this.postsService.getTrendingPosts({
      page: pageNumber,
      limit: limitNumber,
      sortBy,
      sortOrder: sortOrderNumber,
    });
  }

  @Get('get/:id')
  async getById(@Param('id') id: string) {
    return this.postsService.getById(id);
  }

  @Get('get-by-author/:author_id')
  async getAllByAuthor(
    @Param('author_id') authorId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: string = '-1',
    @Query('categoryId') categoryId: string,
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const sortOrderNumber = sortOrder === '-1' ? -1 : 1;
    return this.postsService.getAllByAuthor(authorId, {
      page: pageNumber,
      limit: limitNumber,
      sortBy,
      sortOrder: sortOrderNumber,
      categoryId,
    });
  }

  @Get('get-by-category/:category_id')
  async getByCategoryId(@Param('category_id') categoryId: string) {
    return this.postsService.getByCategoryId(categoryId);
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    return this.postsService.delete(id);
  }
}

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
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {
  }

  @Post('add')
  @UseInterceptors(FileInterceptor('image'))
  async add(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    if (!file) throw new BadRequestException('An image file is required');

    let tagIds = [];
    try {
      if (body.tagIds && typeof body.tagIds === 'string') {
        tagIds = JSON.parse(body.tagIds);
      }
    } catch (error) {
      throw new BadRequestException('tagIds must be a valid JSON array string');
    }

    try {
      const { url, publicId } = (await this.cloudinaryService.uploadImage(
        file.buffer,
      )) as any;
      const postData = { ...body, tagIds, imageUrl: url, imageId: publicId };
      return this.postsService.add(postData);
    } catch (error) {
      console.log("Error uploading image", error);
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

    let imageUrl = body?.imageUrl;
    let imageId = body?.imageId;

    if (file) {
      let deleteImage: any;
      try {
        if (imageId) {
          deleteImage = await this.cloudinaryService.deleteImage(imageId);
        }

        console.log(deleteImage?.success);

        if (deleteImage?.success) {
          const uploadResult = await this.cloudinaryService.uploadImage(
            file.buffer,
          );
          imageUrl = uploadResult.url;
          imageId = uploadResult.publicId;
        }
      } catch (error) {
        console.log(error);
        throw new BadRequestException(
          'Failed to process image upload or deletion.',
        );
      }
    }

    const postData = { ...body, tagIds, imageUrl, imageId };

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

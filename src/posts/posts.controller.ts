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
import { AddPostsDto } from './dto/posts.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';

// Configure storage
const storage = diskStorage({
  destination: './uploads', // Directory where files should be stored
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = extname(file.originalname);
    callback(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  },
});
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}
  @Post('add')
  @UseInterceptors(FileInterceptor('image', { storage: storage }))
  async add(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    if (!file || !file.filename) {
      throw new BadRequestException('An image file is required');
    }
    let tagIds = [];
    try {
      // Attempt to parse `tagIds` if it's provided and is a string
      if (body.tagIds && typeof body.tagIds === 'string') {
        tagIds = JSON.parse(body.tagIds);
      }
    } catch (error) {
      throw new BadRequestException('tagIds must be a valid JSON array string');
    }
    const postData = {
      ...body,
      tagIds,
    };

    return this.postsService.add(postData, file.filename);
  }

  @Put('update')
  @UseInterceptors(FileInterceptor('image', { storage: storage }))
  async update(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    let tagIds = [];
    try {
      if (body.tagIds && typeof body.tagIds === 'string') {
        tagIds = JSON.parse(body.tagIds);
      }
    } catch (error) {
      throw new BadRequestException('tagIds must be a valid JSON array string');
    }

    const image = body.image ? body.image : file.filename;

    const postData = {
      ...body,
      tagIds,
      image,
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

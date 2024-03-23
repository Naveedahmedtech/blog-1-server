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
  async register(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
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
      image: file.filename,
    };

    return this.postsService.add(postData);
  }

  @Get('get-all')
  async getAll() {
    return this.postsService.getAll();
  }

  @Get('get/:id')
  async getById(@Param('id') id: string) {
    return this.postsService.getById(id);
  }

  @Get('get-by-author/:author_id')
  async getAllByAuthor(@Param('author_id') authorId: string) {
    return this.postsService.getAllByAuthor(authorId);
  }

  @Get('get-by-category/:category_id')
  async getByCategoryId(@Param('category_id') categoryId: string) {
    return this.postsService.getByCategoryId(categoryId);
  }
}

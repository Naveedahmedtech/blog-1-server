import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { AddPostsDto } from './dto/posts.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly tagsService: PostsService) {}
  @Post('add')
  async register(@Body() body: AddPostsDto) {
    return this.tagsService.add(body);
  }

  @Get('get-all')
  async getAll() {
    return this.tagsService.getAll();
  }
  @Get('get-by-category/:category_id')
  async getByCategoryId(@Param('category_id') categoryId:string) {
    return this.tagsService.getByCategoryId(categoryId);
  }
}

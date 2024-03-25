import { Body, Controller, Get, Post } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { AddTags } from './dto/tags.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly tagsService: CategoriesService) {}
  @Post('add')
  async register(@Body() body: AddTags) {
    return this.tagsService.add(body);
  }

  @Get('get-all')
  async getAll() {
    return this.tagsService.getAll();
  }
}

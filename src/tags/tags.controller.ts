
import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { TagsService } from './tags.service';
import { AddTags } from './dto/tags.dto';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}
  @Post('add')
  async register(@Body() body: AddTags) {
    return this.tagsService.add(body);
  }

  @Get('get-all')
  async getAll() { 
    return this.tagsService.getAll();
  }

}

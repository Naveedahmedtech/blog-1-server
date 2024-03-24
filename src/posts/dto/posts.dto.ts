import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddPostsDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  authorId: string;

  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagIds: string[];

}

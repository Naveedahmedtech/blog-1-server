import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsMongoId,
  IsUrl,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

export class AddPostsDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  image?: string;

  @IsMongoId()
  @IsNotEmpty()
  authorId: string;

  @IsMongoId()
  @IsNotEmpty()
  categoryId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  tagIds: string[];
}

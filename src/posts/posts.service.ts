import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AddPostsDto } from './dto/posts.dto';
import { createApiResponse } from 'src/utils/commonResponse.utli';
import { InjectModel } from '@nestjs/mongoose';
import { paginateAndSort } from 'src/utils/pagination.util';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    @InjectModel('Post') private postModel,
    @InjectModel('Tag') private tagModel,
  ) {}

  async add(body: AddPostsDto, imageFilename: string) {
    const { title, description, authorId, categoryId, tagIds } = body;
    try {
      const existingPost = await this.postModel.findOne({ title }).exec();
      if (existingPost) {
        throw new ConflictException(
          'A post with the provided title already exists.',
        );
      }

      console.log(tagIds); // Should be an array of ObjectId strings
      for (const tagId of tagIds) {
        const tagExists = await this.tagModel.findById(tagId).exec();
        if (!tagExists) {
          throw new NotFoundException(`Tag with ID ${tagId} not found`);
        }
      }

      const newPost = await this.postModel.create({
        title,
        description,
        image: imageFilename,
        authorId,
        categoryId,
        tags: tagIds, // Directly assigning an array of tagIds
      });

      return createApiResponse(201, 'Post added successfully', newPost);
    } catch (error) {
      this.logger.error(`Error adding post: ${error}`);
      throw new InternalServerErrorException('Failed to add the post');
    }
  }

  async update(body: any) {
    const { id, title, description, image, categoryId, tagIds } = body;

    const post = await this.postModel.findById(id).exec();
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Check if the title is being updated to a new value and if that new title already exists in another post
    if (title && title !== post.title) {
      const existingTitlePost = await this.postModel.findOne({ title }).exec();
      if (existingTitlePost) {
        throw new ConflictException(
          'A post with the provided title already exists.',
        );
      }
    }

    // Verify the existence of each tagId, if tagIds are provided
    if (tagIds && Array.isArray(tagIds)) {
      for (const tagId of tagIds) {
        const tagExists = await this.tagModel.findById(tagId).exec();
        if (!tagExists) {
          throw new NotFoundException(`Tag with ID ${tagId} not found`);
        }
      }
    }

    // Build the update object dynamically
    const updateObj: any = {};
    if (title) updateObj.title = title;
    if (description) updateObj.description = description;
    if (image) updateObj.image = image;
    if (categoryId) updateObj.categoryId = categoryId;
    if (tagIds) updateObj.tags = tagIds;

    try {
      const updatedPost = await this.postModel
        .findByIdAndUpdate(id, updateObj, { new: true })
        .exec();
      return createApiResponse(200, 'Post updated successfully', updatedPost);
    } catch (error) {
      this.logger.error(`Error updating post: ${error}`);
      throw new InternalServerErrorException('Failed to update the post');
    }
  }

  async getAll(queryParams) {
    const { page, limit, sortBy, sortOrder, categoryId } = queryParams;

    const populateOptions = ['authorId', 'categoryId', 'tags'];

    let filter = {} as any;
    if (categoryId) {
      filter.categoryId = categoryId;
    }

    try {
      const result = await paginateAndSort(
        this.postModel,
        { page, limit, sortBy, sortOrder, filter },
        populateOptions,
      );

      return createApiResponse(200, 'Posts retrieved successfully', result);
    } catch (error) {
      this.logger.error(`Error retrieving posts: ${error.message}`);
      throw new InternalServerErrorException(`Failed to retrieve posts`);
    }
  }

  // async getAll(queryParams) {
  //   const { page, limit, sortBy, sortOrder, categoryId } = queryParams;

  //   const populateOptions = ['authorId', 'categoryId', 'tags'];

  //   let filter = {} as any;
  //   if (categoryId) {
  //     filter.categoryId = categoryId;
  //   }

  //   try {
  //     const result = await paginateAndSort(
  //       this.postModel,
  //       {
  //         page,
  //         limit,
  //         sortBy,
  //         sortOrder,
  //         filter,
  //       },
  //       populateOptions,
  //     );

  //     return createApiResponse(200, 'Posts retrieved successfully', result);
  //   } catch (error) {
  //     this.logger.error(`Error retrieving posts: ${error.message}`);
  //     throw new InternalServerErrorException(`Failed to retrieve posts`);
  //   }
  // }

  async getAllByAuthor(authorId: string, queryParams) {
    const { page, limit, sortBy, sortOrder, categoryId } = queryParams;

    try {
      const populateOptions = ['authorId', 'categoryId', 'tags'];
      let filter = { authorId } as any;
      if (categoryId) {
        filter.categoryId = categoryId;
      }
      const result = await paginateAndSort(
        this.postModel,
        {
          page,
          limit,
          sortBy,
          sortOrder,
          filter,
        },
        populateOptions,
      );

      return createApiResponse(200, 'Posts retrieved successfully', result);
    } catch (error) {
      this.logger.error(`Error retrieving posts by author: ${error.message}`);
      throw new InternalServerErrorException(
        `Failed to retrieve posts by author`,
      );
    }
  }

  async getById(id: string) {
    try {
      const postById = await this.postModel
        .findById(id)
        .populate('authorId') // Assuming the authorId references the Author model
        .populate('categoryId') // Assuming the categoryId references the Category model
        .populate('tags') // Directly populates the array of tags
        .exec();

      if (!postById) {
        throw new NotFoundException(`Post with ID ${id} not found.`);
      }

      return createApiResponse(200, 'Post retrieved successfully', postById);
    } catch (error) {
      this.logger.error(`Error retrieving post by ID ${id}: ${error.message}`);
      throw new InternalServerErrorException(`Failed to retrieve post`);
    }
  }

  async getByCategoryId(categoryId: string) {
    try {
      const posts = await this.postModel
        .find({ categoryId }) // Find posts by authorId
        .populate('authorId') // Populates author details, adjust the field if necessary
        .populate('categoryId') // Populates category details, adjust the field if necessary
        .populate('tags') // Correctly populates the array of tags
        .sort({ createdAt: -1 })
        .exec(); // Executes the query

      return createApiResponse(
        200,
        'Posts retrieved successfully by author',
        posts,
      );
    } catch (error) {
      this.logger.error(`Error retrieving posts by author: ${error.message}`);
      throw new InternalServerErrorException(
        `Failed to retrieve posts by author`,
      );
    }
  }

  async getTrendingPosts(queryParams) {
    const { page = 1, limit = 10 } = queryParams;

    // First, find the ID of the "trending" tag
    const trendingTag = await this.tagModel
      .findOne({ name: '#trending' })
      .exec();
    if (!trendingTag) {
      throw new NotFoundException('Trending tag not found');
    }

    const filter = {
      tags: trendingTag._id, // Filter posts that include the "trending" tag ID
    };

    const populateOptions = ['authorId', 'categoryId', 'tags'];

    try {
      const result = await paginateAndSort(
        this.postModel,
        {
          page,
          limit,
          sortBy: 'createdAt', // You can adjust this based on your needs
          sortOrder: -1, // Sorting by the newest posts first
          filter,
        },
        populateOptions,
      );

      return createApiResponse(
        200,
        'Trending posts retrieved successfully',
        result,
      );
    } catch (error) {
      this.logger.error(`Error retrieving trending posts: ${error.message}`);
      throw new InternalServerErrorException(
        `Failed to retrieve trending posts`,
      );
    }
  }

  async delete(id: string) {
    const post = await this.postModel.findById(id).exec();
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    try {
      await this.postModel.findByIdAndDelete(id).exec();
      return createApiResponse(200, 'Post deleted successfully', {});
    } catch (error) {
      this.logger.error(`Error deleting post: ${error}`);
      throw new InternalServerErrorException('Failed to delete the post');
    }
  }
}

import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddPostsDto } from './dto/posts.dto';
import {
  commonResponse,
  createApiResponse,
} from 'src/utils/commonResponse.utli';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);
  constructor(private prisma: PrismaService) {}
  async add(body: AddPostsDto) {
    const { title, description, image, authorId, categoryId, tagIds } = body;

    console.log(body);

    try {
      const newPost = await this.prisma.posts.create({
        data: {
          title,
          description,
          image,
          author: { connect: { id: authorId } },
          category: { connect: { id: categoryId } },
        },
      });

      // Now, for each tagId, create an entry in the PostTags join table
      await Promise.all(
        tagIds.map((tagId) =>
          this.prisma.postTags.create({
            data: {
              post: { connect: { id: newPost.id } },
              tag: { connect: { id: tagId } },
            },
          }),
        ),
      );

      // Optionally, return the new post with its tags loaded
      const post = await this.prisma.posts.findUnique({
        where: { id: newPost.id },
        include: {
          tags: {
            include: {
              tag: true, // Adjust based on how you want to include related data
            },
          },
        },
      });

      return createApiResponse(201, 'Post added successfully', post);
    } catch (error) {
      this.logger.error(`Error adding post: ${error.message}`);

      // Specific error handling can be implemented here based on Prisma error codes
      if (error.code === 'P2002') {
        throw new ConflictException(
          'A post with the provided title already exists',
        );
      }

      throw new InternalServerErrorException('Failed to add the post');
    }
  }

  async getAll() {
    try {
      const tags = await this.prisma.posts.findMany({
        include: {
          author: true, // Assuming you want all fields from the author
          category: true, // Assuming you want all fields from the category
          tags: {
            include: {
              tag: true, // Fetches details for each tag associated with the post
            },
          },
        },
      });
      return createApiResponse(201, 'posts retrieved successfully', tags);
    } catch (error) {
      this.logger.error(`Error adding tag: ${error.message}`);
      throw new InternalServerErrorException(`${error.message}`);
    }
  }

  async getAllByAuthor(authorId: string) {
    console.log(authorId);
    try {
      const posts = await this.prisma.posts.findMany({
        where: {
          authorId: authorId
        },
        include: {
          author: true, // Assuming you want all fields from the author
          category: true, // Assuming you want all fields from the category
          tags: {
            include: {
              tag: true, // Fetches details for each tag associated with the post
            },
          },
        },
      });
      return createApiResponse(201, 'posts retrieved successfully', posts);
    } catch (error) {
      this.logger.error(`Error adding tag: ${error.message}`);
      throw new InternalServerErrorException(`${error.message}`);
    }
  }

  async getById(id: string) {
    try {
      const postsById = await this.prisma.posts.findUnique({
        where: {
          id: id,
        },
        include: {
          author: true, // Include all fields from the author
          category: true, // Include all fields from the category
          tags: {
            include: {
              tag: true, // Include details for each tag associated with the post
            },
          },
        },
      });
      return createApiResponse(200, 'Post retrieved successfully', postsById);
    } catch (error) {
      this.logger.error(
        `Error retrieving posts by category ID ${id}: ${error.message}`,
      );
      throw new InternalServerErrorException(`${error.message}`);
    }
  }

  async getByCategoryId(categoryId: string) {
    try {
      const postsByCategory = await this.prisma.posts.findMany({
        where: {
          categoryId: categoryId, // Filter posts by categoryId
        },
        include: {
          author: true, // Include all fields from the author
          category: true, // Include all fields from the category
          tags: {
            include: {
              tag: true, // Include details for each tag associated with the post
            },
          },
        },
      });
      return createApiResponse(
        200,
        'Posts retrieved successfully',
        postsByCategory,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving posts by category ID ${categoryId}: ${error.message}`,
      );
      throw new InternalServerErrorException(`${error.message}`);
    }
  }
}

import { Injectable } from '@nestjs/common';
import * as cloudinary from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.v2.config({
      cloud_name: this.configService.get<string>('cloudinary_name'),
      api_key: this.configService.get<string>('cloudinary_api_key'),
      api_secret: this.configService.get<string>('cloudinary_secret'),
    });
  }

  async uploadImage(
    fileBuffer: Buffer,
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        { resource_type: 'auto', folder: 'blog_v1/posts' },
        (error, result) => {
          if (error) reject(error);
          else resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  }
  async deleteImage(publicId: string): Promise<any> {
    console.log('deleteImage: ', publicId);
    return new Promise((resolve, reject) => {
      cloudinary.v2.uploader.destroy(
        publicId,
        { invalidate: true },
        (error, result) => {
          if (error) reject(error);
          else resolve({ result, success: true });
        },
      );
    });
  }
}

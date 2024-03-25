import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { UserDocument } from 'models/UserModal';

// ! user registration
/**
 * Recaptacha Validation
 * @param token
 * @param configService
 * @returns
 */
export const validateRecaptcha = async (
  token: string,
  configService: ConfigService,
): Promise<boolean> => {
  const secretKey = configService.get<string>('recaptcha_secret_key');
  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: secretKey,
          response: token,
        },
      },
    );
    return response.data.success && response.data.score > 0.5;
  } catch {
    return false;
  }
};

/**
 * checking for existing usre
 * @param prisma
 * @param email
 * @param username
 */
export async function checkForExistingUser(
  userModel: Model<UserDocument>,
  email: string,
  username: string,
): Promise<void> {
  // Use Mongoose to check for an existing user by email or username
  const existingUser = await userModel.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new ConflictException(
      'A user with the given email or username already exists',
    );
  }
}

/**
 * Hashing password
 * @param password
 * @returns
 */

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// ! user login
export const comparePassword = async (loginDto: any, hashedPassword: any) => {
  const password = await bcrypt.compare(loginDto, hashedPassword);
  return password;
};

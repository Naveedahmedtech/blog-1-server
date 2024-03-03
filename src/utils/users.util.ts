import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../auth/dto/user.dto';
import { Users } from '@prisma/client';

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
export const checkForExistingUser = async (
  prisma: PrismaService,
  email: string,
  username: string,
): Promise<void> => {
  const existEmail = await prisma.users.findUnique({
    where: { email: email },
  });
  const existUsername = await prisma.users.findUnique({
    where: { username: username },
  });
  if (existEmail) throw new ConflictException('Email already registered');
  if (existUsername) throw new ConflictException('Username already taken');
};

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
export const comparePassword = async (loginDto: LoginDto, user: Users) => {
  const password = await bcrypt.compare(
    loginDto.hashedPassword,
    user.hashedPassword,
  );
  return password;
};

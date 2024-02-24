import {
  IsString,
  IsNumber,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  Matches,
  IsDate,
  IsBoolean,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain alphabets, numbers, and underscores.',
  })
  username: string;

  @IsString()
  @IsOptional()
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
    message:
      'Password must be at least eight characters long, containing at least one letter and one number.',
  })
  hashedPassword: string;

  @IsString()
  @IsOptional()
  avatar: string;

  @IsString()
  @IsOptional()
  bio: string;

  @IsString()
  @IsOptional()
  role: string;

  @IsString()
  @IsOptional()
  lastLogin: string;

  @IsDate()
  @IsOptional()
  createdAt: string;

  @IsDate()
  @IsOptional()
  updatedAt: string;

  @IsString()
  @IsOptional()
  emailToken: string;

  @IsString()
  @IsOptional()
  refreshToken: string;

  @IsString()
  @IsOptional()
  resetToken: string;

  @IsString()
  @IsOptional()
  resetTokenExpiry: string;

  @IsBoolean()
  @IsOptional()
  emailVerified: boolean;

  @IsOptional()
  captchaToken: any;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  hashedPassword: string;
}

export interface RequestMetaData {
  isForwarded: string;
  userAgent: string;
}

export interface LogLoginActivityParams {
  user: {
    id: string;
  };
  result: string;
  metaData: RequestMetaData;
  reason?: string;
  sessionId?: string;
}

export interface SuccessResponse<T = unknown> {
  status: number;
  message: string;
  result?: T;
}

export interface LoginResponse {
  username: string;
  email: string;
  accessToken: string;
}

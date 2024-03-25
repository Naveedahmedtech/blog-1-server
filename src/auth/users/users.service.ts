import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  comparePassword,
  hashPassword,
} from '../../utils/users.util';
import * as crypto from 'crypto';
import { commonResponse } from '../../utils/commonResponse.utli';
import { UsersConstants } from '../constants/users.constants';
import { UserDocument } from '../../../models/UserModal';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private userModel: Model<UserDocument>,
    @InjectModel('LoginActivity')
    private loginActivityModel,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: any): Promise<any> {
    try {
      const { username, email, password } = registerDto;

      // Check for existing user by email or username
      const existingUser = await this.userModel.findOne({
        $or: [{ email }, { username }],
      });
      if (existingUser) {
        if (existingUser.email === email) {
          throw new ConflictException(
            'An account with this email already exists.',
          );
        } else if (existingUser.username === username) {
          throw new ConflictException('This username is already taken.');
        }
      }

      // Hash the password
      const hashedPassword = await hashPassword(password); // Ensure you have a utility function to hash passwords

      // Generate email verification token
      const bytes = UsersConstants.VERIFICATION_TOKEN_BYTES;
      const tokenExpiryDuration = UsersConstants.RESEND_RATE_LIMIT;
      const verificationToken = crypto.randomBytes(bytes).toString('hex');
      const tokenExpiry = new Date();
      tokenExpiry.setHours(tokenExpiry.getHours() + tokenExpiryDuration);

      // Create the new user
      const newUser = await this.userModel.create({
        ...registerDto,
        hashedPassword,
        emailVerified: false,
        role: 'USER',
        emailToken: verificationToken,
        emailTokenExpiry: tokenExpiry,
      });

      // Optionally, send an email verification link here

      return commonResponse<string>(
        201,
        'User registered successfully. Please check your email to verify your account.',
      );
    } catch (error) {
      console.error(`Registration error: ${error.message}`);

      if (error.code === 11000) {
        throw new ConflictException('The user already exists.'); // This is a more generic message for duplicate key errors
      } else {
        // For other errors, consider returning a generic error message to the client to avoid exposing sensitive details
        throw new BadRequestException(error.message);
      }
    }
  }

  // login
  async logLoginActivity(params: any): Promise<void> {
    const { user, result, metaData, reason = null, sessionId = null } = params;

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    await this.loginActivityModel.create({
      userId: user._id,
      ipAddress: metaData.ipAddress, // Assuming you have corrected the isForwarded to ipAddress or similar
      userAgent: metaData.userAgent,
      result,
      reason,
      sessionId,
    });
  }

  async login(loginDto: any, metaData: any): Promise<any> {
    try {
      const { email, password } = loginDto;

      const user = await this.userModel.findOne({ email }).exec();
      if (!user) {
        throw new NotFoundException('User not found.');
      }

      const passwordMatch = await comparePassword(
        password,
        user.hashedPassword,
      );
      if (!passwordMatch) {
        throw new UnauthorizedException('Invalid credentials.');
      }

      const sessionId = uuidv4();
      const payload = { sub: user._id, username: user.username };
      const accessToken = await this.jwtService.signAsync(payload);

      // Log login activity and return login response
      await this.logLoginActivity({
        user,
        result: 'Success',
        metaData,
        sessionId,
      });

      return commonResponse(200, 'Login successfully!', {
        username: user.username,
        email: user.email,
        accessToken,
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message);
    }
  }

  async updateUsername(body: any): Promise<any> {
    const { id, newUsername } = body;
    try {
      const existingUser = await this.userModel.findOne({
        username: newUsername,
      });
      if (existingUser) {
        throw new ConflictException('This username is already taken.');
      }

      const updatedUser = await this.userModel.findByIdAndUpdate(
        id,
        { $set: { username: newUsername } },
        { new: true },
      );

      if (!updatedUser) {
        throw new NotFoundException('User not found.');
      }

      // Assuming you have a method to regenerate the token
      const newToken = this.jwtService.sign({
        sub: updatedUser.id,
        username: newUsername,
      });

      return {
        statusCode: 200,
        message: 'Username updated successfully.',
        // updatedUser,
        token: newToken, // Return the new token in the response
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new BadRequestException('Username already in use!');
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException('User not found!');
      }
      console.error(`Username update error: ${error.message}`);

      throw new BadRequestException(
        'Unable to update username due to a processing error.',
      );
    }
  }

  async changePassword(changePasswordDto: {
    id: string;
    oldPassword: string;
    newPassword: string;
  }): Promise<any> {
    const { id, oldPassword, newPassword } = changePasswordDto;

    try {
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isMatch = await comparePassword(oldPassword, user.hashedPassword);
      if (!isMatch) {
        throw new BadRequestException('Old password does not match');
      }

      const hashedNewPassword = await hashPassword(newPassword);

      user.hashedPassword = hashedNewPassword;
      await user.save();

      return { statusCode: 200, message: 'Password changed successfully' };
    } catch (error) {
      console.log(error);

      throw new BadRequestException(
        'Unable to update password due to a processing error.',
      );
    }
  }
}

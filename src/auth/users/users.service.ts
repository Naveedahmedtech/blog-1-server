import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole, Users } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from '../../lib/sendMail';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  checkForExistingUser,
  comparePassword,
  hashPassword,
  validateRecaptcha,
} from '../../utils/users.util';
import {
  LogLoginActivityParams,
  LoginDto,
  LoginResponse,
  RegisterDto,
  RequestMetaData,
} from '../dto/user.dto';
import * as crypto from 'crypto';
import { commonResponse } from '../../utils/commonResponse.utli';
import { Logger } from '@nestjs/common';
import { UsersConstants } from '../constants/users.constants';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  /**
   * register user
   * @param registerDto
   * @returns
   */
  async register(registerDto: RegisterDto) {
    try {
      const {
        username,
        email,
        hashedPassword: password,
        ...args
      } = registerDto;

      // Check for Existing User
      await checkForExistingUser(this.prisma, email, username);

      // hash password
      const hashedPassword = await hashPassword(password);

      // const isValidCaptcha = await validateRecaptcha(
      //   registerDto.captchaToken,
      //   this.configService,
      // );

      // if (!isValidCaptcha) {
      //   throw new ConflictException('Invalid reCAPTCHA token.');
      // }

      const bytes = UsersConstants.VERIFICATION_TOKEN_BYTES;
      const magicNumber = UsersConstants.RESEND_RATE_LIMIT;

      const verificationToken = crypto.randomBytes(bytes).toString('hex');
      const tokenExpiry = new Date();
      tokenExpiry.setHours(tokenExpiry.getHours() + magicNumber);
      // this.emailService.sendVerificationEmail(
      //   username,
      //   email,
      //   verificationToken,
      // );

      await this.prisma.users.create({
        data: {
          ...registerDto,
          hashedPassword: hashedPassword,
          emailVerified: false,
          role: args.role as UserRole,
          emailToken: verificationToken,
          emailTokenExpiry: tokenExpiry,
        },
      });

      return commonResponse<string>(
        201,
        'Please verify your email to continue',
      );
    } catch (error) {
      this.logger.error(`Registration error: ${error.message}`);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(`${error.message}`);
    }
  }

  /**
   * Resend Email
   * @param email
   * @returns
   */
  async resendVerificationEmail(email: string) {
    try {
      const user = await this.prisma.users.findUnique({
        where: { email: email },
      });
      if (!user) {
        throw new ConflictException('User with this email does not exist.');
      }

      const bytes = UsersConstants.VERIFICATION_TOKEN_BYTES;
      const magicNumbers = UsersConstants.RESEND_RATE_LIMIT;

      const verificationToken = crypto.randomBytes(bytes).toString('hex');
      const emailTokenExpiry = new Date();
      emailTokenExpiry.setHours(emailTokenExpiry.getHours() + magicNumbers);

      // this.emailService.sendVerificationEmail(
      //   user.username,
      //   email,
      //   verificationToken,
      // );

      await this.prisma.users.update({
        where: { email: email },
        data: {
          emailToken: verificationToken,
          emailTokenExpiry: emailTokenExpiry,
        },
      });

      return commonResponse<string>(
        200,
        'Verification email resent successfully!',
      );
    } catch (error) {
      this.logger.error(`Error resending verification email: ${error.message}`);
      throw new InternalServerErrorException(`${error.message}`);
    }
  }

  /**
   * verify email
   * @param verification_token
   * @returns
   */
  async verifyEmail(verification_token: string) {
    try {
      const user = await this.prisma.users.findUnique({
        where: { emailToken: verification_token },
      });

      if (!user) {
        throw new ConflictException('Invalid or expired verification token.');
      }

      const now = new Date();
      if (user.emailTokenExpiry && user.emailTokenExpiry < now) {
        throw new ConflictException('Verification token has expired.');
      }

      await this.prisma.users.update({
        where: { emailToken: verification_token },
        data: { emailVerified: true, emailToken: '' },
      });

      return commonResponse<boolean>(200, 'Email verified successfully!', true);
    } catch (error) {
      this.logger.error(`Error while verifying email: ${error.message}`);
      throw new InternalServerErrorException(`${error.message}`);
    }
  }

  /**
   * login user
   * @param loginDto
   * @returns
   */

  async logLoginActivity(params: LogLoginActivityParams) {
    const { user, result, metaData, reason = null, sessionId = null } = params;

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    await this.prisma.loginActivity.create({
      data: {
        userId: user.id,
        ipAddress: metaData.isForwarded,
        userAgent: metaData.userAgent,
        result: result,
        reason: reason,
        sessionId: sessionId,
      },
    });
  }

  /**
   * login the user
   * @param loginDto
   * @param metaData
   * @returns
   */
  async login(loginDto: LoginDto, metaData: RequestMetaData) {
    try {
      const user = await this.prisma.users.findUnique({
        where: { email: loginDto.email },
      });
      if (!user) {
        this.logLoginActivity({
          user,
          result: 'Failed',
          reason: 'Invalid Email',
          metaData,
        });
        throw new NotFoundException('User not found.');
      }

      if (user.lockoutUntil && new Date() < user.lockoutUntil) {
        this.logLoginActivity({
          user,
          result: 'Failed',
          reason: 'Account locked',
          metaData,
        });
        throw new UnauthorizedException(
          'Account is locked due to multiple failed login attempts. Please try again later.',
        );
      }

      const password = await comparePassword(loginDto, user);

      if (!password) {
        // lock the account on multiple login attempts
        let newLoginAttempts = user.loginAttempts + 1;
        let newLockoutUntil = null;
        const totalLoginAttempts = UsersConstants.MAX_LOGIN_ATTEMPTS;
        const magicNumbers = UsersConstants.LOGIN_ACTIVITY_INTERVAL_MS;

        if (user.lockoutUntil && new Date() > user.lockoutUntil) {
          newLoginAttempts = 1;
        }

        if (newLoginAttempts >= totalLoginAttempts) {
          newLockoutUntil = new Date(Date.now() + magicNumbers);
        }

        await this.prisma.users.update({
          where: { email: loginDto.email },
          data: {
            loginAttempts: newLoginAttempts,
            lockoutUntil: newLockoutUntil,
          },
        });

        if (newLockoutUntil) {
          this.logLoginActivity({
            user,
            result: 'Failed',
            reason: 'Account locked after multiple attempts',
            metaData,
          });
          throw new UnauthorizedException(
            'Too many failed attempts. Your account has been locked for 10 minutes.',
          );
        }
        this.logLoginActivity({
          user,
          result: 'Failed',
          reason: 'Incorrect Password',
          metaData,
        });
        throw new NotFoundException('User not found.');
      }

      if (!user.emailVerified) {
        this.logLoginActivity({
          user,
          result: 'Failed',
          reason: 'Email not verified',
          metaData,
        });
        throw new ForbiddenException('Please verify your email!');
      }

      await this.prisma.users.update({
        where: { email: loginDto.email },
        data: {
          loginAttempts: 0,
        },
      });

      const sessionId = uuidv4();

      const payload = { sub: user.id, username: user.username };
      const accessToken = await this.jwtService.signAsync(payload);
      this.logLoginActivity({
        user,
        result: 'Success',
        metaData,
        reason: null,
        sessionId: sessionId,
      });

      return commonResponse<LoginResponse>(200, 'Login successfully!', {
        username: user.username,
        email: user.email,
        accessToken: accessToken,
      });
    } catch (error) {
      this.logger.error(`Error logging you in: ${error.message}`);
      throw new InternalServerErrorException(`${error.message}`);
    }
  }

  /**
   * forgot password
   * @param email
   */

  async forgotPassword(email: string) {
    try {
      const user = await this.prisma.users.findUnique({ where: { email } });
      if (!user) {
        throw new NotFoundException('User not found.');
      }

      const bytes = UsersConstants.VERIFICATION_TOKEN_BYTES;
      const magicNumbers = UsersConstants.FORGOT_PASSWORD_EXPIRY_MS;

      const resetToken = crypto.randomBytes(bytes).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + magicNumbers);

      await this.prisma.users.update({
        where: { email },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });
      // this.emailService.sendResetPasswordEmail(
      //   user.username,
      //   email,
      //   resetToken,
      // );
      return commonResponse<string>(
        200,
        'We have sent you the link on email to reset the password!',
      );
    } catch (error) {
      this.logger.error(
        `Error while sending the reset password email: ${error.message}`,
      );
      throw new InternalServerErrorException(`${error.message}`);
    }
  }

  /**
   * reset the password
   * @param token
   * @param password
   * @returns
   */

  async resetPassword(token: string, password: string) {
    try {
      const user = await this.prisma.users.findUnique({
        where: { resetToken: token },
      });
      if (!user) {
        throw new BadRequestException('Invalid token.');
      }

      if (new Date() > user.resetTokenExpiry) {
        throw new BadRequestException('Token has expired.');
      }

      const hashedPassword = await hashPassword(password);

      await this.prisma.users.update({
        where: { resetToken: token },
        data: {
          hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      return commonResponse<string>(200, 'Password reset successfully!');
    } catch (error) {
      this.logger.error(`Error while resetting the password: ${error.message}`);
      throw new InternalServerErrorException(`${error.message}`);
    }
  }

  /**
   * google login
   * @param user
   * @returns
   */
  async googleRedirect(user: Users) {
    try {
      const existingUser = await this.prisma.users.findUnique({
        where: { email: user.email },
      });

      if (existingUser) {
        const payload = { username: existingUser.email };
        const accessToken = await this.jwtService.signAsync(payload);

        return commonResponse<LoginResponse>(200, 'Login successfully!', {
          username: existingUser.username,
          email: existingUser.email,
          accessToken: accessToken,
        });
      } else {
        return commonResponse<string>(
          401,
          'User is not registered. Please register or use a different sign-in method.!',
        );
      }
    } catch (error) {
      this.logger.error(
        `Error while logging you with google: ${error.message}`,
      );
      throw new InternalServerErrorException(`${error.message}`);
    }
  }
}

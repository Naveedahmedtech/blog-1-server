import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Req,
  Res,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  LoginDto,
  LoginResponse,
  RegisterDto,
  RequestMetaData,
  SuccessResponse,
} from '../dto/user.dto';
import { IpAddress } from 'src/decorators/loginDecorator';
import { GoogleAuthGuard } from '../guard/google.guard';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.usersService.register(registerDto);
  }

  @Post('resend-email')
  async resendVerificationEmail(@Body('email') email: string) {
    return await this.usersService.resendVerificationEmail(email);
  }

  @Get('verify-email')
  async verifyEmail(@Query('verification_token') verification_token: string) {
    return await this.usersService.verifyEmail(verification_token);
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @IpAddress() metaData: RequestMetaData,
  ) {
    return await this.usersService.login(loginDto, metaData);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return await this.usersService.forgotPassword(email);
  }

  @Put('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    return await this.usersService.resetPassword(token, newPassword);
  }

  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  async googleLogin(@Req() req) {
    console.log(req.user);
    return {
      message: 'Google Auth Successful',
      user: req.user,
    };
  }
  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleRedirect(@Req() req, @Res() res) {
    const user = req.user;
    const response: SuccessResponse<LoginResponse | string> =
      await this.usersService.googleRedirect(user);

    if (response.status === 200) {
      if (
        typeof response.result === 'object' &&
        'accessToken' in response.result
      ) {
        return res.redirect(
          `${this.configService.get<string>('client_host')}/dashboard?token=${
            response.result.accessToken
          }`,
        );
      } else {
        throw new InternalServerErrorException(
          'Expected accessToken in response, but it was missing.',
        );
      }
    } else {
      return res.redirect(
        `${this.configService.get<string>('client_host')}/auth/login?error=${
          response.message
        }`,
      );
    }
  }
}

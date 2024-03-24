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
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  LoginDto,
  LoginResponse,
  RegisterDto,
  RequestMetaData,
  SuccessResponse,
} from '../dto/user.dto';
import { IpAddress } from '../../decorators/loginDecorator';
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
  async register(@Body() registerDto: any) {
    return this.usersService.register(registerDto);
  }


  @Post('login')
  async login(
    @Body() loginDto: any,
    @IpAddress() metaData: RequestMetaData,
  ) {
    return await this.usersService.login(loginDto, metaData);
  }
  @Patch('/users/update-username')
  async updateUsername(
    @Body() body: any,
  ) {
    return await this.usersService.updateUsername(body);
  }
  @Patch('/change-password')
  async changePassword(
    @Body() body: any,
  ) {
    return await this.usersService.changePassword(body);
  }
}

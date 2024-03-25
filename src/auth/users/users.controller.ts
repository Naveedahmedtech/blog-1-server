import {
  Controller,
  Post,
  Body,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  RequestMetaData,
} from '../dto/user.dto';
import { IpAddress } from '../../decorators/loginDecorator';
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

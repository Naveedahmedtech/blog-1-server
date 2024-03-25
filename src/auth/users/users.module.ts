import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtModule } from '@nestjs/jwt';
import { MongooseService } from 'src/prisma/connectiondb.service';
import { MongooseModule } from '@nestjs/mongoose';
import { userSchema } from '../../../models/userModal';
import { loginActivitySchema } from '../../../models/loginActivity';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: userSchema },
      { name: 'LoginActivity', schema: loginActivitySchema },
    ]),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'),
        signOptions: { expiresIn: 365 * 24 * 60 * 60 }, 
      }),
      inject: [ConfigService],
      imports: [ConfigModule],
    }),
  ],
  exports: [],
  controllers: [UsersController],
  providers: [UsersService, MongooseService],
})
export class UsersModule {}

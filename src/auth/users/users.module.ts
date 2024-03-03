import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../lib/sendMail';
import { JwtModule } from '@nestjs/jwt';
import { GoogleStrategy } from '../../lib/googleStrategy';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY!,
      signOptions: { expiresIn: 365 * 24 * 60 * 60 },
    }),
  ],
  exports: [],
  controllers: [UsersController],
  providers: [UsersService, PrismaService, EmailService, GoogleStrategy],
})
export class UsersModule {}
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Database connection established successfully.');
    } catch (error) {
      console.error('Failed to connect to the database:', error);
    }
  }
}

// import { Injectable, OnModuleInit } from '@nestjs/common';
// import { PrismaClient } from '@prisma/client';

// @Injectable()
// export class PrismaService extends PrismaClient implements OnModuleInit {
//   // async onModuleInit() {
//   //   await this.$connect();
//   // }
//   constructor() {
//     super({
//       log: ['query', 'info', 'warn', 'error'],
//     });
//   }
//   async onModuleInit() {
//     try {
//       await this.$connect();
//       console.log('Database connection established successfully.');
//     } catch (error) {
//       console.error('Failed to connect to the database:', error);
//     }
//   }
// }

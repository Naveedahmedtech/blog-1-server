import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class MongooseService implements OnModuleInit, OnModuleDestroy {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  onModuleInit() {
    this.connection.on('connected', () => {
      console.log('Database connection established successfully.');
    });

    this.connection.on('error', (error) => {
      console.error('Failed to connect to the database:', error);
    });
  }

  async onModuleDestroy() {
    try {
      await this.connection.close();
      console.log('Database connection closed.');
    } catch (error) {
      console.error('Failed to close the database connection:', error);
    }
  }
}

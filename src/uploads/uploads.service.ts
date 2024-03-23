// src/uploads/uploads.service.ts

import { Injectable } from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class UploadsService {
  private readonly uploadsPath = join(__dirname, '..', '..', 'uploads');

  getFileStream(fileName: string) {
    console.log('😀😀😀😀😀', join(__dirname, '..', '..', 'uploads'));
    const filePath = join(this.uploadsPath, fileName);
    // const filePath = join(this.uploadsPath, fileName);
    if (existsSync(filePath)) {
      return createReadStream(filePath);
    }
    return null;
  }
}

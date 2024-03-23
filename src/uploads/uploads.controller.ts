// src/uploads/uploads.controller.ts

import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { UploadsService } from './uploads.service';
import { join } from 'path';
import { of } from 'rxjs';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Get(':fileName')
  async serveUpload(@Param('fileName') fileName: string, @Res() res: Response) {
    return of(res.sendFile(join(process.cwd(), "uploads/" + fileName)));
    const stream = this.uploadsService.getFileStream(fileName);

    if (!stream) {
      throw new NotFoundException('File not found');
    }

    res.set({
      'Content-Type': 'image/jpeg', // You might want to dynamically determine the MIME type based on the file
    });

    stream.pipe(res);
  }
}

import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  Res,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { R2Service } from './r2.service';

@Controller('r2')
export class R2Controller {
  constructor(private readonly r2Service: R2Service) {}

  /**
   * Upload file
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('key') key?: string,
  ) {
    if (!file) {
      throw new Error('File not provided');
    }
    const fileKey = key || file.originalname;
    const result = await this.r2Service.uploadFile(
      fileKey,
      file.buffer,
      file.mimetype,
    );

    return {
      message: 'File uploaded successfully',
      ...result,
    };
  }

  /**
   * Download file
   */
  @Get('download/*path')
  async downloadFile(@Param('path') key: string, @Res() res: Response) {
    const file = await this.r2Service.downloadFile(key);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${key}"`);
    res.send(file);
  }

  /**
   * Get file (direct display)
   */
  @Get('file/*path')
  async getFile(@Param('path') key: string, @Res() res: Response) {
    const file = await this.r2Service.downloadFile(key);
    const fileInfo = await this.r2Service.fileExists(key);

    if (fileInfo.exists && fileInfo.contentType) {
      res.setHeader('Content-Type', fileInfo.contentType);
    }

    res.send(file);
  }

  /**
   * Delete file
   */
  @Delete('file/*path')
  async deleteFile(@Param('path') key: string) {
    const result = await this.r2Service.deleteFile(key);
    return {
      message: 'File deleted successfully',
      ...result,
    };
  }

  /**
   * List files
   */
  @Get('list')
  async listFiles(
    @Query('prefix') prefix?: string,
    @Query('maxKeys') maxKeys?: string,
  ) {
    const result = await this.r2Service.listFiles(
      prefix,
      maxKeys ? parseInt(maxKeys, 10) : undefined,
    );
    return result;
  }

  /**
   * Check if file exists
   */
  @Get('exists/*path')
  async fileExists(@Param('path') key: string) {
    const result = await this.r2Service.fileExists(key);
    return result;
  }

  /**
   * Get presigned URL
   */
  @Get('presigned-url/*path')
  async getPresignedUrl(
    @Param('path') key: string,
    @Query('expiresIn') expiresIn?: string,
  ) {
    const expires = expiresIn ? parseInt(expiresIn, 10) : 3600;
    const url = await this.r2Service.getPresignedUrl(key, expires);
    return { url, expiresIn: expires };
  }
}

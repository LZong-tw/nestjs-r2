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
   * 上傳檔案
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('key') key?: string,
  ) {
    if (!file) {
      throw new Error('檔案未提供');
    }
    const fileKey = key || file.originalname;
    const result = await this.r2Service.uploadFile(
      fileKey,
      file.buffer,
      file.mimetype,
    );

    return {
      message: '檔案上傳成功',
      ...result,
    };
  }

  /**
   * 下載檔案
   */
  @Get('download/*path')
  async downloadFile(@Param('path') key: string, @Res() res: Response) {
    const file = await this.r2Service.downloadFile(key);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${key}"`);
    res.send(file);
  }

  /**
   * 取得檔案（直接顯示）
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
   * 刪除檔案
   */
  @Delete('file/*path')
  async deleteFile(@Param('path') key: string) {
    const result = await this.r2Service.deleteFile(key);
    return {
      message: '檔案刪除成功',
      ...result,
    };
  }

  /**
   * 列出檔案
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
   * 檢查檔案是否存在
   */
  @Get('exists/*path')
  async fileExists(@Param('path') key: string) {
    const result = await this.r2Service.fileExists(key);
    return result;
  }

  /**
   * 取得預簽名 URL
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


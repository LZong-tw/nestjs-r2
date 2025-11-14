import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class R2Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('R2_BUCKET_NAME') || '';

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: this.configService.get<string>('R2_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.get<string>('R2_ACCESS_KEY_ID') || '',
        secretAccessKey:
          this.configService.get<string>('R2_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  /**
   * 上傳檔案到 R2
   * @param key 檔案路徑/名稱
   * @param body 檔案內容 (Buffer 或 Stream)
   * @param contentType MIME 類型
   * @returns 上傳結果
   */
  async uploadFile(
    key: string,
    body: Buffer | Uint8Array | string,
    contentType?: string,
  ): Promise<{ success: boolean; key: string }> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
      });

      await this.s3Client.send(command);

      return { success: true, key };
    } catch (error) {
      throw new Error(`上傳檔案失敗: ${error.message}`);
    }
  }

  /**
   * 下載檔案從 R2
   * @param key 檔案路徑/名稱
   * @returns 檔案內容
   */
  async downloadFile(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      const chunks: Uint8Array[] = [];

      if (response.Body) {
        for await (const chunk of response.Body as any) {
          chunks.push(chunk);
        }
      }

      return Buffer.concat(chunks);
    } catch (error) {
      throw new Error(`下載檔案失敗: ${error.message}`);
    }
  }

  /**
   * 刪除檔案
   * @param key 檔案路徑/名稱
   * @returns 刪除結果
   */
  async deleteFile(key: string): Promise<{ success: boolean; key: string }> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);

      return { success: true, key };
    } catch (error) {
      throw new Error(`刪除檔案失敗: ${error.message}`);
    }
  }

  /**
   * 列出檔案
   * @param prefix 路徑前綴（可選）
   * @param maxKeys 最大返回數量（可選）
   * @returns 檔案列表
   */
  async listFiles(prefix?: string, maxKeys?: number) {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys,
      });

      const response = await this.s3Client.send(command);

      return {
        files:
          response.Contents?.map((item) => ({
            key: item.Key,
            size: item.Size,
            lastModified: item.LastModified,
          })) || [],
        isTruncated: response.IsTruncated,
      };
    } catch (error) {
      throw new Error(`列出檔案失敗: ${error.message}`);
    }
  }

  /**
   * 檢查檔案是否存在
   * @param key 檔案路徑/名稱
   * @returns 檔案資訊或 null
   */
  async fileExists(key: string) {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      return {
        exists: true,
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        lastModified: response.LastModified,
        etag: response.ETag,
      };
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return { exists: false };
      }
      throw new Error(`檢查檔案失敗: ${error.message}`);
    }
  }

  /**
   * 產生預簽名 URL（用於臨時存取）
   * @param key 檔案路徑/名稱
   * @param expiresIn 過期時間（秒），預設 3600
   * @returns 預簽名 URL
   */
  async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });

      return url;
    } catch (error) {
      throw new Error(`產生預簽名 URL 失敗: ${error.message}`);
    }
  }
}


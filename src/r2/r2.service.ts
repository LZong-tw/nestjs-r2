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
   * Upload file to R2
   * @param key File path/name
   * @param body File content (Buffer or Stream)
   * @param contentType MIME type
   * @returns Upload result
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
    } catch (error: any) {
      throw new Error(
        `Failed to upload file: ${error?.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Download file from R2
   * @param key File path/name
   * @returns File content
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
    } catch (error: any) {
      throw new Error(
        `Failed to download file: ${error?.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Delete file
   * @param key File path/name
   * @returns Delete result
   */
  async deleteFile(key: string): Promise<{ success: boolean; key: string }> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);

      return { success: true, key };
    } catch (error: any) {
      throw new Error(
        `Failed to delete file: ${error?.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * List files
   * @param prefix Path prefix (optional)
   * @param maxKeys Maximum number of results (optional)
   * @returns File list
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
    } catch (error: any) {
      throw new Error(
        `Failed to list files: ${error?.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Check if file exists
   * @param key File path/name
   * @returns File information or null
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
      if (
        error?.name === 'NotFound' ||
        error?.$metadata?.httpStatusCode === 404
      ) {
        return { exists: false };
      }
      throw new Error(
        `Failed to check file: ${error?.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Generate presigned URL (for temporary access)
   * @param key File path/name
   * @param expiresIn Expiration time in seconds, default 3600
   * @returns Presigned URL
   */
  async getPresignedUrl(
    key: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });

      return url;
    } catch (error: any) {
      throw new Error(
        `Failed to generate presigned URL: ${error?.message || 'Unknown error'}`,
      );
    }
  }
}

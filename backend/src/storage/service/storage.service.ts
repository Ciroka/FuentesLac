import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const SIGNED_URL_EXPIRES_SEC = 3600;

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl?: string;

  constructor(configService: ConfigService) {
    this.bucket = configService.getOrThrow('R2_BUCKET_NAME');
    this.publicUrl = configService
      .get<string>('R2_PUBLIC_URL')
      ?.replace(/\/+$/, '');

    this.client = new S3Client({
      region: 'auto',
      endpoint: configService.getOrThrow('R2_ENDPOINT'),
      credentials: {
        accessKeyId: configService.getOrThrow('R2_ACCESS_KEY_ID'),
        secretAccessKey: configService.getOrThrow('R2_SECRET_ACCESS_KEY'),
      },
    });
  }

  async upload(
    file: Express.Multer.File,
    folder: string,
    name?: string,
  ): Promise<string> {
    const extension = EXTENSION_BY_MIME[file.mimetype];
    if (!extension) {
      throw new BadRequestException(
        `Tipo de archivo no soportado: ${file.mimetype}`,
      );
    }
    const key = `${folder}/${name ?? randomUUID()}-${randomUUID()}.${extension}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return key;
  }

  /**
   * Devuelve la URL pública si el bucket tiene dominio configurado
   * (`R2_PUBLIC_URL`); si no, una URL firmada temporal.
   */
  async getUrl(key: string): Promise<string> {
    if (this.publicUrl) {
      return `${this.publicUrl}/${key}`;
    }

    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: SIGNED_URL_EXPIRES_SEC },
    );
  }

  /** No lanza: borrar el archivo nunca debe tumbar la operación de negocio. */
  async remove(key: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
    } catch (error) {
      this.logger.error(`No se pudo borrar el archivo ${key}`, error);
    }
  }
}

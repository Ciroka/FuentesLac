import * as fs from 'fs';
import * as path from 'path';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import * as Joi from 'joi';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { RolesGuard } from './shared/guards/roles.guard';
import { QueryFailedFilter } from './shared/filters/query-failed.filter';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductionModule, Production } from './production';
import { ProductionDetailModule, ProductionDetail } from './production-detail';
import { ProductsModule, Product } from './products';
import { CategoriesModule, Category } from './categories';
import { SuppliersModule, Supplier } from './suppliers';
import { SuppliesModule, Supply } from './supplies';
import { SalesModule, Sale } from './sales';
import { SalesDetailModule, SalesDetail } from './sales-detail';
import { OrdersModule, Order } from './orders';
import { OrdersDetailModule, OrdersDetail } from './orders-detail';
import { AdjustmentsModule, Adjustment } from './adjustments';
import { ClientsModule, Client } from './clients';
import { UsersModule, User } from './users';
import { AuthModule } from './auth';
import { RefreshToken } from './auth/entities/refresh-token.entity';
import { BatchModule } from './batch/batch.module';
import { Batch } from './batch/entities/batch.entity';
import {
  SuppliesXproductionDetailModule,
  SuppliesXproductionDetail,
} from './supplies-xproduction-detail';
import { EmailSenderModule } from './email-sender/email-sender.module';
import { DashboardModule } from './dashboard';
import { AuditLogModule, AuditLog } from './audit-log';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .required(),
      }).unknown(true),
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    ProductsModule,
    ProductionModule,
    ProductionDetailModule,
    CategoriesModule,
    SuppliersModule,
    SuppliesModule,
    SalesModule,
    OrdersModule,
    AdjustmentsModule,
    ClientsModule,
    UsersModule,
    SalesDetailModule,
    OrdersDetailModule,
    AuthModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow('POSTGRES_HOST'),
        port: config.getOrThrow('POSTGRES_PORT'),
        username: config.getOrThrow('POSTGRES_USER'),
        password: config.getOrThrow('POSTGRES_PASSWORD'),
        database: config.getOrThrow('POSTGRES_DB'),
        ssl:
          config.get('POSTGRES_SSL') === 'true'
            ? {
                ca: fs
                  .readFileSync(
                    path.join(process.cwd(), 'certs/supabase-ca.crt'),
                  )
                  .toString(),
              }
            : false,
        synchronize: config.get('NODE_ENV') === 'development',
        entities: [
          User,
          Supplier,
          Supply,
          Sale,
          Product,
          Production,
          ProductionDetail,
          SalesDetail,
          Order,
          OrdersDetail,
          Client,
          Category,
          Adjustment,
          Batch,
          SuppliesXproductionDetail,
          RefreshToken,
          AuditLog,
        ],
      }),
    }),
    BatchModule,
    SuppliesXproductionDetailModule,
    EmailSenderModule,
    DashboardModule,
    AuditLogModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: QueryFailedFilter },
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { RolesGuard } from './shared/guards/roles.guard';
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
import { BatchModule } from './batch/batch.module';
import { Batch } from './batch/entities/batch.entity';
import {
  SuppliesXproductionDetailModule,
  SuppliesXproductionDetail,
} from './supplies-xproduction-detail';
import { EmailSenderModule } from './email-sender/email-sender.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
        synchronize: config.get('NODE_ENV') !== 'production',
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
        ],
      }),
    }),
    BatchModule,
    SuppliesXproductionDetailModule,
    EmailSenderModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}

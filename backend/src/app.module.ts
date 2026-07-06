import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductionModule, Production } from './production';
import { ProductionDetailModule, ProductionDetail } from './production-detail';
import { ProductsModule, Product } from './products';
import { CategoriesModule, Category } from './categories';
import { SuppliersModule, Supplier } from './suppliers';
import { SuppliesModule, Supply } from './supplies';
import { RecipeModule, Recipe } from './recipe';
import { RecipeDetailModule, RecipeDetail } from './recipe-detail';
import { SalesModule, Sale } from './sales';
import { SalesDetailModule, SalesDetail } from './sales-detail';
import { OrdersModule, Order } from './orders';
import { OrdersDetailModule, OrdersDetail } from './orders-detail';
import { AdjustmentsModule, Adjustment } from './adjustments';
import { ClientsModule, Client } from './clients';
import { UsersModule, User } from './users';
import { AuthModule } from './auth';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ProductsModule,
    ProductionModule,
    ProductionDetailModule,
    RecipeModule,
    RecipeDetailModule,
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
        synchronize: true,
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
          Recipe,
          RecipeDetail,
        ],
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { SalesModule } from './sales/sales.module';
import { OrdersModule } from './orders/orders.module';
import { AdjustmentsModule } from './adjustments/adjustments.module';
import { ClientsModule } from './clients/clients.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SalesDetailModule } from './sales-detail/sales-detail.module';
import { OrdersDetailModule } from './orders-detail/orders-detail.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { Supplier } from './suppliers/entities/supplier.entity';
import { Sale } from './sales/entities/sale.entity';
import { Product } from './products/entities/product.entity';
import { SalesDetail } from './sales-detail/entities/sales-detail.entity';
import { Order } from './orders/entities/order.entity';
import { OrdersDetail } from './orders-detail/entities/orders-detail.entity';
import { Client } from './clients/entities/client.entity';
import { Category } from './categories/entities/category.entity';
import { Adjustment } from './adjustments/entities/adjustment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    ProductsModule, 
    CategoriesModule, 
    SuppliersModule, 
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
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow("POSTGRES_HOST"),
        port: config.getOrThrow("POSTGRES_PORT"),
        username: config.getOrThrow("POSTGRES_USER"),
        password: config.getOrThrow("POSTGRES_PASSWORD"),
        database: config.getOrThrow("POSTGRES_DB"),
        synchronize: true,
        entities: [
          User, 
          Supplier, 
          Sale, 
          Product, 
          SalesDetail, 
          Order, 
          OrdersDetail,  
          Client, 
          Category, 
          Adjustment]
      }),
      inject: [ConfigService],
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

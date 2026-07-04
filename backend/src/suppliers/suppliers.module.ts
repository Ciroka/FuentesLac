import { Module } from '@nestjs/common';
import { SuppliersService } from './service/suppliers.service';
import { SuppliersController } from './controller/suppliers.controller';

@Module({
  controllers: [SuppliersController],
  providers: [SuppliersService],
})
export class SuppliersModule {}

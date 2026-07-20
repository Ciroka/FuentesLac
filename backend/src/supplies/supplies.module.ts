import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SuppliesController } from './controller/supplies.controller';
import { SuppliesService } from './service/supplies.service';
import { Supply } from './entities/supply.entity';
import { SUPPLIES_REPOSITORY } from './repository/supplies.repository.interface';
import { SuppliesRepository } from './repository/supplies.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Supply])],
  controllers: [SuppliesController],
  providers: [
    SuppliesService,
    {
      provide: SUPPLIES_REPOSITORY,
      useClass: SuppliesRepository,
    },
  ],
  exports: [TypeOrmModule, SuppliesService],
})
export class SuppliesModule {}

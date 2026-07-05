import { Injectable } from '@nestjs/common';
import { CreateProductionDetailDto } from '../dto/create-production-detail.dto';
import { UpdateProductionDetailDto } from '../dto/update-production-detail.dto';

@Injectable()
export class ProductionDetailService {
  create(createProductionDetailDto: CreateProductionDetailDto) {
    return 'This action adds a new productionDetail';
  }

  findAll() {
    return `This action returns all productionDetail`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productionDetail`;
  }

  update(id: number, updateProductionDetailDto: UpdateProductionDetailDto) {
    return `This action updates a #${id} productionDetail`;
  }

  remove(id: number) {
    return `This action removes a #${id} productionDetail`;
  }
}

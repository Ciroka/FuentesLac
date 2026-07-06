import { Injectable } from '@nestjs/common';
import { CreateSupplyDto, UpdateSupplyDto } from '../dto';

@Injectable()
export class SuppliesService {
  create(createSupplyDto: CreateSupplyDto) {
    return 'This action adds a new supply';
  }

  findAll() {
    return `This action returns all supplies`;
  }

  findOne(id: number) {
    return `This action returns a #${id} supply`;
  }

  update(id: number, updateSupplyDto: UpdateSupplyDto) {
    return `This action updates a #${id} supply`;
  }

  remove(id: number) {
    return `This action removes a #${id} supply`;
  }
}

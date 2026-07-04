import { Injectable } from '@nestjs/common';
import { CreateAdjustmentDto } from '../dto/create-adjustment.dto';
import { UpdateAdjustmentDto } from '../dto/update-adjustment.dto';

@Injectable()
export class AdjustmentsService {
  create(createAdjustmentDto: CreateAdjustmentDto) {
    return 'This action adds a new adjustment';
  }

  findAll() {
    return `This action returns all adjustments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} adjustment`;
  }

  update(id: number, updateAdjustmentDto: UpdateAdjustmentDto) {
    return `This action updates a #${id} adjustment`;
  }

  remove(id: number) {
    return `This action removes a #${id} adjustment`;
  }
}

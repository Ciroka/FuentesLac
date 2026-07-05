import { Injectable } from '@nestjs/common';

import { CreateOrdersDetailDto, UpdateOrdersDetailDto } from '../dto';

@Injectable()
export class OrdersDetailService {
  create(createOrdersDetailDto: CreateOrdersDetailDto) {
    return 'This action adds a new ordersDetail';
  }

  findAll() {
    return `This action returns all ordersDetail`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ordersDetail`;
  }

  update(id: number, updateOrdersDetailDto: UpdateOrdersDetailDto) {
    return `This action updates a #${id} ordersDetail`;
  }

  remove(id: number) {
    return `This action removes a #${id} ordersDetail`;
  }
}

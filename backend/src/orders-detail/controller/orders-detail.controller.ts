import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OrdersDetailService } from '../service/orders-detail.service';
import {
  CreateOrdersDetailDto,
  OrdersDetailResponse,
  UpdateOrdersDetailDto,
} from '../dto';

@Controller('orders-detail')
export class OrdersDetailController {
  constructor(private readonly ordersDetailService: OrdersDetailService) {}

  @Get()
  findAll(): Promise<OrdersDetailResponse[]> {
    return this.ordersDetailService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<OrdersDetailResponse> {
    return this.ordersDetailService.findOne(+id);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateOrdersDetailDto: UpdateOrdersDetailDto,
  // ): Promise<OrdersDetailResponse> {
  //   return this.ordersDetailService.update(+id, updateOrdersDetailDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<OrdersDetailResponse> {
    return this.ordersDetailService.remove(+id);
  }
}

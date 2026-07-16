import { Controller, Get, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { OrdersDetailService } from '../service/orders-detail.service';
import { OrdersDetailResponse } from '../dto';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums';

@Controller('orders-detail')
export class OrdersDetailController {
  constructor(private readonly ordersDetailService: OrdersDetailService) {}

  @Get()
  findAll(): Promise<OrdersDetailResponse[]> {
    return this.ordersDetailService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<OrdersDetailResponse> {
    return this.ordersDetailService.findOne(id);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<OrdersDetailResponse> {
    return this.ordersDetailService.remove(id);
  }
}

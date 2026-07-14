import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';

import { OrdersService } from '../service/orders.service';
import {
  CreateOrderDto,
  UpdateOrderDto,
  QueryParamsOrders,
  OrderResponse,
} from '../dto';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(
    @Query() params: QueryParamsOrders,
  ): Promise<PaginatedResult<OrderResponse>> {
    return this.ordersService.findAll(params);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<OrderResponse> {
    return this.ordersService.findOne(+id);
  }

  @Post()
  create(@Body() createOrderDto: CreateOrderDto): Promise<OrderResponse> {
    return this.ordersService.create(createOrderDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<OrderResponse> {
    return this.ordersService.update(+id, updateOrderDto);
  }
}

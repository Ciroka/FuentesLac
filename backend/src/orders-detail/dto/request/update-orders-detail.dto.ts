import { PartialType } from '@nestjs/mapped-types';
import { CreateOrdersDetailDto } from './create-orders-detail.dto';

export class UpdateOrdersDetailDto extends PartialType(CreateOrdersDetailDto) {}

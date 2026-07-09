import { PartialType } from '@nestjs/mapped-types';
import { CreateProductionDetailDto } from './create-production-detail.dto';

export class UpdateProductionDetailDto extends PartialType(
  CreateProductionDetailDto,
) {}

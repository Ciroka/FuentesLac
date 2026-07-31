import { PartialType } from '@nestjs/mapped-types';
import { CreateSuppliesXproductionDetailDto } from './create-supplies-xproduction-detail.dto';

export class UpdateSuppliesXproductionDetailDto extends PartialType(
  CreateSuppliesXproductionDetailDto,
) {}

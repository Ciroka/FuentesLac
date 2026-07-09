import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsPositive, ValidateNested } from 'class-validator';
import { CreateSuppliesXproductionDetailDto } from 'src/supplies-xproduction-detail/dto';

export class CreateProductionDetailDto {
  @IsInt()
  @IsPositive()
  quantity!: number;

  @IsInt()
  @IsPositive()
  productId!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSuppliesXproductionDetailDto)
  details!: CreateSuppliesXproductionDetailDto[];
}

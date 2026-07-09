import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, ValidateNested } from "class-validator";
import { CreateProductionDetailDto } from "src/production-detail/dto";

export class CreateProductionDto {
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateProductionDetailDto)
    details!: CreateProductionDetailDto[];
}

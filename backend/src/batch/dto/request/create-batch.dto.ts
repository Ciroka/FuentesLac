import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateBatchDto {
  @IsInt()
  @IsOptional()
  yield?: number;

  @IsString()
  @IsOptional()
  description?: string;
}

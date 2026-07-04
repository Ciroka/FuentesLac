import { PartialType } from '@nestjs/mapped-types';
import { CreateAdjustmentDto } from './create-adjustment.dto';

export class UpdateAdjustmentDto extends PartialType(CreateAdjustmentDto) {}

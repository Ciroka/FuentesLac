import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AdjustmentsService } from '../service/adjustments.service';
import {
  CreateAdjustmentDto,
  QueryParamsAdjustments,
  AdjustmentResponse,
} from '../dto';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums';

@Controller('adjustments')
export class AdjustmentsController {
  constructor(private readonly adjustmentsService: AdjustmentsService) {}

  @Get()
  findAll(
    @Query() params: QueryParamsAdjustments,
  ): Promise<PaginatedResult<AdjustmentResponse>> {
    return this.adjustmentsService.findAll(params);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<AdjustmentResponse> {
    return this.adjustmentsService.findOneById(+id);
  }

  @Post(':productId')
  create(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() createAdjustmentDto: CreateAdjustmentDto,
  ): Promise<AdjustmentResponse> {
    return this.adjustmentsService.create(productId, createAdjustmentDto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<AdjustmentResponse> {
    return this.adjustmentsService.remove(+id);
  }
}

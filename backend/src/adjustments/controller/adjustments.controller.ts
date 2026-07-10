import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseArrayPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { AdjustmentsService } from '../service/adjustments.service';
import {
  CreateAdjustmentDto,
  QueryParamsAdjustments,
  AdjustmentResponse,
} from '../dto';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';

@Controller('adjustments')
export class AdjustmentsController {
  constructor(private readonly adjustmentsService: AdjustmentsService) {}

  @Post(':productId')
  create(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() createAdjustmentDto: CreateAdjustmentDto,
  ): Promise<AdjustmentResponse> {
    return this.adjustmentsService.create(productId, createAdjustmentDto);
  }

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

  /*  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAdjustmentDto: UpdateAdjustmentDto,
  ) {
    return this.adjustmentsService.update(+id, updateAdjustmentDto);
  } para mi un ajsute no se tendria que poder actualizar
*/
  @Delete(':id')
  //agregar proteccion o no ver eso
  remove(@Param('id') id: string): Promise<AdjustmentResponse> {
    return this.adjustmentsService.remove(+id);
  }
}

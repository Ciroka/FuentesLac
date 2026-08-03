import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { BatchService } from '../service/batch.service';
import {
  BatchResponse,
  CreateBatchDto,
  QueryParamsBatch,
  toBatchResponse,
} from '../dto';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums';
import { Batch } from '../entities/batch.entity';

@Controller('batch')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Get()
  async findAll(
    @Query() params: QueryParamsBatch,
  ): Promise<PaginatedResult<BatchResponse>> {
    const result = await this.batchService.findAll(params);
    return { ...result, items: result.items.map(toBatchResponse) };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<BatchResponse> {
    const batch = await this.batchService.findOne(id);
    return toBatchResponse(batch);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() dto: CreateBatchDto): Promise<BatchResponse> {
    const input: Partial<Batch> = {
      ...dto,
      clientBatchDate: dto.clientBatchDate
        ? new Date(dto.clientBatchDate)
        : undefined,
    };
    const batch = await this.batchService.create(input);
    return toBatchResponse(batch);
  }

  @Roles(UserRole.ADMIN)
  @Post(':id/recalculate-yield')
  async recalculate(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BatchResponse> {
    const batch = await this.batchService.recalculateYield(id);
    return toBatchResponse(batch);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<BatchResponse> {
    const batch = await this.batchService.remove(id);
    return toBatchResponse(batch);
  }
}

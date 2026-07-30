import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { BatchService } from '../service/batch.service';
import { BatchResponse, CreateBatchDto, toBatchResponse } from '../dto';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums';
import { Batch } from '../entities/batch.entity';

@Controller('batch')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Get()
  async findAll(): Promise<BatchResponse[]> {
    const batches = await this.batchService.findAll();
    return batches.map(toBatchResponse);
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

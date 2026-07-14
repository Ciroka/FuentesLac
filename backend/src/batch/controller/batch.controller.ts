import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
} from '@nestjs/common';
import { BatchService } from '../service/batch.service';
import { BatchResponse, CreateBatchDto } from '../dto';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums';

@Controller('batch')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Get()
  findAll(): Promise<BatchResponse[]> {
    return this.batchService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<BatchResponse> {
    return this.batchService.findOne(+id);
  }

  @Post()
  create(@Body() createBatchDto: CreateBatchDto): Promise<BatchResponse> {
    return this.batchService.create(createBatchDto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<BatchResponse> {
    return this.batchService.remove(+id);
  }
}

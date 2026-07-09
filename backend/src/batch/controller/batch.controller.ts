import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BatchService } from '../service/batch.service';
import { BatchResponse, CreateBatchDto, UpdateBatchDto } from '../dto';

@Controller('batch')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Get() //ver si paginamos tambien los lotes por si llos quieren consultar
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

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateBatchDto: UpdateBatchDto): Promise<BatchResponse> {
  //   return this.batchService.update(+id, updateBatchDto);
  // } ver comentario servicio

  @Delete(':id')
  //ver tema de permisos
  remove(@Param('id') id: string): Promise<BatchResponse> {
    return this.batchService.remove(+id);
  }
}

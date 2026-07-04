import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AdjustmentsService } from '../service/adjustments.service';
import { CreateAdjustmentDto } from '../dto/create-adjustment.dto';
import { UpdateAdjustmentDto } from '../dto/update-adjustment.dto';

@Controller('adjustments')
export class AdjustmentsController {
  constructor(private readonly adjustmentsService: AdjustmentsService) {}

  @Post()
  create(@Body() createAdjustmentDto: CreateAdjustmentDto) {
    return this.adjustmentsService.create(createAdjustmentDto);
  }

  @Get()
  findAll() {
    return this.adjustmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adjustmentsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAdjustmentDto: UpdateAdjustmentDto,
  ) {
    return this.adjustmentsService.update(+id, updateAdjustmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adjustmentsService.remove(+id);
  }
}

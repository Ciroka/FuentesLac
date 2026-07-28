import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { SalesService } from '../service/sales.service';
import {
  CreateSaleDto,
  UpdateSaleDto,
  QueryParamsSales,
  SaleResponse,
} from '../dto';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums';

const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = /^image\/(jpeg|png|webp)$/;

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  findAll(
    @Query() params: QueryParamsSales,
  ): Promise<PaginatedResult<SaleResponse>> {
    return this.salesService.findAll(params);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<SaleResponse> {
    return this.salesService.findOne(id);
  }

  @Post()
  create(@Body() createSaleDto: CreateSaleDto): Promise<SaleResponse> {
    return this.salesService.create(createSaleDto);
  }

  @Post(':id/photo')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_PHOTO_SIZE_BYTES } }),
  )
  uploadPhoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_PHOTO_SIZE_BYTES }),
          new FileTypeValidator({ fileType: ALLOWED_PHOTO_TYPES }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<SaleResponse> {
    return this.salesService.uploadPhoto(id, file);
  }

  @Delete(':id/photo')
  removePhoto(@Param('id', ParseIntPipe) id: number): Promise<SaleResponse> {
    return this.salesService.removePhoto(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSaleDto: UpdateSaleDto,
  ) {
    return this.salesService.update(id, updateSaleDto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<SaleResponse> {
    return this.salesService.remove(id);
  }
}

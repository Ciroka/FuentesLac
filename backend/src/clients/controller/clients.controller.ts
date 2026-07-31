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
} from '@nestjs/common';
import { ClientsService } from '../service/clients.service';
import {
  CreateClientDto,
  UpdateClientDto,
  QueryParamsClients,
  ClientResponse,
} from '../dto';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  findAll(
    @Query() params: QueryParamsClients,
  ): Promise<PaginatedResult<ClientResponse>> {
    return this.clientsService.findAll(params);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ClientResponse> {
    return this.clientsService.findOne(id);
  }

  @Post()
  create(@Body() createClientDto: CreateClientDto): Promise<ClientResponse> {
    return this.clientsService.create(createClientDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClientDto: UpdateClientDto,
  ): Promise<ClientResponse> {
    return this.clientsService.update(id, updateClientDto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<ClientResponse> {
    return this.clientsService.remove(id);
  }
}

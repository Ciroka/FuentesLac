import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ClientsService } from '../service/clients.service';
import {
  CreateClientDto,
  UpdateClientDto,
  QueryParamsClients,
  ClientResponse,
} from '../dto';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';

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
  findOne(@Param('id') id: string): Promise<ClientResponse> {
    return this.clientsService.findOne(+id);
  }

  @Post()
  create(@Body() createClientDto: CreateClientDto): Promise<ClientResponse> {
    return this.clientsService.create(createClientDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ): Promise<ClientResponse> {
    return this.clientsService.update(+id, updateClientDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<ClientResponse> {
    return this.clientsService.remove(+id);
  }
}

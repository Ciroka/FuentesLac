import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { CLIENTS_REPOSITORY } from '../repository/clients.repository.interface';

describe('ClientsService', () => {
  let service: ClientsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: CLIENTS_REPOSITORY, useValue: {} },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

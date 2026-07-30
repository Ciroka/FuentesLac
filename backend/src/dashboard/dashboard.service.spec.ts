import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { ProductsService } from '../products/service/products.service';
import { BatchService } from '../batch/service/batch.service';
import { Production } from '../production/entities/production.entity';
import { Sale } from '../sales/entities/sale.entity';
import { Supply } from '../supplies/entities/supply.entity';
import { Product } from '../products/entities/product.entity';

describe('DashboardService', () => {
  let service: DashboardService;
  let productRepo: { find: jest.Mock };
  let saleRepo: { find: jest.Mock };
  let supplyRepo: { find: jest.Mock };
  let productionRepo: { find: jest.Mock };
  let batchService: { getTotalStockByProduct: jest.Mock };
  let actionGenerator: { generate: jest.Mock };

  beforeEach(async () => {
    productRepo = { find: jest.fn().mockResolvedValue([]) };
    saleRepo = { find: jest.fn().mockResolvedValue([]) };
    supplyRepo = { find: jest.fn().mockResolvedValue([]) };
    productionRepo = { find: jest.fn().mockResolvedValue([]) };
    batchService = { getTotalStockByProduct: jest.fn().mockResolvedValue(0) };
    actionGenerator = { generate: jest.fn().mockReturnValue([]) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: ProductsService, useValue: {} },
        { provide: BatchService, useValue: batchService },
        { provide: getRepositoryToken(Production), useValue: productionRepo },
        { provide: getRepositoryToken(Sale), useValue: saleRepo },
        { provide: getRepositoryToken(Supply), useValue: supplyRepo },
        { provide: getRepositoryToken(Product), useValue: productRepo },
        { provide: 'ACTION_GENERATORS', useValue: actionGenerator },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSummary', () => {
    it('does not crash with an empty database (no products, no supplies, no sales)', async () => {
      const summary = await service.getSummary();

      expect(summary.lowestStockProduct).toBeNull();
      expect(summary.criticalSupplies).toEqual([]);
      expect(summary.todaySales.totalAmount).toBe(0);
      expect(summary.todayProduction.totalQuantity).toBe(0);
      expect(summary.weeklyProduction).toHaveLength(7);
    });

    it('does not break when a product has minStock 0 (division by zero)', async () => {
      productRepo.find.mockResolvedValue([
        { id: 1, name: 'Sin mínimo', minStock: 0, category: undefined },
        { id: 2, name: 'Con mínimo', minStock: 10, category: undefined },
      ]);
      batchService.getTotalStockByProduct.mockImplementation((id: number) =>
        Promise.resolve(id === 1 ? 0 : 5),
      );

      const summary = await service.getSummary();

      // El producto con minStock 10 y stock 5 (ratio 0.5, crítico) tiene que
      // ganarle al que tiene minStock 0 (ratio fijo en 1) como "más bajo".
      expect(summary.lowestStockProduct?.id).toBe(2);
      expect(
        summary.productStocks.every((p) => Number.isFinite(p.totalStock)),
      ).toBe(true);
    });

    it('marks a supply as critical only when its stock is below the minimum', async () => {
      const supplies = [
        {
          id: 1,
          name: 'Bajo',
          currentStock: 5,
          minStock: 10,
          supplier: { name: 'A' },
        },
        {
          id: 2,
          name: 'OK',
          currentStock: 20,
          minStock: 10,
          supplier: undefined,
        },
      ];
      supplyRepo.find.mockResolvedValue(supplies);

      const summary = await service.getSummary();

      expect(summary.criticalSupplies).toEqual([
        {
          id: 1,
          name: 'Bajo',
          currentStock: 5,
          minStock: 10,
          supplierName: 'A',
        },
      ]);
    });

    it('leaves the day-over-day comparison at 0 (not NaN/Infinity) when there is nothing to compare against', async () => {
      const summary = await service.getSummary();

      expect(summary.todaySales.vsYesterday).toBe(0);
      expect(summary.todayProduction.vsYesterday).toBe(0);
    });

    it('excludes production dated exactly at the next UTC day boundary from "today"', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-07-30T15:00:00Z'));

      const todayProd = {
        productionDate: new Date('2026-07-30T08:00:00Z'),
        details: [{ quantity: 5, product: { name: 'Queso' } }],
      };
      const nextDayProd = {
        productionDate: new Date('2026-07-31T00:00:00Z'),
        details: [{ quantity: 99, product: { name: 'Queso' } }],
      };
      productionRepo.find.mockResolvedValue([todayProd, nextDayProd]);

      const summary = await service.getSummary();

      expect(summary.todayProduction.totalQuantity).toBe(5);

      jest.useRealTimers();
    });
  });
});

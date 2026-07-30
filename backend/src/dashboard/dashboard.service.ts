import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThan } from 'typeorm';

import { ProductsService } from '../products/service/products.service';
import { BatchService } from '../batch/service/batch.service';
import { Production } from '../production/entities/production.entity';
import { Sale } from '../sales/entities/sale.entity';
import { Supply } from '../supplies/entities/supply.entity';
import { Product } from '../products/entities/product.entity';
import type { ActionGenerator } from './strategies/action-generator.interface';
import { DashboardContext } from './strategies/action-generator.interface';
import {
  DashboardSummary,
  CriticalSupply,
  TodayProduction,
  TodaySales,
  ProductionVsSales,
} from './dto/response/dashboard-summary.dto';
import { ProductStock } from './dto/response/product-stock.dto';
import { WeeklyDay } from './dto/response/weekly-production.dto';

@Injectable()
export class DashboardService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly batchService: BatchService,
    @InjectRepository(Production)
    private readonly productionRepo: Repository<Production>,
    @InjectRepository(Sale)
    private readonly saleRepo: Repository<Sale>,
    @InjectRepository(Supply)
    private readonly supplyRepo: Repository<Supply>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @Inject('ACTION_GENERATORS')
    private readonly actionGenerator: ActionGenerator,
  ) {}

  async getSummary(): Promise<DashboardSummary> {
    const today = this.startOfDay(new Date());
    const yesterday = this.startOfDay(new Date(Date.now() - 86400000));
    const weekStart = this.startOfDay(new Date(Date.now() - 6 * 86400000));

    const [
      productStocks,
      supplies,
      todayProduction,
      yesterdayProduction,
      todaySales,
      yesterdaySales,
      weeklyProduction,
    ] = await Promise.all([
      this.getProductStocks(),
      this.supplyRepo.find({ relations: { supplier: true } }),
      this.getProductionByDate(today),
      this.getProductionByDate(yesterday),
      this.getSalesByDate(today),
      this.getSalesByDate(yesterday),
      this.getWeeklyProduction(weekStart),
    ]);

    const criticalSupplies: CriticalSupply[] = supplies
      .filter((s) => s.currentStock < s.minStock)
      .map((s) => ({
        id: s.id,
        name: s.name,
        currentStock: s.currentStock,
        minStock: s.minStock,
        supplierName: s.supplier?.name,
      }));

    const lowestStockProduct = this.findLowestStock(productStocks);

    const todayTotalProd = todayProduction.reduce(
      (sum, p) => sum + p.quantity,
      0,
    );
    const yesterdayTotalProd = yesterdayProduction.reduce(
      (sum, p) => sum + p.quantity,
      0,
    );
    const vsYesterdayProd =
      yesterdayTotalProd > 0
        ? Math.round(
            ((todayTotalProd - yesterdayTotalProd) / yesterdayTotalProd) * 100,
          )
        : 0;

    const todayTotalSales = todaySales.reduce(
      (sum, s) => sum + Number(s.total),
      0,
    );
    const todayUnitsSold = todaySales.length;
    const yesterdayTotalSales = yesterdaySales.reduce(
      (sum, s) => sum + Number(s.total),
      0,
    );
    const vsYesterdaySales =
      yesterdayTotalSales > 0
        ? Math.round(
            ((todayTotalSales - yesterdayTotalSales) / yesterdayTotalSales) *
              100,
          )
        : 0;

    const topProductsMap = new Map<
      string,
      { quantity: number; amount: number }
    >();
    for (const sale of todaySales) {
      if (!sale.details) continue;
      for (const detail of sale.details) {
        const name = detail.batch?.product?.name ?? 'Desconocido';
        const existing = topProductsMap.get(name) ?? { quantity: 0, amount: 0 };
        existing.quantity += detail.quantity;
        existing.amount += Number(detail.subtotal);
        topProductsMap.set(name, existing);
      }
    }
    const topProducts = Array.from(topProductsMap.entries())
      .map(([productName, data]) => ({ productName, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const breakdownMap = new Map<string, number>();
    for (const p of todayProduction) {
      const name = p.product?.name ?? 'Desconocido';
      breakdownMap.set(name, (breakdownMap.get(name) ?? 0) + p.quantity);
    }

    const ctx: DashboardContext = {
      products: productStocks,
      supplies: supplies.map((s) => ({
        id: s.id,
        name: s.name,
        currentStock: s.currentStock,
        minStock: s.minStock,
        supplier: s.supplier ? { name: s.supplier.name } : undefined,
      })),
      criticalSupplies,
    };

    return {
      todayProduction: {
        totalQuantity: todayTotalProd,
        vsYesterday: vsYesterdayProd,
        breakdown: Array.from(breakdownMap.entries()).map(
          ([productName, quantity]) => ({ productName, quantity }),
        ),
      },
      todaySales: {
        totalAmount: todayTotalSales,
        totalUnits: todayUnitsSold,
        vsYesterday: vsYesterdaySales,
        topProducts,
      },
      criticalSupplies,
      lowestStockProduct,
      productionVsSales: {
        produced: todayTotalProd,
        sold: todayUnitsSold,
        balance: todayTotalProd - todayUnitsSold,
      },
      suggestedActions: this.actionGenerator.generate(ctx),
      productStocks,
      weeklyProduction,
    };
  }

  private async getProductStocks(): Promise<ProductStock[]> {
    const products = await this.productRepo.find({
      relations: { category: true },
    });
    const stocks = await Promise.all(
      products.map(async (p) => {
        const totalStock = await this.batchService.getTotalStockByProduct(p.id);
        const ratio = p.minStock > 0 ? totalStock / p.minStock : 1;
        const status: ProductStock['status'] =
          ratio < 1 ? 'critical' : ratio < 1.2 ? 'warn' : 'ok';
        return {
          id: p.id,
          name: p.name,
          totalStock,
          minStock: p.minStock,
          category: p.category?.name,
          status,
        };
      }),
    );
    return stocks.sort((a, b) => this.stockRatio(a) - this.stockRatio(b));
  }

  /** minStock 0 no debe romper el orden ni el cálculo (Infinity/NaN). */
  private stockRatio(product: ProductStock): number {
    return product.minStock > 0 ? product.totalStock / product.minStock : 1;
  }

  private findLowestStock(products: ProductStock[]): ProductStock | null {
    if (products.length === 0) return null;
    return products.reduce((min, p) =>
      this.stockRatio(p) < this.stockRatio(min) ? p : min,
    );
  }

  private async getProductionByDate(
    date: Date,
  ): Promise<{ quantity: number; product?: Product }[]> {
    const nextDay = new Date(date.getTime() + 86400000);
    const productions = await this.productionRepo.find({
      where: { productionDate: MoreThanOrEqual(date) },
      relations: { details: { product: true } },
    });
    return productions
      .filter((p) => p.productionDate < nextDay)
      .flatMap((p) => p.details ?? []);
  }

  private async getSalesByDate(date: Date): Promise<Sale[]> {
    const nextDay = new Date(date.getTime() + 86400000);
    return this.saleRepo
      .find({
        where: { date: MoreThanOrEqual(date) },
        relations: { details: { batch: { product: true } }, client: true },
      })
      .then((sales) => sales.filter((s) => s.date < nextDay));
  }

  private async getWeeklyProduction(startDate: Date): Promise<WeeklyDay[]> {
    const productions = await this.productionRepo.find({
      where: { productionDate: MoreThanOrEqual(startDate) },
      relations: { details: { product: true } },
    });

    const dayMap = new Map<string, Map<string, number>>();

    for (const prod of productions) {
      const dateKey = this.formatDate(prod.productionDate);
      if (!dayMap.has(dateKey)) dayMap.set(dateKey, new Map());
      const productMap = dayMap.get(dateKey)!;
      for (const detail of prod.details ?? []) {
        const name = detail.product?.name ?? 'Desconocido';
        productMap.set(name, (productMap.get(name) ?? 0) + detail.quantity);
      }
    }

    const days: WeeklyDay[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(startDate.getTime() + i * 86400000);
      const key = this.formatDate(d);
      const productMap = dayMap.get(key) ?? new Map();
      const products = Array.from(productMap.entries()).map(
        ([productName, quantity]) => ({ productName, quantity }),
      );
      days.push({
        date: key,
        total: products.reduce((sum, p) => sum + p.quantity, 0),
        products,
      });
    }
    return days;
  }

  private startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}

export interface ProductionSupplyDetail {
  id: number;
  quantity: number;
  supply?: {
    id: number;
    name: string;
  };
}

export interface ProductionDetail {
  id: number;
  quantity: number;
  product?: {
    id: number;
    name: string;
  };
  supplyXDetail?: ProductionSupplyDetail[];
}

export interface Production {
  id: number;
  productionDate: Date;
  details?: ProductionDetail[];
}

export interface CreateProductionSupplyRequest {
  supplyId: number;
  quantity: number;
}

export interface CreateProductionDetailRequest {
  productId: number;
  quantity: number;
  clientBatchDate?: string;
  details: CreateProductionSupplyRequest[];
}

export interface CreateProductionRequest {
  details: CreateProductionDetailRequest[];
}

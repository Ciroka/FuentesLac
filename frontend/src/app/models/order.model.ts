export interface OrderDetail {
  id: number;
  orderedQuantity: number;
  arrivalQuantity: number;
  orderedSubtotal: number;
  arrivalSubtotal: number;
  supply?: {
    id: number;
    name: string;
  };
}

export interface Order {
  id: number;
  date: Date;
  orderedTotal: number;
  arrivalTotal: number;
  supplierId?: number;
  supplier?: { id: number; name: string };
  ordersDetails?: OrderDetail[];
}

export interface CreateOrderDetailRequest {
  supplyId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  supplierId: number;
  details: CreateOrderDetailRequest[];
}

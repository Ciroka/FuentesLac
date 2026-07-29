export enum OrderStatus {
  PENDING = 'PENDING',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

export interface OrderDetail {
  id: number;
  orderedQuantity: number;
  arrivalQuantity: number;
  unitPrice: number;
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
  status: OrderStatus;
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

export interface ArrivalDetailRequest {
  supplyId: number;
  quantity: number;
}

export interface RegisterArrivalRequest {
  details: ArrivalDetailRequest[];
}

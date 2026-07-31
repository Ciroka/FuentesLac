export interface Client {
  id: number;
  name: string;
  lastName: string;
  phone: string;
  cuit: string;
  email: string;
}

export interface CreateClientRequest {
  name: string;
  lastName: string;
  phone: string;
  cuit: string;
  email: string;
}

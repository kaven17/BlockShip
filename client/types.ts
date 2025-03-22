export interface Shipment {
  id: string;
  product: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  trackingId: string;
}

export enum ShipmentStatus {
  PENDING = 'PENDING',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  DELAYED = 'DELAYED',
} 
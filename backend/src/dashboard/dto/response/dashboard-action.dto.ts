export interface DashboardAction {
  type: 'produce' | 'purchase';
  priority: 'high' | 'medium' | 'low';
  label: string;
  detail: string;
  missingPercent: number;
}

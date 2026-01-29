export interface Transaction {
  id: number;
  date: string;
  type: "buy" | "sell";
  asset: string;
  quantity: number;
  price: number;
}

export interface PortfolioItem {
  asset: string;
  quantity: number;
  averagePrice: number;
}

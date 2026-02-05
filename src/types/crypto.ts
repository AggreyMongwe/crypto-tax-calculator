// Core transaction types for the crypto tax calculator

export type TransactionType = 'BUY' | 'SELL' | 'TRADE';

export interface RawTransaction {
  date: string;
  type: TransactionType;
  coin: string;
  amount: number;
  pricePerUnit: number; // in ZAR
  totalValue: number; // in ZAR
  fee?: number; // optional fee in ZAR
  notes?: string;
}

export interface ParsedTransaction extends RawTransaction {
  id: string;
  dateObj: Date;
  taxYear: string; // e.g., "2024/2025" for March 2024 - Feb 2025
}

// FIFO lot tracking
export interface CryptoLot {
  id: string;
  purchaseDate: Date;
  coin: string;
  originalAmount: number;
  remainingAmount: number;
  costPerUnit: number; // in ZAR
  totalCost: number; // in ZAR
  fee: number;
}

// When a sell happens, we match against lots
export interface LotMatch {
  lotId: string;
  purchaseDate: Date;
  amountUsed: number;
  costBasis: number; // what we paid for this portion
  proceedsFromSale: number; // what we got for this portion
  gainOrLoss: number; // proceeds - cost
  holdingPeriodDays: number;
}

export interface SellTransaction extends ParsedTransaction {
  type: 'SELL';
  lotMatches: LotMatch[];
  totalCostBasis: number;
  totalProceeds: number;
  totalGainOrLoss: number;
}

export interface ProcessedTransaction extends ParsedTransaction {
  lotMatches?: LotMatch[];
  totalCostBasis?: number;
  totalProceeds?: number;
  totalGainOrLoss?: number;
  runningBalance?: number;
}

// Summary by coin
export interface CoinSummary {
  coin: string;
  totalBought: number;
  totalSold: number;
  currentBalance: number;
  totalCostBasis: number;
  totalProceeds: number;
  realizedGainOrLoss: number;
  unrealizedCostBasis: number; // cost basis of remaining holdings
}

// Summary by tax year
export interface TaxYearSummary {
  taxYear: string;
  startDate: Date;
  endDate: Date;
  transactions: ProcessedTransaction[];
  coinSummaries: CoinSummary[];
  totalRealizedGains: number;
  totalRealizedLosses: number;
  netGainOrLoss: number;
}

// Overall portfolio state
export interface PortfolioState {
  lots: CryptoLot[];
  processedTransactions: ProcessedTransaction[];
  taxYearSummaries: TaxYearSummary[];
  currentBalances: Record<string, number>;
}

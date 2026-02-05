// FIFO (First-In, First-Out) Crypto Tax Calculator
// This implements the SARS-required FIFO method for calculating capital gains

import {
  RawTransaction,
  ParsedTransaction,
  CryptoLot,
  LotMatch,
  ProcessedTransaction,
  CoinSummary,
  TaxYearSummary,
  PortfolioState,
} from '@/types/crypto';
import { getTaxYearForDate } from './taxYears';

/**
 * Generate a unique ID
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Parse raw transactions into processed transactions with dates and tax years
 */
export function parseTransactions(raw: RawTransaction[]): ParsedTransaction[] {
  return raw.map((t) => {
    const dateObj = new Date(t.date);
    const taxYear = getTaxYearForDate(dateObj);
    
    return {
      ...t,
      id: generateId(),
      dateObj,
      taxYear: taxYear.label,
    };
  }).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
}

/**
 * Process all transactions using FIFO method
 */
export function processTransactionsFIFO(transactions: ParsedTransaction[]): PortfolioState {
  // Sort by date
  const sorted = [...transactions].sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  
  // Track lots per coin
  const lotsByCoin: Record<string, CryptoLot[]> = {};
  const processedTransactions: ProcessedTransaction[] = [];
  const balances: Record<string, number> = {};
  
  for (const tx of sorted) {
    const coin = tx.coin.toUpperCase();
    
    if (!lotsByCoin[coin]) {
      lotsByCoin[coin] = [];
    }
    if (balances[coin] === undefined) {
      balances[coin] = 0;
    }
    
    if (tx.type === 'BUY') {
      // Create a new lot
      const lot: CryptoLot = {
        id: generateId(),
        purchaseDate: tx.dateObj,
        coin,
        originalAmount: tx.amount,
        remainingAmount: tx.amount,
        costPerUnit: tx.pricePerUnit,
        totalCost: tx.totalValue,
        fee: tx.fee || 0,
      };
      lotsByCoin[coin].push(lot);
      balances[coin] += tx.amount;
      
      processedTransactions.push({
        ...tx,
        coin,
        runningBalance: balances[coin],
      });
    } else if (tx.type === 'SELL') {
      // Match against oldest lots first (FIFO)
      const lotMatches: LotMatch[] = [];
      let remainingToSell = tx.amount;
      let totalCostBasis = 0;
      
      // Sort lots by purchase date (oldest first)
      const availableLots = lotsByCoin[coin]
        .filter(lot => lot.remainingAmount > 0)
        .sort((a, b) => a.purchaseDate.getTime() - b.purchaseDate.getTime());
      
      for (const lot of availableLots) {
        if (remainingToSell <= 0) break;
        
        const amountFromThisLot = Math.min(lot.remainingAmount, remainingToSell);
        const costBasisForPortion = amountFromThisLot * lot.costPerUnit;
        const proceedsForPortion = amountFromThisLot * tx.pricePerUnit;
        const holdingDays = Math.floor(
          (tx.dateObj.getTime() - lot.purchaseDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        // Include proportional fee in cost basis
        const feeForPortion = (amountFromThisLot / lot.originalAmount) * lot.fee;
        const totalCostForPortion = costBasisForPortion + feeForPortion;
        
        lotMatches.push({
          lotId: lot.id,
          purchaseDate: lot.purchaseDate,
          amountUsed: amountFromThisLot,
          costBasis: totalCostForPortion,
          proceedsFromSale: proceedsForPortion,
          gainOrLoss: proceedsForPortion - totalCostForPortion,
          holdingPeriodDays: holdingDays,
        });
        
        totalCostBasis += totalCostForPortion;
        lot.remainingAmount -= amountFromThisLot;
        remainingToSell -= amountFromThisLot;
      }
      
      if (remainingToSell > 0.00000001) {
        console.warn(`Warning: Trying to sell ${tx.amount} ${coin} but only have enough lots for ${tx.amount - remainingToSell}`);
      }
      
      balances[coin] -= tx.amount;
      
      // Include sell fee in calculation
      const sellFee = tx.fee || 0;
      const totalProceeds = tx.totalValue - sellFee;
      const totalGainOrLoss = totalProceeds - totalCostBasis;
      
      processedTransactions.push({
        ...tx,
        coin,
        lotMatches,
        totalCostBasis,
        totalProceeds,
        totalGainOrLoss,
        runningBalance: balances[coin],
      });
    } else if (tx.type === 'TRADE') {
      // TRADE: selling one crypto for another
      // This is a taxable event - treated as a sell of the source coin
      // For simplicity, we'll treat it as a sell (the UI can handle showing both sides)
      
      // Match against oldest lots first
      const lotMatches: LotMatch[] = [];
      let remainingToSell = tx.amount;
      let totalCostBasis = 0;
      
      const availableLots = lotsByCoin[coin]
        .filter(lot => lot.remainingAmount > 0)
        .sort((a, b) => a.purchaseDate.getTime() - b.purchaseDate.getTime());
      
      for (const lot of availableLots) {
        if (remainingToSell <= 0) break;
        
        const amountFromThisLot = Math.min(lot.remainingAmount, remainingToSell);
        const costBasisForPortion = amountFromThisLot * lot.costPerUnit;
        const proceedsForPortion = amountFromThisLot * tx.pricePerUnit;
        const holdingDays = Math.floor(
          (tx.dateObj.getTime() - lot.purchaseDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        const feeForPortion = (amountFromThisLot / lot.originalAmount) * lot.fee;
        const totalCostForPortion = costBasisForPortion + feeForPortion;
        
        lotMatches.push({
          lotId: lot.id,
          purchaseDate: lot.purchaseDate,
          amountUsed: amountFromThisLot,
          costBasis: totalCostForPortion,
          proceedsFromSale: proceedsForPortion,
          gainOrLoss: proceedsForPortion - totalCostForPortion,
          holdingPeriodDays: holdingDays,
        });
        
        totalCostBasis += totalCostForPortion;
        lot.remainingAmount -= amountFromThisLot;
        remainingToSell -= amountFromThisLot;
      }
      
      balances[coin] -= tx.amount;
      
      const totalProceeds = tx.totalValue;
      const totalGainOrLoss = totalProceeds - totalCostBasis;
      
      processedTransactions.push({
        ...tx,
        coin,
        lotMatches,
        totalCostBasis,
        totalProceeds,
        totalGainOrLoss,
        runningBalance: balances[coin],
      });
    }
  }
  
  // Flatten all lots
  const allLots: CryptoLot[] = Object.values(lotsByCoin).flat();
  
  // Calculate summaries
  const taxYearSummaries = calculateTaxYearSummaries(processedTransactions, allLots);
  
  return {
    lots: allLots,
    processedTransactions,
    taxYearSummaries,
    currentBalances: balances,
  };
}

/**
 * Calculate summaries per tax year
 */
function calculateTaxYearSummaries(
  transactions: ProcessedTransaction[],
  allLots: CryptoLot[]
): TaxYearSummary[] {
  // Group by tax year
  const byTaxYear: Record<string, ProcessedTransaction[]> = {};
  
  for (const tx of transactions) {
    if (!byTaxYear[tx.taxYear]) {
      byTaxYear[tx.taxYear] = [];
    }
    byTaxYear[tx.taxYear].push(tx);
  }
  
  return Object.entries(byTaxYear).map(([taxYear, txs]) => {
    // Calculate coin summaries for this tax year
    const coinStats: Record<string, CoinSummary> = {};
    
    for (const tx of txs) {
      if (!coinStats[tx.coin]) {
        coinStats[tx.coin] = {
          coin: tx.coin,
          totalBought: 0,
          totalSold: 0,
          currentBalance: 0,
          totalCostBasis: 0,
          totalProceeds: 0,
          realizedGainOrLoss: 0,
          unrealizedCostBasis: 0,
        };
      }
      
      const stats = coinStats[tx.coin];
      
      if (tx.type === 'BUY') {
        stats.totalBought += tx.amount;
        stats.totalCostBasis += tx.totalValue + (tx.fee || 0);
      } else {
        stats.totalSold += tx.amount;
        stats.totalProceeds += tx.totalProceeds || 0;
        stats.realizedGainOrLoss += tx.totalGainOrLoss || 0;
      }
      
      stats.currentBalance = tx.runningBalance || 0;
    }
    
    // Calculate unrealized cost basis from remaining lots
    for (const lot of allLots) {
      if (lot.remainingAmount > 0 && coinStats[lot.coin]) {
        coinStats[lot.coin].unrealizedCostBasis += 
          lot.remainingAmount * lot.costPerUnit + 
          (lot.remainingAmount / lot.originalAmount) * lot.fee;
      }
    }
    
    const coinSummaries = Object.values(coinStats);
    const totalGains = coinSummaries
      .filter(c => c.realizedGainOrLoss > 0)
      .reduce((sum, c) => sum + c.realizedGainOrLoss, 0);
    const totalLosses = Math.abs(
      coinSummaries
        .filter(c => c.realizedGainOrLoss < 0)
        .reduce((sum, c) => sum + c.realizedGainOrLoss, 0)
    );
    
    const [startYear] = taxYear.split('/').map(Number);
    const endYear = startYear + 1;
    
    return {
      taxYear,
      startDate: new Date(startYear, 2, 1),
      endDate: new Date(endYear, 1, 28),
      transactions: txs,
      coinSummaries,
      totalRealizedGains: totalGains,
      totalRealizedLosses: totalLosses,
      netGainOrLoss: totalGains - totalLosses,
    };
  }).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

/**
 * Parse pasted Excel/CSV data into raw transactions
 */
export function parseExcelPaste(text: string): RawTransaction[] {
  const lines = text.trim().split('\n');
  const transactions: RawTransaction[] = [];
  
  // Try to detect if first line is header
  const firstLine = lines[0].toLowerCase();
  const hasHeader = firstLine.includes('date') || 
                   firstLine.includes('type') || 
                   firstLine.includes('coin');
  
  const dataLines = hasHeader ? lines.slice(1) : lines;
  
  for (const line of dataLines) {
    if (!line.trim()) continue;
    
    // Split by tab or comma
    const parts = line.includes('\t') 
      ? line.split('\t') 
      : line.split(',').map(p => p.trim());
    
    if (parts.length < 5) continue;
    
    try {
      const [date, type, coin, amountStr, priceStr, totalStr, feeStr, notes] = parts;
      
      const amount = parseFloat(amountStr.replace(/[^\d.-]/g, ''));
      const pricePerUnit = parseFloat(priceStr.replace(/[^\d.-]/g, ''));
      const totalValue = totalStr 
        ? parseFloat(totalStr.replace(/[^\d.-]/g, '')) 
        : amount * pricePerUnit;
      const fee = feeStr ? parseFloat(feeStr.replace(/[^\d.-]/g, '')) : 0;
      
      const txType = type.toUpperCase().trim() as 'BUY' | 'SELL' | 'TRADE';
      
      if (!['BUY', 'SELL', 'TRADE'].includes(txType)) continue;
      if (isNaN(amount) || isNaN(pricePerUnit)) continue;
      
      transactions.push({
        date: date.trim(),
        type: txType,
        coin: coin.trim().toUpperCase(),
        amount,
        pricePerUnit,
        totalValue,
        fee: isNaN(fee) ? 0 : fee,
        notes: notes?.trim(),
      });
    } catch (e) {
      console.warn('Failed to parse line:', line, e);
    }
  }
  
  return transactions;
}

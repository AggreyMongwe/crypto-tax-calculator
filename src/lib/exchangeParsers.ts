// Exchange-specific CSV parsers for Luno, VALR, and Binance

import { RawTransaction, TransactionType } from '@/types/crypto';

export type ExchangeFormat = 'luno' | 'valr' | 'binance' | 'generic' | 'unknown';

export interface ParseResult {
  transactions: RawTransaction[];
  exchange: ExchangeFormat;
  errors: string[];
}

/**
 * Detect which exchange format a CSV file is from based on headers
 */
export function detectExchangeFormat(headers: string[]): ExchangeFormat {
  const headerLower = headers.map(h => h.toLowerCase().trim());
  
  // Luno headers: Timestamp, Type, Asset, Amount, Balance, Description
  if (headerLower.includes('timestamp') && headerLower.includes('balance') && headerLower.includes('description')) {
    return 'luno';
  }
  
  // VALR headers: Date, Type, Currency, Amount, Balance, Fee, Order ID
  if (headerLower.includes('order id') || (headerLower.includes('currency') && headerLower.includes('fee'))) {
    return 'valr';
  }
  
  // Binance headers: Date(UTC), Pair, Type, Side, Price, Amount, Total, Fee, Fee Coin
  if (headerLower.includes('pair') || headerLower.includes('fee coin') || headerLower.includes('side')) {
    return 'binance';
  }
  
  // Generic format: Date, Type, Coin, Amount, Price, Total, Fee
  if (headerLower.includes('date') && headerLower.includes('type') && headerLower.includes('coin')) {
    return 'generic';
  }
  
  return 'unknown';
}

/**
 * Parse CSV text into rows
 */
function parseCSVRows(text: string): string[][] {
  const lines = text.trim().split('\n');
  return lines.map(line => {
    // Handle quoted values with commas
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if ((char === ',' || char === '\t') && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    
    return result;
  });
}

/**
 * Parse Luno CSV format
 * Headers: Timestamp, Type, Asset, Amount, Balance, Description
 */
function parseLuno(rows: string[][], headers: string[]): ParseResult {
  const transactions: RawTransaction[] = [];
  const errors: string[] = [];
  
  const timestampIdx = headers.findIndex(h => h.toLowerCase() === 'timestamp');
  const typeIdx = headers.findIndex(h => h.toLowerCase() === 'type');
  const assetIdx = headers.findIndex(h => h.toLowerCase() === 'asset');
  const amountIdx = headers.findIndex(h => h.toLowerCase() === 'amount');
  const descIdx = headers.findIndex(h => h.toLowerCase() === 'description');
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 4) continue;
    
    try {
      const timestamp = row[timestampIdx];
      const type = row[typeIdx]?.toUpperCase();
      const asset = row[assetIdx];
      const amount = parseFloat(row[amountIdx]?.replace(/[^\d.-]/g, '') || '0');
      const description = row[descIdx] || '';
      
      // Skip ZAR transactions (fiat), fees, and non-trade entries
      if (asset === 'ZAR' || type === 'FEE') continue;
      
      // Map Luno types to our types
      let txType: TransactionType | null = null;
      if (type === 'BUY' || type === 'RECEIVE' || description.toLowerCase().includes('bought')) {
        txType = 'BUY';
      } else if (type === 'SELL' || type === 'SEND' || description.toLowerCase().includes('sold')) {
        txType = 'SELL';
      } else if (type === 'TRADE') {
        txType = 'TRADE';
      }
      
      if (!txType || isNaN(amount) || amount === 0) continue;
      
      // Extract price from description if available (e.g., "Bought 0.001 BTC at R 850,000.00")
      let pricePerUnit = 0;
      const priceMatch = description.match(/at\s*R?\s*([\d,]+(?:\.\d+)?)/i);
      if (priceMatch) {
        pricePerUnit = parseFloat(priceMatch[1].replace(/,/g, ''));
      }
      
      transactions.push({
        date: timestamp,
        type: txType,
        coin: asset,
        amount: Math.abs(amount),
        pricePerUnit,
        totalValue: Math.abs(amount) * pricePerUnit,
        fee: 0,
        notes: `Luno: ${description}`,
      });
    } catch (e) {
      errors.push(`Row ${i + 1}: Failed to parse`);
    }
  }
  
  return { transactions, exchange: 'luno', errors };
}

/**
 * Parse VALR CSV format
 * Headers: Date, Type, Currency, Amount, Balance, Fee, Order ID
 */
function parseVALR(rows: string[][], headers: string[]): ParseResult {
  const transactions: RawTransaction[] = [];
  const errors: string[] = [];
  
  const dateIdx = headers.findIndex(h => h.toLowerCase() === 'date');
  const typeIdx = headers.findIndex(h => h.toLowerCase() === 'type');
  const currencyIdx = headers.findIndex(h => h.toLowerCase() === 'currency');
  const amountIdx = headers.findIndex(h => h.toLowerCase() === 'amount');
  const feeIdx = headers.findIndex(h => h.toLowerCase() === 'fee');
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 4) continue;
    
    try {
      const date = row[dateIdx];
      const type = row[typeIdx]?.toUpperCase();
      const currency = row[currencyIdx];
      const amount = parseFloat(row[amountIdx]?.replace(/[^\d.-]/g, '') || '0');
      const fee = parseFloat(row[feeIdx]?.replace(/[^\d.-]/g, '') || '0');
      
      // Skip ZAR and non-trade entries
      if (currency === 'ZAR') continue;
      
      let txType: TransactionType | null = null;
      if (type === 'BUY' || type === 'DEPOSIT' || type === 'CREDIT') {
        txType = 'BUY';
      } else if (type === 'SELL' || type === 'WITHDRAWAL' || type === 'DEBIT') {
        txType = 'SELL';
      } else if (type === 'TRADE') {
        txType = 'TRADE';
      }
      
      if (!txType || isNaN(amount) || amount === 0) continue;
      
      transactions.push({
        date,
        type: txType,
        coin: currency,
        amount: Math.abs(amount),
        pricePerUnit: 0, // VALR exports may need price lookup
        totalValue: 0,
        fee: isNaN(fee) ? 0 : Math.abs(fee),
        notes: 'VALR import',
      });
    } catch (e) {
      errors.push(`Row ${i + 1}: Failed to parse`);
    }
  }
  
  return { transactions, exchange: 'valr', errors };
}

/**
 * Parse Binance CSV format
 * Headers: Date(UTC), Pair, Type, Side, Price, Amount, Total, Fee, Fee Coin
 */
function parseBinance(rows: string[][], headers: string[]): ParseResult {
  const transactions: RawTransaction[] = [];
  const errors: string[] = [];
  
  const dateIdx = headers.findIndex(h => h.toLowerCase().includes('date'));
  const pairIdx = headers.findIndex(h => h.toLowerCase() === 'pair');
  const sideIdx = headers.findIndex(h => h.toLowerCase() === 'side');
  const priceIdx = headers.findIndex(h => h.toLowerCase() === 'price');
  const amountIdx = headers.findIndex(h => h.toLowerCase() === 'amount');
  const totalIdx = headers.findIndex(h => h.toLowerCase() === 'total');
  const feeIdx = headers.findIndex(h => h.toLowerCase() === 'fee');
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 5) continue;
    
    try {
      const date = row[dateIdx];
      const pair = row[pairIdx] || '';
      const side = row[sideIdx]?.toUpperCase();
      const price = parseFloat(row[priceIdx]?.replace(/[^\d.-]/g, '') || '0');
      const amount = parseFloat(row[amountIdx]?.replace(/[^\d.-]/g, '') || '0');
      const total = parseFloat(row[totalIdx]?.replace(/[^\d.-]/g, '') || '0');
      const fee = parseFloat(row[feeIdx]?.replace(/[^\d.-]/g, '') || '0');
      
      // Extract base coin from pair (e.g., BTCUSDT -> BTC)
      const coin = pair.replace(/(USDT|BUSD|ZAR|USD|EUR|BTC|ETH)$/, '') || pair;
      
      let txType: TransactionType | null = null;
      if (side === 'BUY') {
        txType = 'BUY';
      } else if (side === 'SELL') {
        txType = 'SELL';
      }
      
      if (!txType || isNaN(amount) || amount === 0) continue;
      
      transactions.push({
        date,
        type: txType,
        coin,
        amount: Math.abs(amount),
        pricePerUnit: price,
        totalValue: total || (amount * price),
        fee: isNaN(fee) ? 0 : Math.abs(fee),
        notes: `Binance: ${pair}`,
      });
    } catch (e) {
      errors.push(`Row ${i + 1}: Failed to parse`);
    }
  }
  
  return { transactions, exchange: 'binance', errors };
}

/**
 * Parse generic CSV format (our standard format)
 */
function parseGeneric(rows: string[][], headers: string[]): ParseResult {
  const transactions: RawTransaction[] = [];
  const errors: string[] = [];
  
  const dateIdx = headers.findIndex(h => h.toLowerCase() === 'date');
  const typeIdx = headers.findIndex(h => h.toLowerCase() === 'type');
  const coinIdx = headers.findIndex(h => h.toLowerCase() === 'coin');
  const amountIdx = headers.findIndex(h => h.toLowerCase() === 'amount');
  const priceIdx = headers.findIndex(h => h.toLowerCase().includes('price'));
  const totalIdx = headers.findIndex(h => h.toLowerCase().includes('total'));
  const feeIdx = headers.findIndex(h => h.toLowerCase() === 'fee');
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 4) continue;
    
    try {
      const date = row[dateIdx];
      const type = row[typeIdx]?.toUpperCase() as TransactionType;
      const coin = row[coinIdx];
      const amount = parseFloat(row[amountIdx]?.replace(/[^\d.-]/g, '') || '0');
      const price = parseFloat(row[priceIdx]?.replace(/[^\d.-]/g, '') || '0');
      const total = parseFloat(row[totalIdx]?.replace(/[^\d.-]/g, '') || '0');
      const fee = parseFloat(row[feeIdx]?.replace(/[^\d.-]/g, '') || '0');
      
      if (!['BUY', 'SELL', 'TRADE'].includes(type)) continue;
      if (isNaN(amount) || amount === 0) continue;
      
      transactions.push({
        date,
        type,
        coin: coin.toUpperCase(),
        amount: Math.abs(amount),
        pricePerUnit: price,
        totalValue: total || (amount * price),
        fee: isNaN(fee) ? 0 : Math.abs(fee),
      });
    } catch (e) {
      errors.push(`Row ${i + 1}: Failed to parse`);
    }
  }
  
  return { transactions, exchange: 'generic', errors };
}

/**
 * Main parser function - detects format and parses accordingly
 */
export function parseExchangeCSV(text: string): ParseResult {
  const rows = parseCSVRows(text);
  
  if (rows.length < 2) {
    return { transactions: [], exchange: 'unknown', errors: ['File appears to be empty or invalid'] };
  }
  
  const headers = rows[0];
  const format = detectExchangeFormat(headers);
  
  switch (format) {
    case 'luno':
      return parseLuno(rows, headers);
    case 'valr':
      return parseVALR(rows, headers);
    case 'binance':
      return parseBinance(rows, headers);
    case 'generic':
      return parseGeneric(rows, headers);
    default:
      // Try generic as fallback
      const result = parseGeneric(rows, headers);
      if (result.transactions.length > 0) {
        return result;
      }
      return { 
        transactions: [], 
        exchange: 'unknown', 
        errors: ['Could not detect exchange format. Please use the standard format: Date, Type, Coin, Amount, Price, Total, Fee'] 
      };
  }
}

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

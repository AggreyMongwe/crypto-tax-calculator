import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RawTransaction {
  date: string;
  type: 'BUY' | 'SELL' | 'TRADE';
  coin: string;
  amount: number;
  pricePerUnit: number;
  totalValue: number;
  fee?: number;
  notes?: string;
}

interface CryptoLot {
  id: string;
  purchaseDate: Date;
  coin: string;
  originalAmount: number;
  remainingAmount: number;
  costPerUnit: number;
  totalCost: number;
  fee: number;
}

interface LotMatch {
  lotId: string;
  purchaseDate: Date;
  amountUsed: number;
  costBasis: number;
  proceedsFromSale: number;
  gainOrLoss: number;
  holdingPeriodDays: number;
}

interface ProcessedTransaction {
  id: string;
  date: string;
  dateObj: Date;
  type: 'BUY' | 'SELL' | 'TRADE';
  coin: string;
  amount: number;
  pricePerUnit: number;
  totalValue: number;
  fee?: number;
  notes?: string;
  taxYear: string;
  lotMatches?: LotMatch[];
  totalCostBasis?: number;
  totalProceeds?: number;
  totalGainOrLoss?: number;
  runningBalance?: number;
}

interface CoinSummary {
  coin: string;
  totalBought: number;
  totalSold: number;
  currentBalance: number;
  totalCostBasis: number;
  totalProceeds: number;
  realizedGainOrLoss: number;
  unrealizedCostBasis: number;
}

interface TaxYearSummary {
  taxYear: string;
  startDate: Date;
  endDate: Date;
  coinSummaries: CoinSummary[];
  totalRealizedGains: number;
  totalRealizedLosses: number;
  netGainOrLoss: number;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function getTaxYearForDate(date: Date): { label: string; startDate: Date; endDate: Date } {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  const taxYearStart = month >= 2 ? year : year - 1;
  const taxYearEnd = taxYearStart + 1;
  
  const startDate = new Date(taxYearStart, 2, 1);
  const isLeapYear = (taxYearEnd % 4 === 0 && taxYearEnd % 100 !== 0) || (taxYearEnd % 400 === 0);
  const endDate = new Date(taxYearEnd, 1, isLeapYear ? 29 : 28);
  
  return {
    label: `${taxYearStart}/${taxYearEnd}`,
    startDate,
    endDate,
  };
}

function parseTransactions(raw: RawTransaction[]): ProcessedTransaction[] {
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

function processTransactionsFIFO(transactions: ProcessedTransaction[]) {
  const sorted = [...transactions].sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  
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
    } else if (tx.type === 'SELL' || tx.type === 'TRADE') {
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
      
      const sellFee = tx.type === 'SELL' ? (tx.fee || 0) : 0;
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
    }
  }
  
  const allLots: CryptoLot[] = Object.values(lotsByCoin).flat();
  const taxYearSummaries = calculateTaxYearSummaries(processedTransactions, allLots);
  
  return {
    lots: allLots,
    processedTransactions,
    taxYearSummaries,
    currentBalances: balances,
  };
}

function calculateTaxYearSummaries(
  transactions: ProcessedTransaction[],
  allLots: CryptoLot[]
): TaxYearSummary[] {
  const byTaxYear: Record<string, ProcessedTransaction[]> = {};
  
  for (const tx of transactions) {
    if (!byTaxYear[tx.taxYear]) {
      byTaxYear[tx.taxYear] = [];
    }
    byTaxYear[tx.taxYear].push(tx);
  }
  
  return Object.entries(byTaxYear).map(([taxYear, txs]) => {
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
      coinSummaries,
      totalRealizedGains: totalGains,
      totalRealizedLosses: totalLosses,
      netGainOrLoss: totalGains - totalLosses,
    };
  }).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub as string;
    const { transactions, sessionName } = await req.json();

    if (!transactions || !Array.isArray(transactions)) {
      return new Response(
        JSON.stringify({ error: 'Invalid transactions data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${transactions.length} transactions for user ${userId}`);

    // Parse and process with FIFO
    const parsed = parseTransactions(transactions);
    const result = processTransactionsFIFO(parsed);

    console.log(`FIFO calculation complete. Tax years: ${result.taxYearSummaries.map(s => s.taxYear).join(', ')}`);

    // Create a new session
    const { data: session, error: sessionError } = await supabase
      .from('transaction_sessions')
      .insert({
        user_id: userId,
        name: sessionName || `Import ${new Date().toLocaleDateString('en-ZA')}`,
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create session', details: sessionError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert transactions
    const transactionRows = transactions.map((tx: RawTransaction) => ({
      session_id: session.id,
      user_id: userId,
      date: tx.date,
      type: tx.type,
      coin: tx.coin.toUpperCase(),
      amount: tx.amount,
      price_per_unit: tx.pricePerUnit,
      total_value: tx.totalValue,
      fee: tx.fee || 0,
      notes: tx.notes,
    }));

    const { error: txError } = await supabase
      .from('transactions')
      .insert(transactionRows);

    if (txError) {
      console.error('Transaction insert error:', txError);
      return new Response(
        JSON.stringify({ error: 'Failed to save transactions', details: txError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save calculated results per tax year per coin
    const resultRows: any[] = [];
    for (const summary of result.taxYearSummaries) {
      for (const coin of summary.coinSummaries) {
        resultRows.push({
          session_id: session.id,
          user_id: userId,
          tax_year: summary.taxYear,
          coin: coin.coin,
          total_bought: coin.totalBought,
          total_sold: coin.totalSold,
          current_balance: coin.currentBalance,
          total_cost_basis: coin.totalCostBasis,
          total_proceeds: coin.totalProceeds,
          realized_gain_or_loss: coin.realizedGainOrLoss,
          unrealized_cost_basis: coin.unrealizedCostBasis,
        });
      }
    }

    if (resultRows.length > 0) {
      const { error: resultsError } = await supabase
        .from('calculated_results')
        .insert(resultRows);

      if (resultsError) {
        console.error('Results insert error:', resultsError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sessionId: session.id,
        processedTransactions: result.processedTransactions,
        taxYearSummaries: result.taxYearSummaries,
        currentBalances: result.currentBalances,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('FIFO calculation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

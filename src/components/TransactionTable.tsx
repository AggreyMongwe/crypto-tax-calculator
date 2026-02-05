import { useState, Fragment } from 'react';
import { ProcessedTransaction, LotMatch } from '@/types/crypto';
import { formatDate, formatZAR, formatCrypto } from '@/lib/taxYears';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  ShoppingCart,
  ReceiptText
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Interfaces ---

interface TransactionTableProps {
  transactions: ProcessedTransaction[];
  taxYearFilter?: string;
}

interface FIFOBreakdownProps {
  lotMatches: LotMatch[];
  coin: string;
  totalCostBasis: number;
  totalProceeds: number;
  totalGainOrLoss: number;
}

// --- Main Component ---

export function TransactionTable({ transactions, taxYearFilter }: TransactionTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);

  const filteredTransactions = taxYearFilter
    ? transactions.filter(t => t.taxYear === taxYearFilter)
    : transactions;

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedRows(newExpanded);
  };

  const toggleAllRows = () => {
    if (allExpanded) {
      setExpandedRows(new Set());
    } else {
      const sellAndTradeIds = filteredTransactions
        .filter(t => t.type === 'SELL' || t.type === 'TRADE')
        .map(t => t.id);
      setExpandedRows(new Set(sellAndTradeIds));
    }
    setAllExpanded(!allExpanded);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'BUY': return <ShoppingCart className="h-3.5 w-3.5" />;
      case 'SELL': return <TrendingUp className="h-3.5 w-3.5" />;
      case 'TRADE': return <ArrowRightLeft className="h-3.5 w-3.5" />;
      default: return null;
    }
  };

  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'BUY': return "bg-[#8C9F8B] text-white border-none shadow-sm";
      case 'SELL': return "bg-[#017792] text-white border-none shadow-sm";
      case 'TRADE': return "bg-[#E6C5C9] text-[#664A48] border-none shadow-sm";
      default: return "";
    }
  };

  const hasExpandableContent = (tx: ProcessedTransaction) => {
    return (tx.type === 'SELL' || tx.type === 'TRADE') && tx.lotMatches && tx.lotMatches.length > 0;
  };

  return (
    <Card className="border-none shadow-xl bg-white overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-[#F8F8F8] bg-white p-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#A6DDDF]/30 rounded-lg text-[#017792]">
            <ReceiptText size={20} />
          </div>
          <CardTitle className="text-xl font-black text-[#664A48]">Transaction Ledger</CardTitle>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleAllRows}
          className="border-[#A6DDDF] text-[#017792] hover:bg-[#A6DDDF]/20 rounded-xl transition-all active:scale-95 shadow-sm"
        >
          {allExpanded ? (
            <><ChevronsDownUp className="h-4 w-4 mr-2" /> Collapse All</>
          ) : (
            <><ChevronsUpDown className="h-4 w-4 mr-2" /> Expand Calculations</>
          )}
        </Button>
      </CardHeader>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#F8F8F8]">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-12"></TableHead>
              <TableHead className="text-[#664A48]/70 font-bold uppercase text-[10px] tracking-widest">Date</TableHead>
              <TableHead className="text-[#664A48]/70 font-bold uppercase text-[10px] tracking-widest">Type</TableHead>
              <TableHead className="text-[#664A48]/70 font-bold uppercase text-[10px] tracking-widest">Asset</TableHead>
              <TableHead className="text-right text-[#664A48]/70 font-bold uppercase text-[10px] tracking-widest">Amount</TableHead>
              <TableHead className="text-right text-[#664A48]/70 font-bold uppercase text-[10px] tracking-widest">Value (ZAR)</TableHead>
              <TableHead className="text-right text-[#664A48]/70 font-bold uppercase text-[10px] tracking-widest">Gain/Loss</TableHead>
              <TableHead className="text-right text-[#664A48]/70 font-bold uppercase text-[10px] tracking-widest">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((tx) => (
              <Fragment key={tx.id}>
                <TableRow
                  className={cn(
                    "group transition-colors border-b border-[#F8F8F8]",
                    hasExpandableContent(tx) && "cursor-pointer hover:bg-[#A6DDDF]/5",
                    expandedRows.has(tx.id) && "bg-[#A6DDDF]/10"
                  )}
                  onClick={() => hasExpandableContent(tx) && toggleRow(tx.id)}
                >
                  <TableCell className="text-center">
                    {hasExpandableContent(tx) && (
                      <div className={cn(
                        "transition-transform duration-200",
                        expandedRows.has(tx.id) ? "rotate-90" : "rotate-0"
                      )}>
                        <ChevronRight className="h-4 w-4 text-[#017792]" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-[#664A48] font-medium text-sm">
                    {formatDate(tx.dateObj)}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("gap-1.5 px-2.5 py-0.5 rounded-full font-bold", getBadgeClass(tx.type))}>
                      {getTypeIcon(tx.type)}
                      {tx.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-black text-[#017792]">{tx.coin}</span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-bold text-[#664A48]">
                    {formatCrypto(tx.amount)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-[#664A48]">
                    {formatZAR(tx.totalValue)}
                  </TableCell>
                  <TableCell className="text-right">
                    {tx.totalGainOrLoss !== undefined ? (
                      <span className={cn(
                        "font-mono font-black text-xs inline-flex items-center gap-1",
                        tx.totalGainOrLoss >= 0 ? "text-[#017792]" : "text-red-500"
                      )}>
                        {tx.totalGainOrLoss >= 0 ? '+' : '-'}{formatZAR(Math.abs(tx.totalGainOrLoss))}
                      </span>
                    ) : (
                      <span className="text-[#664A48]/30">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono text-[10px] text-[#664A48]/40">
                    {formatCrypto(tx.runningBalance || 0)}
                  </TableCell>
                </TableRow>

                <AnimatePresence>
                  {expandedRows.has(tx.id) && tx.lotMatches && (
                    <TableRow className="hover:bg-transparent border-none">
                      <TableCell colSpan={8} className="p-0">
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-[#F8F8F8]/50"
                        >
                          <FIFOBreakdown
                            lotMatches={tx.lotMatches}
                            coin={tx.coin}
                            totalCostBasis={tx.totalCostBasis || 0}
                            totalProceeds={tx.totalProceeds || 0}
                            totalGainOrLoss={tx.totalGainOrLoss || 0}
                          />
                        </motion.div>
                      </TableCell>
                    </TableRow>
                  )}
                </AnimatePresence>
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

// --- Sub-Component ---

function FIFOBreakdown({ lotMatches, coin, totalCostBasis, totalProceeds, totalGainOrLoss }: FIFOBreakdownProps) {
  return (
    <div className="p-6 space-y-4 border-l-4 border-[#017792] ml-4 my-2">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-tighter text-[#017792]">
        <ReceiptText size={14} />
        SARS FIFO Cost-Basis Match
      </div>

      <div className="bg-white rounded-xl border border-[#A6DDDF]/40 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-[#A6DDDF]/10">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="text-[10px] font-black uppercase text-[#664A48]/60">Lot</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-[#664A48]/60">Purchased</TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase text-[#664A48]/60">Amount Used</TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase text-[#664A48]/60">Cost Basis</TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase text-[#664A48]/60">Gain/Loss</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lotMatches.map((match, idx) => (
              <TableRow key={match.lotId} className="hover:bg-[#F8F8F8]/50 text-xs border-b border-[#F8F8F8]">
                <TableCell className="font-mono text-[#017792]">#{idx + 1}</TableCell>
                <TableCell className="font-bold text-[#664A48]">{formatDate(match.purchaseDate)}</TableCell>
                <TableCell className="text-right font-mono text-[#664A48]">{formatCrypto(match.amountUsed)} {coin}</TableCell>
                <TableCell className="text-right font-mono text-[#664A48]">{formatZAR(match.costBasis)}</TableCell>
                <TableCell className={cn(
                  "text-right font-mono font-black",
                  match.gainOrLoss >= 0 ? "text-[#017792]" : "text-red-500"
                )}>
                  {match.gainOrLoss >= 0 ? '+' : ''}{formatZAR(match.gainOrLoss)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#F8F8F8] p-3 rounded-xl border border-[#A6DDDF]/20">
          <p className="text-[10px] font-bold text-[#664A48]/40 uppercase">Total Cost</p>
          <p className="font-mono text-sm font-bold text-[#664A48]">{formatZAR(totalCostBasis)}</p>
        </div>
        <div className="bg-[#F8F8F8] p-3 rounded-xl border border-[#A6DDDF]/20">
          <p className="text-[10px] font-bold text-[#664A48]/40 uppercase">Total Proceeds</p>
          <p className="font-mono text-sm font-bold text-[#664A48]">{formatZAR(totalProceeds)}</p>
        </div>
        <div className={cn(
          "p-3 rounded-xl border",
          totalGainOrLoss >= 0 ? "bg-[#A6DDDF]/20 border-[#017792]/20" : "bg-red-50 border-red-100"
        )}>
          <p className="text-[10px] font-bold text-[#664A48]/40 uppercase">Net Result</p>
          <p className={cn("font-mono text-sm font-black", totalGainOrLoss >= 0 ? "text-[#017792]" : "text-red-500")}>
            {formatZAR(totalGainOrLoss)}
          </p>
        </div>
      </div>
    </div>
  );
}
import { TaxYearSummary, CoinSummary } from '@/types/crypto';
import { formatZAR, formatCrypto } from '@/lib/taxYears';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Coins,
  PiggyBank,
  Calculator
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Interfaces ---

interface SummaryDashboardProps {
  taxYearSummaries: TaxYearSummary[];
  currentBalances: Record<string, number>;
  selectedTaxYear?: string;
}

interface StatCardProps {
  title: string;
  subtitle: string;
  value: number;
  isMonetary?: boolean;
  variant?: 'default' | 'gain' | 'loss';
  icon: React.ReactNode;
}

interface CoinCardProps {
  summary: CoinSummary;
}

// --- Main Component ---

export function SummaryDashboard({
  taxYearSummaries,
  currentBalances,
  selectedTaxYear
}: SummaryDashboardProps) {
  const selectedSummary = selectedTaxYear
    ? taxYearSummaries.find(s => s.taxYear === selectedTaxYear)
    : taxYearSummaries[taxYearSummaries.length - 1];

  const totalNetGainLoss = taxYearSummaries.reduce((sum, s) => sum + s.netGainOrLoss, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Overall Stats Grid */}
      <div className="grid gap-6 md:grid-cols-4">
        <StatCard
          title="Net Gain/Loss"
          subtitle={selectedTaxYear || "All Time"}
          value={selectedSummary ? selectedSummary.netGainOrLoss : totalNetGainLoss}
          isMonetary
          icon={<Calculator className="h-5 w-5" />}
        />
        <StatCard
          title="Total Gains"
          subtitle={selectedTaxYear || "All Time"}
          value={selectedSummary?.totalRealizedGains || 0}
          isMonetary
          variant="gain"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          title="Total Losses"
          subtitle={selectedTaxYear || "All Time"}
          value={selectedSummary?.totalRealizedLosses || 0}
          isMonetary
          variant="loss"
          icon={<TrendingDown className="h-5 w-5" />}
        />
        <StatCard
          title="Coins Traded"
          subtitle="Unique assets"
          value={Object.keys(currentBalances).length}
          icon={<Coins className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Current Holdings List */}
        <Card className="lg:col-span-1 border-none shadow-xl bg-white overflow-hidden">
          <div className="h-1.5 bg-[#017792]" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-[#664A48]">
              <Wallet className="h-5 w-5 text-[#017792]" />
              Current Holdings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(currentBalances)
              .filter(([_, balance]) => balance > 0.00000001)
              .map(([coin, balance]) => (
                <motion.div
                  whileHover={{ x: 5 }}
                  key={coin}
                  className="flex items-center justify-between p-3 bg-[#F8F8F8] border border-[#A6DDDF]/30 rounded-xl"
                >
                  <span className="font-bold text-[#017792]">{coin}</span>
                  <span className="font-mono text-sm text-[#664A48]">{formatCrypto(balance)}</span>
                </motion.div>
              ))}
          </CardContent>
        </Card>

        {/* Per-Coin Cards */}
        <div className="lg:col-span-2 space-y-6">
          {selectedSummary && (
            <Card className="border-none shadow-xl bg-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg text-[#664A48]">
                  <PiggyBank className="h-5 w-5 text-[#017792]" />
                  Asset Breakdown
                </CardTitle>
                <Badge className="bg-[#A6DDDF] text-[#017792] border-none font-bold">
                  FY {selectedSummary.taxYear}
                </Badge>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {selectedSummary.coinSummaries.map((coin) => (
                  <CoinCard key={coin.coin} summary={coin} />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Sub-Components ---

function StatCard({ title, subtitle, value, isMonetary, variant = 'default', icon }: StatCardProps) {
  return (
    <motion.div whileHover={{ y: -5 }}>
      <Card className="h-full border-none shadow-lg bg-white overflow-hidden group">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-[#664A48]/50">{title}</p>
              <p className="text-[10px] font-bold text-[#017792] px-2 py-0.5 bg-[#A6DDDF]/30 rounded-full inline-block uppercase">
                {subtitle}
              </p>
            </div>
            <div className="p-2 bg-[#F8F8F8] rounded-lg text-[#017792] group-hover:bg-[#017792] group-hover:text-white transition-colors">
              {icon}
            </div>
          </div>
          <div className={cn(
            "mt-5 font-mono text-2xl font-black",
            !isMonetary ? "text-[#664A48]" : value >= 0 ? "text-[#017792]" : "text-red-500"
          )}>
            {isMonetary ? formatZAR(value) : value}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CoinCard({ summary }: CoinCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-4 rounded-2xl bg-white border border-[#A6DDDF]/40 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#017792] flex items-center justify-center text-white text-xs font-bold">
            {summary.coin.slice(0, 1)}
          </div>
          <span className="font-black text-[#664A48]">{summary.coin}</span>
        </div>
        <Badge className={cn(
          "font-mono border-none shadow-sm",
          summary.realizedGainOrLoss >= 0 ? "bg-[#8C9F8B] text-white" : "bg-red-100 text-red-600"
        )}>
          {summary.realizedGainOrLoss >= 0 ? '+' : ''}{formatZAR(summary.realizedGainOrLoss)}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-[#664A48]/60 uppercase font-bold">Net Holding</span>
          <span className="font-mono font-bold text-[#017792]">{formatCrypto(summary.currentBalance)}</span>
        </div>
        <div className="h-1.5 w-full bg-[#F8F8F8] rounded-full overflow-hidden flex">
          <div className="bg-[#8C9F8B] h-full" style={{ width: '60%' }} /> {/* Placeholder Ratio */}
          <div className="bg-[#017792] h-full" style={{ width: '40%' }} />
        </div>
      </div>
    </motion.div>
  );
}
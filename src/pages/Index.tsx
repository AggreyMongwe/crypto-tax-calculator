import { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/Header';
import { TransactionInput } from '@/components/TransactionInput';
import { FileUpload } from '@/components/FileUpload';
import { TransactionTable } from '@/components/TransactionTable';
import { SummaryDashboard } from '@/components/SummaryDashboard';
import { TaxYearSelector } from '@/components/TaxYearSelector';
import { RawTransaction, PortfolioState } from '@/types/crypto';
import { parseTransactions, processTransactionsFIFO } from '@/lib/fifoCalculator';
import { getTaxYearsInRange, TaxYear } from '@/lib/taxYears';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Info, FileSpreadsheet, Upload, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [rawTransactions, setRawTransactions] = useState<RawTransaction[] | null>(null);
  const [selectedTaxYear, setSelectedTaxYear] = useState<string | null>(null);
  const [loadingSession, setLoadingSession] = useState(false);

  // Check for session to load on mount
  useEffect(() => {
    const loadSession = async () => {
      const sessionId = sessionStorage.getItem('loadSessionId');
      if (!sessionId) return;
      
      sessionStorage.removeItem('loadSessionId');
      setLoadingSession(true);
      
      try {
        const { data: transactions, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('session_id', sessionId)
          .order('date', { ascending: true });

        if (error) throw error;

        if (transactions && transactions.length > 0) {
          const raw: RawTransaction[] = transactions.map(tx => ({
            date: tx.date,
            type: tx.type as 'BUY' | 'SELL' | 'TRADE',
            coin: tx.coin,
            amount: Number(tx.amount),
            pricePerUnit: Number(tx.price_per_unit),
            totalValue: Number(tx.total_value),
            fee: tx.fee ? Number(tx.fee) : 0,
            notes: tx.notes || undefined,
          }));
          setRawTransactions(raw);
          toast({
            title: 'Session loaded',
            description: `Loaded ${raw.length} transactions`,
          });
        }
      } catch (err) {
        console.error('Failed to load session:', err);
        toast({
          title: 'Failed to load session',
          description: 'Please try again',
          variant: 'destructive',
        });
      } finally {
        setLoadingSession(false);
      }
    };

    loadSession();
  }, [toast]);

  // Process transactions when raw data changes
  const portfolioState: PortfolioState | null = useMemo(() => {
    if (!rawTransactions || rawTransactions.length === 0) return null;
    const parsed = parseTransactions(rawTransactions);
    return processTransactionsFIFO(parsed);
  }, [rawTransactions]);

  // Get available tax years
  const taxYears: TaxYear[] = useMemo(() => {
    if (!portfolioState) return [];
    return getTaxYearsInRange(portfolioState.processedTransactions);
  }, [portfolioState]);

  const handleTransactionsParsed = (transactions: RawTransaction[]) => {
    setRawTransactions(transactions);
    setSelectedTaxYear(null);
  };

  const handleServerProcessed = (result: any) => {
    // Server returns already processed data, but we need raw for local state
    // The server response includes processedTransactions which we can use
    if (result.processedTransactions) {
      // Convert server processed transactions back to raw format for consistency
      const raw: RawTransaction[] = result.processedTransactions.map((tx: any) => ({
        date: tx.date,
        type: tx.type,
        coin: tx.coin,
        amount: tx.amount,
        pricePerUnit: tx.pricePerUnit,
        totalValue: tx.totalValue,
        fee: tx.fee,
        notes: tx.notes,
      }));
      setRawTransactions(raw);
      setSelectedTaxYear(null);
    }
  };

  const handleReset = () => {
    setRawTransactions(null);
    setSelectedTaxYear(null);
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading session...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {!portfolioState ? (
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4 py-8">
              <h2 className="text-4xl font-bold tracking-tight">
                Calculate Your Crypto <span className="text-primary">Capital Gains</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Use the SARS-required FIFO method to calculate your cryptocurrency 
                capital gains and losses for South African tax purposes.
              </p>
            </div>

            {/* Info Box */}
            <Alert className="bg-accent/50 border-accent">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>How it works:</strong> Paste your transaction history from Excel or any 
                spreadsheet. The calculator will apply the First-In, First-Out (FIFO) method 
                to determine your cost basis and calculate capital gains or losses per tax year 
                (March 1 – February 28/29).
              </AlertDescription>
            </Alert>

            <Tabs defaultValue="paste" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="paste" className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Paste from Excel
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload CSV
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="paste">
                <TransactionInput 
                  onTransactionsParsed={handleTransactionsParsed} 
                  onServerProcessed={handleServerProcessed}
                />
              </TabsContent>
              
              <TabsContent value="upload">
                <FileUpload onTransactionsParsed={handleTransactionsParsed} />
              </TabsContent>
            </Tabs>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 py-8">
              <FeatureCard 
                title="FIFO Compliant"
                description="Automatic First-In, First-Out calculation as required by SARS"
              />
              <FeatureCard 
                title="Tax Year Breakdown"
                description="View gains and losses per South African tax year (Mar–Feb)"
              />
              <FeatureCard 
                title="Transparent Calculations"
                description="See exactly how each gain or loss is calculated"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Back and Tax Year Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <Button 
                variant="ghost" 
                onClick={handleReset}
                className="self-start"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Import New Data
              </Button>
              
              <TaxYearSelector 
                taxYears={taxYears}
                selectedYear={selectedTaxYear}
                onSelectYear={setSelectedTaxYear}
              />
            </div>

            {/* Summary Dashboard */}
            <SummaryDashboard 
              taxYearSummaries={portfolioState.taxYearSummaries}
              currentBalances={portfolioState.currentBalances}
              selectedTaxYear={selectedTaxYear || undefined}
            />

            {/* Transaction Table */}
            <TransactionTable 
              transactions={portfolioState.processedTransactions}
              taxYearFilter={selectedTaxYear || undefined}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            This calculator is for informational purposes only. 
            Please consult a tax professional for official tax advice.
          </p>
          <p className="mt-2">
            Built for{' '}
            <span className="font-semibold text-primary">TaxTim</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center p-6 rounded-lg border bg-card shadow-card hover:shadow-card-hover transition-shadow">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default Index;

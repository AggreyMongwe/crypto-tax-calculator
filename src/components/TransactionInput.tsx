import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileSpreadsheet, Info, AlertCircle, Cloud, Loader2, Sparkles } from 'lucide-react';
import { RawTransaction } from '@/types/crypto';
import { parseExcelPaste } from '@/lib/fifoCalculator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface TransactionInputProps {
  onTransactionsParsed: (transactions: RawTransaction[]) => void;
  onServerProcessed?: (result: any) => void;
}

const EXAMPLE_DATA = `Date\tType\tCoin\tAmount\tPrice (ZAR)\tTotal (ZAR)\tFee (ZAR)
2023-03-15\tBUY\tBTC\t0.5\t450000\t225000\t150
2023-05-20\tBUY\tBTC\t0.3\t480000\t144000\t100
2023-08-10\tBUY\tETH\t2.0\t35000\t70000\t50
2023-11-01\tSELL\tBTC\t0.4\t520000\t208000\t200
2024-01-15\tBUY\tBTC\t0.2\t680000\t136000\t120
2024-02-20\tSELL\tETH\t1.5\t42000\t63000\t80`;

export function TransactionInput({ onTransactionsParsed, onServerProcessed }: TransactionInputProps) {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [pastedData, setPastedData] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [serverProcessing, setServerProcessing] = useState(false);

  const handlePaste = (text: string) => {
    setPastedData(text);
    setError(null);

    if (text.trim()) {
      const parsed = parseExcelPaste(text);
      if (parsed.length > 0) {
        setPreviewCount(parsed.length);
      } else {
        setPreviewCount(null);
        setError('Could not parse any valid transactions. Please check the format.');
      }
    } else {
      setPreviewCount(null);
    }
  };

  const handleProcess = async () => {
    const transactions = parseExcelPaste(pastedData);
    if (transactions.length === 0) {
      setError('No valid transactions found. Please check your data format.');
      return;
    }

    if (user && session && onServerProcessed) {
      setServerProcessing(true);
      try {
        const { data, error } = await supabase.functions.invoke('calculate-fifo', {
          body: {
            transactions,
            sessionName: sessionName || undefined,
          },
        });

        if (error) throw error;

        if (data.success) {
          toast({
            title: 'Calculations saved!',
            description: `Your ${transactions.length} transactions have been processed and saved.`,
          });
          onServerProcessed(data);
        } else {
          throw new Error(data.error || 'Server processing failed');
        }
      } catch (err: any) {
        console.error('Server processing error:', err);
        toast({
          title: 'Server processing failed',
          description: 'Processing locally instead. Data will not be saved.',
          variant: 'destructive',
        });
        onTransactionsParsed(transactions);
      } finally {
        setServerProcessing(false);
      }
    } else {
      onTransactionsParsed(transactions);
    }
    setError(null);
  };

  const loadExample = () => {
    handlePaste(EXAMPLE_DATA);
    toast({
      title: "Example data loaded",
      description: "You can now click process to see the results.",
    });
  };

  return (
    <Card className="border-none shadow-xl bg-white overflow-hidden transition-all duration-300">
      {/* Header with Deep Teal Section color */}
      <CardHeader className="bg-[#017792] text-white p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-2xl font-black">
              <FileSpreadsheet className="h-6 w-6" />
              Import Data
            </CardTitle>
            <CardDescription className="text-white/80 font-medium">
              Paste your transaction history from Excel or CSV
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadExample}
            className="text-white hover:bg-white/20 border border-white/30 rounded-lg gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Try Example
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Help Info with Header Teal background */}
        <div className="rounded-xl border border-[#A6DDDF] bg-[#A6DDDF]/10 p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-[#017792] shrink-0 mt-0.5" />
            <div className="text-sm text-[#664A48] space-y-2">
              <p className="font-bold">Required Format:</p>
              <code className="block bg-white/50 border border-[#A6DDDF]/50 rounded-lg px-3 py-2 font-mono text-xs overflow-x-auto text-[#017792]">
                Date, Type, Coin, Amount, Price (ZAR), Total (ZAR), Fee (ZAR)
              </code>
            </div>
          </div>
        </div>

        {user && (
          <div className="space-y-2">
            <Label htmlFor="sessionName" className="text-[#664A48] font-bold">Session Name</Label>
            <Input
              id="sessionName"
              placeholder="e.g., 2024 Tax Year Import"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              className="border-[#A6DDDF] focus:ring-[#017792] rounded-xl bg-[#F8F8F8]"
            />
          </div>
        )}

        <div className="relative group">
          <Textarea
            placeholder="Paste your transaction data here..."
            value={pastedData}
            onChange={(e) => handlePaste(e.target.value)}
            className="min-h-[220px] font-mono text-sm resize-none border-[#A6DDDF] focus:ring-[#017792] rounded-2xl bg-[#F8F8F8] transition-all p-4"
          />
          {previewCount !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-4 right-4 bg-[#017792] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg"
            >
              {previewCount} transaction{previewCount !== 1 ? 's' : ''} detected
            </motion.div>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="rounded-xl border-red-200 bg-red-50 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {user && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[#8C9F8B]/10 border border-[#8C9F8B]/20">
            <Cloud className="h-5 w-5 text-[#8C9F8B]" />
            <p className="text-xs text-[#664A48]">
              <strong>Cloud Sync Active:</strong> Your calculations will be validated and saved to your TaxTim account.
            </p>
          </div>
        )}

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleProcess}
            disabled={!pastedData.trim() || previewCount === null || serverProcessing}
            className="w-full h-14 bg-[#00C853] hover:bg-[#E35335] text-white text-lg font-bold rounded-2xl shadow-[0_10px_20px_-10px_rgba(140,159,139,0.5)] transition-all flex items-center justify-center gap-3"
          >
            {serverProcessing ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                Processing on Server...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                {user ? 'Process & Save History' : 'Process Transactions'}
              </>
            )}
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}
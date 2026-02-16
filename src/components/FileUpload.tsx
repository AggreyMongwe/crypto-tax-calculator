import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, CheckCircle, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { parseExchangeCSV, readFileAsText, ExchangeFormat } from '@/lib/exchangeParsers';
import { RawTransaction } from '@/types/crypto';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadProps {
  onTransactionsParsed: (transactions: RawTransaction[]) => void;
}

const EXCHANGE_NAMES: Record<ExchangeFormat, string> = {
  luno: 'Luno',
  valr: 'VALR',
  binance: 'Binance',
  generic: 'Standard Format',
  unknown: 'Unknown',
};

export function FileUpload({ onTransactionsParsed }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<{
    count: number;
    exchange: ExchangeFormat;
    errors: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parsedTransactions, setParsedTransactions] = useState<RawTransaction[]>([]);

  const handleFile = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setParseResult(null);
    setParsedTransactions([]);

    const validExtensions = ['.csv', '.txt'];
    const hasValidExtension = validExtensions.some(ext =>
      selectedFile.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExtension) {
      setError('Please upload a valid CSV file');
      return;
    }

    try {
      const text = await readFileAsText(selectedFile);
      const result = parseExchangeCSV(text);

      if (result.transactions.length === 0) {
        setError(result.errors[0] || 'No valid transactions found in file');
        return;
      }

      setParsedTransactions(result.transactions);
      setParseResult({
        count: result.transactions.length,
        exchange: result.exchange,
        errors: result.errors,
      });
    } catch (e) {
      setError('Failed to read file');
    }
  }, []);

  return (
    <Card className="border-none shadow-xl bg-white overflow-hidden">
      <CardHeader className="bg-[#017792] text-white p-6">
        <CardTitle className="flex items-center gap-2 text-2xl font-black">
          <Upload className="h-6 w-6" />
          Exchange Import
        </CardTitle>
        <CardDescription className="text-white/80 font-medium">
          Upload CSV exports from Luno, VALR, or Binance
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
          className={cn(
            'relative rounded-2xl border-2 border-dashed p-10 transition-all text-center',
            isDragging ? 'border-[#017792] bg-[#A6DDDF]/20' : 'border-[#A6DDDF] hover:border-[#017792]/50 bg-[#F8F8F8]',
            file && 'border-solid border-[#8C9F8B] bg-[#8C9F8B]/5'
          )}
        >
          {file ? (
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-white rounded-2xl shadow-md border border-[#8C9F8B]/20">
                <FileText className="h-10 w-10 text-[#8C9F8B]" />
              </div>
              <div className="text-center">
                <p className="font-black text-[#664A48]">{file.name}</p>
                <p className="text-xs text-[#664A48]/50 font-mono">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setFile(null); setParseResult(null); }} className="text-red-400 hover:text-red-500 hover:bg-red-50">
                <X className="h-4 w-4 mr-1" /> Remove
              </Button>
            </div>
          ) : (
            <>
              <div className="mx-auto h-16 w-16 bg-[#A6DDDF]/30 rounded-full flex items-center justify-center mb-4">
                <Upload className="h-8 w-8 text-[#017792]" />
              </div>
              <p className="text-[#664A48] font-bold">Drag and drop CSV here</p>
              <p className="text-xs text-[#664A48]/50 mb-4 font-medium">or click the button below</p>
              <label>
                <input type="file" accept=".csv,.txt" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} className="hidden" />
                <Button variant="outline" asChild className="border-[#017792] text-[#017792] hover:bg-[#017792] hover:text-white rounded-xl shadow-sm">
                  <span className="cursor-pointer">Browse Files</span>
                </Button>
              </label>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {['Luno', 'VALR', 'Binance', 'Standard CSV'].map(ex => (
            <span key={ex} className="px-3 py-1 bg-[#F8F8F8] border border-[#A6DDDF]/40 rounded-full text-[10px] font-bold text-[#664A48]/60 uppercase tracking-tighter">
              {ex}
            </span>
          ))}
        </div>

        <AnimatePresence>
          {parseResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Alert className="bg-[#8C9F8B]/10 border-[#8C9F8B] text-[#664A48] rounded-xl">
                <CheckCircle className="h-4 w-4 text-[#8C9F8B]" />
                <AlertDescription className="font-medium">
                  <strong>{parseResult.count} transactions</strong> from <strong>{EXCHANGE_NAMES[parseResult.exchange]}</strong> ready.
                </AlertDescription>
              </Alert>
              <Button onClick={() => onTransactionsParsed(parsedTransactions)} className="w-full mt-4 h-12 bg-[#00C853] hover:bg-[#E35335] text-white font-bold rounded-xl shadow-[0_10px_20px_-10px_rgba(140,159,139,0.5)]">
                Import to Calculator
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <Alert variant="destructive" className="rounded-xl">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
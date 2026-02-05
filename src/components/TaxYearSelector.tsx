import { TaxYear } from '@/lib/taxYears';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarDays } from 'lucide-react';

interface TaxYearSelectorProps {
  taxYears: TaxYear[];
  selectedYear: string | null;
  onSelectYear: (year: string | null) => void;
}

export function TaxYearSelector({ taxYears, selectedYear, onSelectYear }: TaxYearSelectorProps) {
  if (taxYears.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
        <CalendarDays className="h-4 w-4" />
        <span>Tax Year:</span>
      </div>
      <Button
        variant={selectedYear === null ? "default" : "outline"}
        size="sm"
        onClick={() => onSelectYear(null)}
        className={cn(
          "transition-all",
          selectedYear === null && "shadow-sm"
        )}
      >
        All Years
      </Button>
      {taxYears.map((ty) => (
        <Button
          key={ty.label}
          variant={selectedYear === ty.label ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectYear(ty.label)}
          className={cn(
            "transition-all font-mono",
            selectedYear === ty.label && "shadow-sm"
          )}
        >
          {ty.label}
        </Button>
      ))}
    </div>
  );
}

// South African tax year utilities
// Tax year runs from 1 March to 28/29 February

export interface TaxYear {
  label: string; // e.g., "2024/2025"
  startDate: Date;
  endDate: Date;
}

/**
 * Get the tax year for a given date
 * SA tax year: 1 March YYYY to 28/29 Feb YYYY+1
 */
export function getTaxYearForDate(date: Date): TaxYear {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed (March = 2)
  
  // If date is March or later, tax year starts this year
  // If date is Jan or Feb, tax year started previous year
  const taxYearStart = month >= 2 ? year : year - 1;
  const taxYearEnd = taxYearStart + 1;
  
  const startDate = new Date(taxYearStart, 2, 1); // 1 March
  const endDate = new Date(taxYearEnd, 1, 28); // 28 Feb (simplified, could check leap year)
  
  // Check for leap year to get correct end date
  if (isLeapYear(taxYearEnd)) {
    endDate.setDate(29);
  }
  
  return {
    label: `${taxYearStart}/${taxYearEnd}`,
    startDate,
    endDate,
  };
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Get all tax years that span a range of transactions
 */
export function getTaxYearsInRange(transactions: { dateObj: Date }[]): TaxYear[] {
  if (transactions.length === 0) return [];
  
  const sortedDates = transactions
    .map(t => t.dateObj)
    .sort((a, b) => a.getTime() - b.getTime());
  
  const firstTaxYear = getTaxYearForDate(sortedDates[0]);
  const lastTaxYear = getTaxYearForDate(sortedDates[sortedDates.length - 1]);
  
  const taxYears: TaxYear[] = [];
  let currentStartYear = parseInt(firstTaxYear.label.split('/')[0]);
  const endStartYear = parseInt(lastTaxYear.label.split('/')[0]);
  
  while (currentStartYear <= endStartYear) {
    const startDate = new Date(currentStartYear, 2, 1);
    const endYear = currentStartYear + 1;
    const endDate = new Date(endYear, 1, isLeapYear(endYear) ? 29 : 28);
    
    taxYears.push({
      label: `${currentStartYear}/${endYear}`,
      startDate,
      endDate,
    });
    
    currentStartYear++;
  }
  
  return taxYears;
}

/**
 * Format a date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format currency (ZAR)
 */
export function formatZAR(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format crypto amount
 */
export function formatCrypto(amount: number, decimals: number = 8): string {
  // Remove trailing zeros
  const formatted = amount.toFixed(decimals);
  return formatted.replace(/\.?0+$/, '') || '0';
}

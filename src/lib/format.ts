const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export type YearMonth = { month: number; year: number };

export function currentYearMonth(): YearMonth {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export function shiftMonth({ month, year }: YearMonth, delta: number): YearMonth {
  const index = year * 12 + (month - 1) + delta;
  return { month: (index % 12) + 1, year: Math.floor(index / 12) };
}

export function isSameMonth(a: YearMonth, b: YearMonth): boolean {
  return a.month === b.month && a.year === b.year;
}

export function formatMonthYear({ month, year }: YearMonth): string {
  return `${MONTH_NAMES[month - 1]} de ${year}`;
}

export function formatCurrency(value: number): string {
  const amount = Number.isFinite(value) ? value : 0;
  try {
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  } catch {
    // Runtime without Intl support: manual pt-BR formatting.
    const sign = amount < 0 ? '-' : '';
    const [integer, decimals] = Math.abs(amount).toFixed(2).split('.');
    return `${sign}R$ ${integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimals}`;
  }
}

// Compact form for chart labels: 1.2k, 12k, 1.5M.
export function formatCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.', ',')}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(abs >= 10_000 ? 0 : 1).replace('.', ',')}k`;
  return String(Math.round(value));
}

export function formatPercent(value: number, fractionDigits = 1): string {
  const safe = Number.isFinite(value) ? value : 0;
  return `${safe.toFixed(fractionDigits).replace('.', ',')}%`;
}

// "2026-10-14T00:00:00" -> "14/10"
export function formatShortDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return match ? `${match[3]}/${match[2]}` : iso;
}

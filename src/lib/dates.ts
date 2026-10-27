import { shiftMonth, type YearMonth } from '@/lib/format';

const SHORT_MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const pad = (n: number) => String(n).padStart(2, '0');

// yyyy-MM-dd in the device's local time zone (toISOString would use UTC and
// turn "today" into "tomorrow" late in the evening in Brazil).
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

export function addDaysIso(iso: string, days: number): string {
  const date = fromIsoDate(iso);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

export function yearMonthOf(iso: string): YearMonth {
  const [y, m] = iso.split('-').map(Number);
  return { year: y, month: m };
}

export function statementFor(dateIso: string, offset: number): YearMonth {
  return shiftMonth(yearMonthOf(dateIso), offset);
}

export function shortMonthLabel({ month, year }: YearMonth): string {
  return `${SHORT_MONTHS[month - 1]}/${String(year).slice(-2)}`;
}

// Card due date inside a statement month, clamped to the month's last day
// (same rule as the web's statementDueDate and the backend).
export function statementDueLabel(dueDay: number, { month, year }: YearMonth): string | null {
  if (!Number.isInteger(dueDay) || dueDay < 1) return null;
  const lastDay = new Date(year, month, 0).getDate();
  return `${pad(Math.min(dueDay, lastDay))}/${pad(month)}`;
}

// "27/10" for today-ish chips; "27/10/2025" when the year differs.
export function formatDayMonth(iso: string): string {
  const [y, m, d] = iso.split('-');
  return Number(y) === new Date().getFullYear() ? `${d}/${m}` : `${d}/${m}/${y}`;
}

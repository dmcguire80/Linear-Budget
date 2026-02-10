export interface Account {
  id: string;
  name: string;
  order: number;
}

export interface Bill {
  id: string;
  templateId?: string;
  type: 'bill';
  date: number;
  month: string;
  name: string;
  paid: boolean;
  amounts: Partial<Record<string, number>>;
}

export interface Payday {
  id: string;
  templateId?: string;
  type: 'payday';
  date: number;
  month: string;
  name: string;
  balances: Partial<Record<string, number>>;
}

export type RecurrenceType =
  | 'weekly'
  | 'bi-weekly'
  | 'semi-monthly'
  | 'monthly'
  | 'yearly'
  | 'custom-interval'
  | 'manual';

export interface BillTemplate {
  id: string;
  name: string;
  day: number;
  day2?: number;
  month?: string;
  startMonth?: string;
  endMonth?: string;
  recurrence: RecurrenceType | 'one-time';
  intervalDays?: number;
  manualDates?: { month: string; day: number }[];
  amounts: Partial<Record<string, number>>;
  autoGenerate: boolean;
  isActive: boolean;
}

export interface PaydayTemplate {
  id: string;
  name: string;
  day: number;
  day2?: number;
  recurrence: RecurrenceType | 'one-time';
  month?: string;
  startMonth?: string;
  endMonth?: string;
  balances: Partial<Record<string, number>>;
  autoGenerate: boolean;
  isActive: boolean;
}

export type Entry = (Bill | Payday) & {
  calculatedBalances?: Partial<Record<string, number>>;
  totalOwed?: Partial<Record<string, number>>;
};

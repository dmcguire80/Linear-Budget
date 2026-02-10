import type { BillTemplate, Entry, Bill } from '@/types';

export interface BillAnalytics {
  templateId: string;
  templateName: string;
  ytdPaid: number;
  ytdPlanned: number;
  paidCount: number;
  plannedCount: number;
  currentAmount: number;
  averagePaidAmount: number;
  hasChange: boolean;
  changeType: 'increase' | 'decrease' | 'none';
  changeAmount: number;
  changePercentage: number;
}

export const calculateBillAnalytics = (
  templates: BillTemplate[],
  entries: Entry[],
  year: number = new Date().getFullYear()
): BillAnalytics[] => {
  const yearSuffix = `'${year.toString().slice(-2)}`;
  const yearShort = ` ${year.toString().slice(-2)}`;
  const yearFull = year.toString();

  return templates.map((template) => {
    const templateEntries = entries.filter((e) => {
      if (e.type !== 'bill') return false;

      const yearMatches =
        e.month.includes(yearSuffix) || e.month.includes(yearShort) || e.month.includes(yearFull);

      if (!yearMatches) return false;
      if (e.templateId === template.id) return true;
      if (e.name === template.name && !e.templateId) return true;

      return false;
    }) as Bill[];

    const paidEntries = templateEntries.filter((e) => e.paid);

    const ytdPaid = paidEntries.reduce((sum, entry) => {
      const entryTotal = Object.values(entry.amounts).reduce((a, b) => (a || 0) + (b || 0), 0) || 0;
      return sum + entryTotal;
    }, 0);

    const plannedCount = templateEntries.length;
    const currentAmount =
      Object.values(template.amounts).reduce((a, b) => (a || 0) + (b || 0), 0) || 0;
    const ytdPlanned = plannedCount * currentAmount;

    const averagePaidAmount = paidEntries.length > 0 ? ytdPaid / paidEntries.length : 0;

    let hasChange = false;
    let changeType: 'increase' | 'decrease' | 'none' = 'none';
    let changeAmount = 0;
    let changePercentage = 0;

    if (paidEntries.length > 0 && averagePaidAmount > 0) {
      const diff = currentAmount - averagePaidAmount;
      const threshold = 0.01;

      if (Math.abs(diff) > threshold) {
        hasChange = true;
        changeAmount = diff;
        changePercentage = (diff / averagePaidAmount) * 100;
        changeType = diff > 0 ? 'increase' : 'decrease';
      }
    }

    return {
      templateId: template.id,
      templateName: template.name,
      ytdPaid,
      ytdPlanned,
      paidCount: paidEntries.length,
      plannedCount,
      currentAmount,
      averagePaidAmount,
      hasChange,
      changeType,
      changeAmount,
      changePercentage,
    };
  });
};

export const getChangedBills = (analytics: BillAnalytics[]): BillAnalytics[] => {
  return analytics.filter((a) => a.hasChange);
};

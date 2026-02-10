import { useMemo } from 'react';
import type { Entry, Bill, Payday, Account } from '@/types';

const MONTH_ORDER: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

export const useCalculations = (data: Entry[], accounts: Account[]) => {
  const calculations = useMemo(() => {
    const sortedData = [...data].sort((a, b) => {
      const getYear = (m: string) => {
        const parts = m.split("'");
        return parts.length > 1 ? parseInt(parts[1]) : 26;
      };
      const getMonth = (m: string) => {
        const monthName = m.split(' ')[0];
        return MONTH_ORDER[monthName] ?? 0;
      };

      const yearA = getYear(a.month);
      const yearB = getYear(b.month);
      if (yearA !== yearB) return yearA - yearB;

      const monthA = getMonth(a.month);
      const monthB = getMonth(b.month);
      if (monthA !== monthB) return monthA - monthB;

      if (a.date !== b.date) return a.date - b.date;

      return (a.type === 'payday' ? 0 : 1) - (b.type === 'payday' ? 0 : 1);
    });

    const periods: { payday: Payday; bills: Bill[] }[] = [];
    let currentPeriod: { payday: Payday; bills: Bill[] } | null = null;
    const orphans: Bill[] = [];

    sortedData.forEach((entry) => {
      if (entry.type === 'payday') {
        if (currentPeriod) periods.push(currentPeriod);
        currentPeriod = { payday: entry as Payday, bills: [] };
      } else {
        if (currentPeriod) {
          currentPeriod.bills.push(entry as Bill);
        } else {
          orphans.push(entry as Bill);
        }
      }
    });
    if (currentPeriod) periods.push(currentPeriod);

    const processedPeriods = periods.map((period) => {
      const { payday, bills } = period;
      const cycleOwed = {} as Record<string, number>;
      const paidAmount = {} as Record<string, number>;
      const remaining = {} as Record<string, number>;

      accounts.forEach((acc) => {
        cycleOwed[acc.name] = 0;
        paidAmount[acc.name] = 0;
      });

      bills.forEach((bill) => {
        accounts.forEach((acc) => {
          const amount = bill.amounts[acc.name];
          if (amount) {
            cycleOwed[acc.name] += amount;
            if (bill.paid) {
              paidAmount[acc.name] += amount;
            }
          }
        });
      });

      accounts.forEach((acc) => {
        remaining[acc.name] = cycleOwed[acc.name] - paidAmount[acc.name];
      });

      return {
        payday: {
          ...payday,
          totalOwed: { ...cycleOwed },
          calculatedBalances: { ...remaining },
        },
        bills: bills.map((bill) => ({ ...bill, calculatedBalances: { ...remaining } })),
      };
    });

    const result: Entry[] = [
      ...orphans,
      ...processedPeriods.flatMap((p) => [p.payday, ...p.bills]),
    ];

    return result;
  }, [data, accounts]);

  return calculations;
};

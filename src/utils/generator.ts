import type { BillTemplate, Bill, PaydayTemplate, Payday, Entry } from '@/types';
import { uuid } from '@/utils/uuid';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_INDEX: Record<string, number> = Object.fromEntries(MONTHS.map((m, i) => [m, i]));

export const generateEntries = (
  templates: BillTemplate[],
  paydayTemplates: PaydayTemplate[],
  year: number = 2026
): Entry[] => {
  const entries: Entry[] = [];

  const processTemplate = (template: BillTemplate | PaydayTemplate) => {
    if (!template.autoGenerate || !template.isActive) return;

    const isBill = 'amounts' in template;
    const startMonthIndex = template.startMonth ? (MONTH_INDEX[template.startMonth] ?? 0) : 0;
    const endMonthIndex = template.endMonth ? (MONTH_INDEX[template.endMonth] ?? 11) : 11;

    const createEntry = (month: string, day: number): Entry => {
      const monthWithYear = `${month} '${year.toString().slice(-2)}`;

      if (isBill) {
        return {
          id: uuid(),
          templateId: template.id,
          type: 'bill',
          name: template.name,
          amounts: template.amounts,
          paid: false,
          month: monthWithYear,
          date: day,
        } as Bill;
      } else {
        return {
          id: uuid(),
          templateId: template.id,
          type: 'payday',
          name: template.name,
          balances: (template as PaydayTemplate).balances,
          month: monthWithYear,
          date: day,
        } as Payday;
      }
    };

    if (template.recurrence === 'one-time' || template.recurrence === 'yearly') {
      const targetMonth = template.month || 'Jan';
      const targetMonthIndex = MONTH_INDEX[targetMonth];
      if (targetMonthIndex >= startMonthIndex && targetMonthIndex <= endMonthIndex) {
        entries.push(createEntry(targetMonth, template.day));
      }
    } else if (template.recurrence === 'monthly') {
      MONTHS.forEach((month, idx) => {
        if (idx >= startMonthIndex && idx <= endMonthIndex) {
          entries.push(createEntry(month, template.day));
        }
      });
    } else if (template.recurrence === 'semi-monthly') {
      MONTHS.forEach((month, idx) => {
        if (idx >= startMonthIndex && idx <= endMonthIndex) {
          entries.push(createEntry(month, template.day));
          if (template.day2) {
            entries.push(createEntry(month, template.day2));
          }
        }
      });
    } else if (
      template.recurrence === 'manual' &&
      'manualDates' in template &&
      template.manualDates
    ) {
      template.manualDates.forEach((dateObj) => {
        const mIndex = MONTH_INDEX[dateObj.month];
        if (mIndex >= startMonthIndex && mIndex <= endMonthIndex) {
          entries.push(createEntry(dateObj.month, dateObj.day));
        }
      });
    } else if (
      template.recurrence === 'bi-weekly' ||
      template.recurrence === 'weekly' ||
      template.recurrence === 'custom-interval'
    ) {
      let interval = 14;
      if (template.recurrence === 'weekly') interval = 7;
      if (template.recurrence === 'custom-interval' && 'intervalDays' in template) {
        interval = (template as BillTemplate).intervalDays || 30;
      }

      const currentDate = new Date(year, startMonthIndex, template.day);

      while (currentDate.getFullYear() === year) {
        const monthStr = MONTHS[currentDate.getMonth()];
        const monthIndex = currentDate.getMonth();
        const day = currentDate.getDate();

        if (monthIndex >= startMonthIndex && monthIndex <= endMonthIndex) {
          entries.push(createEntry(monthStr, day));
        }

        currentDate.setDate(currentDate.getDate() + interval);
      }
    }
  };

  templates.forEach(processTemplate);
  paydayTemplates.forEach(processTemplate);

  return entries;
};

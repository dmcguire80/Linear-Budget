import { useState } from 'react';
import { useData } from '@/context/DataContext';
import type { Payday } from '@/types';
import { X } from 'lucide-react';

interface PaydayFormProps {
  initialData?: Payday;
  onSave: (payday: Omit<Payday, 'id' | 'type'>) => void;
  onClose: () => void;
}

export const PaydayForm = ({ initialData, onSave, onClose }: PaydayFormProps) => {
  const { accounts } = useData();
  const [name, setName] = useState(initialData?.name || 'Payday');
  const [date, setDate] = useState(initialData?.date || new Date().getDate());
  const [monthName, setMonthName] = useState(() => {
    const m = initialData?.month || "Jan '26";
    return m.split(' ')[0];
  });
  const [year, setYear] = useState(() => {
    const m = initialData?.month || "Jan '26";
    const parts = m.split("'");
    return parts.length > 1 ? parts[1] : '26';
  });
  const month = `${monthName} '${year}`;
  const [balances, setBalances] = useState<Record<string, number>>(
    (initialData?.balances || {}) as Record<string, number>
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, date: Number(date), month, balances });
    onClose();
  };

  const handleBalanceChange = (account: string, value: string) => {
    const numValue = parseFloat(value);
    setBalances((prev) => {
      const next = { ...prev };
      if (isNaN(numValue)) {
        delete next[account];
      } else {
        next[account] = numValue;
      }
      return next;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            {initialData ? 'Edit Deposit' : 'Add Deposit'}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Row Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-primary)]"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Month
              </label>
              <select
                value={monthName}
                onChange={(e) => setMonthName(e.target.value)}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-primary)]"
                required
              >
                {[
                  'Jan',
                  'Feb',
                  'Mar',
                  'Apr',
                  'May',
                  'Jun',
                  'Jul',
                  'Aug',
                  'Sep',
                  'Oct',
                  'Nov',
                  'Dec',
                ].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Day
              </label>
              <select
                value={date}
                onChange={(e) => setDate(Number(e.target.value))}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-primary)]"
                required
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-primary)]"
                required
              >
                {['25', '26', '27', '28', '29', '30'].map((y) => (
                  <option key={y} value={y}>
                    &apos;{y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Balances per Account
            </label>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {accounts.map((account) => (
                <div key={account.id} className="flex items-center gap-3">
                  <label className="w-24 text-sm text-[var(--text-secondary)] truncate">
                    {account.name}
                  </label>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                      $
                    </span>
                    <input
                      type="number"
                      placeholder="0"
                      value={balances[account.name] ?? ''}
                      onChange={(e) => handleBalanceChange(account.name, e.target.value)}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-3 pl-7 py-1.5 text-[var(--text-primary)] text-right font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-2 rounded-lg btn-primary text-white">
              Save Deposit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { TrendingUp, TrendingDown, X, AlertCircle } from 'lucide-react';
import { calculateBillAnalytics, getChangedBills } from '@/utils/billAnalytics';

export const Analytics = () => {
  const { templates, entries } = useData();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dismissedChanges, setDismissedChanges] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('dismissedBillChanges');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const analytics = calculateBillAnalytics(templates, entries, selectedYear);
  const changedBills = getChangedBills(analytics).filter(
    (bill) => !dismissedChanges.has(bill.templateId)
  );

  const handleDismissChange = (templateId: string) => {
    const newDismissed = new Set(dismissedChanges);
    newDismissed.add(templateId);
    setDismissedChanges(newDismissed);
    localStorage.setItem('dismissedBillChanges', JSON.stringify([...newDismissed]));
  };

  const handleDismissAllChanges = () => {
    const allChangedIds = changedBills.map((b) => b.templateId);
    const newDismissed = new Set([...dismissedChanges, ...allChangedIds]);
    setDismissedChanges(newDismissed);
    localStorage.setItem('dismissedBillChanges', JSON.stringify([...newDismissed]));
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Analytics</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Year-to-date financial insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-[var(--text-secondary)]">Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-primary)]"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {changedBills.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <AlertCircle className="text-yellow-400 mt-0.5" size={20} />
              <div className="flex-1">
                <h3 className="text-yellow-400 font-semibold mb-2">Bill Amount Changes Detected</h3>
                <div className="space-y-2">
                  {changedBills.map((bill) => (
                    <div
                      key={bill.templateId}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--text-primary)]">{bill.templateName}</span>
                        <span className="text-[var(--text-secondary)]">
                          ${bill.averagePaidAmount.toFixed(2)} → ${bill.currentAmount.toFixed(2)}
                        </span>
                        <span
                          className={`flex items-center gap-1 ${
                            bill.changeType === 'increase' ? 'text-red-400' : 'text-emerald-400'
                          }`}
                        >
                          {bill.changeType === 'increase' ? (
                            <TrendingUp size={14} />
                          ) : (
                            <TrendingDown size={14} />
                          )}
                          {bill.changePercentage > 0 ? '+' : ''}
                          {bill.changePercentage.toFixed(1)}%
                        </span>
                      </div>
                      <button
                        onClick={() => handleDismissChange(bill.templateId)}
                        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleDismissAllChanges}
                  className="mt-3 text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  Dismiss all changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border-color)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Year-to-Date Analytics
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Track paid vs planned amounts for {selectedYear}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--bg-primary)] sticky top-0">
              <tr className="text-left text-xs text-[var(--text-secondary)] uppercase tracking-wider">
                <th className="px-6 py-3 font-semibold">Bill Name</th>
                <th className="px-6 py-3 font-semibold text-right">YTD Paid</th>
                <th className="px-6 py-3 font-semibold text-right">YTD Planned</th>
                <th className="px-6 py-3 font-semibold text-right">Difference</th>
                <th className="px-6 py-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {analytics.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[var(--text-tertiary)]">
                    No bill templates found. Create templates in Manage Bills to see analytics.
                  </td>
                </tr>
              ) : (
                analytics.map((bill, idx) => (
                  <tr
                    key={bill.templateId}
                    className={idx % 2 === 0 ? 'bg-[var(--bg-primary)]' : 'bg-transparent'}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--text-primary)] font-medium">
                          {bill.templateName}
                        </span>
                        {bill.hasChange && (
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded flex items-center gap-1 ${
                              bill.changeType === 'increase'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {bill.changeType === 'increase' ? (
                              <TrendingUp size={12} />
                            ) : (
                              <TrendingDown size={12} />
                            )}
                            {bill.changePercentage > 0 ? '+' : ''}
                            {bill.changePercentage.toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[var(--text-tertiary)] mt-1">
                        {bill.paidCount} of {bill.plannedCount} paid
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-mono text-emerald-400 font-semibold">
                        ${bill.ytdPaid.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-mono text-[var(--text-secondary)]">
                        ${bill.ytdPlanned.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`font-mono font-semibold ${
                          bill.ytdPaid - bill.ytdPlanned > 0
                            ? 'text-red-400'
                            : bill.ytdPaid - bill.ytdPlanned < 0
                              ? 'text-emerald-400'
                              : 'text-[var(--text-secondary)]'
                        }`}
                      >
                        {bill.ytdPaid - bill.ytdPlanned > 0 ? '+' : ''}$
                        {(bill.ytdPaid - bill.ytdPlanned).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          bill.paidCount === bill.plannedCount
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : bill.paidCount === 0
                              ? 'bg-neutral-500/10 text-[var(--text-secondary)] border border-neutral-500/20'
                              : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}
                      >
                        {bill.paidCount === bill.plannedCount
                          ? 'All Paid'
                          : bill.paidCount === 0
                            ? 'None Paid'
                            : 'In Progress'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

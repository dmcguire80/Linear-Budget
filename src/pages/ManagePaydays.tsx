import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Plus, Trash2, Calendar, RefreshCw, Edit2 } from 'lucide-react';
import type { PaydayTemplate, RecurrenceType } from '@/types';
import { uuid } from '@/utils/uuid';

export const ManagePaydays = () => {
  const {
    paydayTemplates,
    accounts,
    addPaydayTemplate,
    deletePaydayTemplate,
    updatePaydayTemplate,
  } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('Payday');
  const [recurrence, setRecurrence] = useState<RecurrenceType | 'one-time'>('bi-weekly');
  const [day, setDay] = useState(1);
  const [day2, setDay2] = useState<number>(15);
  const [month, setMonth] = useState('Jan');
  const [startMonth, setStartMonth] = useState('Jan');
  const [balances, setBalances] = useState<Partial<Record<string, number>>>({});

  const handleOpenForm = () => {
    setIsFormOpen(true);
    setEditingId(null);
    setName('Payday');
    setRecurrence('bi-weekly');
    setDay(1);
    setStartMonth('Jan');
    setBalances({});
  };

  const handleEdit = (template: PaydayTemplate) => {
    setEditingId(template.id);
    setName(template.name);
    setRecurrence(template.recurrence);
    setDay(template.day);
    if (template.day2) setDay2(template.day2);
    if (template.month) setMonth(template.month);
    setStartMonth(template.startMonth || 'Jan');
    setBalances(template.balances);
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const templateData = {
      name,
      recurrence,
      day: Number(day),
      day2: recurrence === 'semi-monthly' ? Number(day2) : undefined,
      month: recurrence === 'yearly' || recurrence === 'one-time' ? month : undefined,
      startMonth: recurrence !== 'one-time' ? startMonth : undefined,
      balances,
      autoGenerate: true,
      isActive: true,
    };

    if (editingId) {
      updatePaydayTemplate({
        ...templateData,
        id: editingId,
      });
    } else {
      addPaydayTemplate({
        ...templateData,
        id: uuid(),
      });
    }
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleBalanceChange = (account: string, val: string) => {
    const num = parseFloat(val);
    setBalances((prev) => {
      const next = { ...prev };
      if (!val || isNaN(num)) delete next[account];
      else next[account] = num;
      return next;
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Manage Payday Schedules
          </h2>
          <p className="text-[var(--text-secondary)]">
            Set up recurring paydays to auto-populate balances.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleOpenForm}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            <Plus size={18} />
            New Schedule
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {paydayTemplates
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((t) => (
            <div
              key={t.id}
              className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 relative group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">{t.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mt-1">
                    <RefreshCw size={14} />
                    <span className="capitalize">{t.recurrence}</span>
                    <span>•</span>
                    <Calendar size={14} />
                    <span>
                      {t.recurrence === 'bi-weekly'
                        ? `Starts Day ${t.day}`
                        : t.recurrence === 'yearly'
                          ? `${t.month} ${t.day}`
                          : `Day ${t.day}`}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(t)}
                    className="text-[var(--text-tertiary)] hover:text-blue-400 p-2 hover:bg-blue-500/10 rounded-lg transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => deletePaydayTemplate(t.id)}
                    className="text-[var(--text-tertiary)] hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 border-t border-[var(--border-color)] pt-4">
                {Object.entries(t.balances).map(([acc, amt]) => (
                  <div key={acc} className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">{acc}</span>
                    <span className="font-mono text-emerald-300">${amt}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

        {paydayTemplates.length === 0 && (
          <div className="col-span-full py-12 text-center text-[var(--text-tertiary)] border-2 border-dashed border-[var(--border-color)] rounded-xl">
            No payday schedules yet. Create one to get started.
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
              {editingId ? 'Edit Payday Schedule' : 'New Payday Schedule'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">
                  Schedule Name
                </label>
                <input
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-primary)]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">
                    Recurrence
                  </label>
                  <select
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-primary)]"
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="bi-weekly">Bi-Weekly (Every 2 weeks)</option>
                    <option value="weekly">Weekly</option>
                    <option value="semi-monthly">Twice Monthly (e.g. 1st & 15th)</option>
                    <option value="yearly">Yearly</option>
                    <option value="one-time">One Time</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">
                    {recurrence === 'bi-weekly' ? 'Start Day' : 'Day of Month'}
                  </label>
                  <select
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-primary)]"
                    value={day}
                    onChange={(e) => setDay(Number(e.target.value))}
                    required
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {(recurrence === 'yearly' || recurrence === 'one-time') && (
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Month</label>
                  <select
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-primary)]"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
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
              )}

              {recurrence !== 'one-time' && (
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">
                    Start Month
                  </label>
                  <select
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-primary)]"
                    value={startMonth}
                    onChange={(e) => setStartMonth(e.target.value)}
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
              )}

              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  Target Balances
                </label>
                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                  {accounts
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((acc) => (
                      <div key={acc.id} className="flex items-center gap-2">
                        <span className="w-20 text-xs text-[var(--text-secondary)] truncate">
                          {acc.name}
                        </span>
                        <input
                          type="number"
                          placeholder="0.00"
                          className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-2 py-1 text-[var(--text-primary)] text-right text-sm"
                          value={balances[acc.name] || ''}
                          onChange={(e) => handleBalanceChange(acc.name, e.target.value)}
                        />
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-2 bg-white/5 rounded-lg text-[var(--text-secondary)]"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2 bg-emerald-500 text-white rounded-lg">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

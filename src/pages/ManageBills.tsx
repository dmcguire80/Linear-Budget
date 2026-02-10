import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Plus, Trash2, Calendar, RefreshCw, Edit2 } from 'lucide-react';
import type { BillTemplate, RecurrenceType } from '@/types';
import { uuid } from '@/utils/uuid';

export const ManageBills = () => {
  const { templates, accounts, addTemplate, deleteTemplate, updateTemplate } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceType | 'one-time'>('monthly');
  const [day, setDay] = useState(1);
  const [day2, setDay2] = useState<number>(15);
  const [month, setMonth] = useState('Jan');
  const [startMonth, setStartMonth] = useState('Jan');
  const [endMonth, setEndMonth] = useState<string | undefined>(undefined);
  const [intervalDays, setIntervalDays] = useState<number>(30);
  const [manualDates, setManualDates] = useState<{ month: string; day: number }[]>([
    { month: 'Jan', day: 1 },
  ]);
  const [isActive, setIsActive] = useState(true);
  const [amounts, setAmounts] = useState<Partial<Record<string, number>>>({});

  const handleOpenForm = () => {
    setIsFormOpen(true);
    setEditingId(null);
    setName('');
    setRecurrence('monthly');
    setDay(1);
    setStartMonth('Jan');
    setEndMonth(undefined);
    setIntervalDays(30);
    setManualDates([{ month: 'Jan', day: 1 }]);
    setIsActive(true);
    setAmounts({});
  };

  const handleEdit = (template: BillTemplate) => {
    setEditingId(template.id);
    setName(template.name);
    setRecurrence(template.recurrence);
    setDay(template.day);
    if (template.day2) setDay2(template.day2);
    if (template.month) setMonth(template.month);
    setStartMonth(template.startMonth || 'Jan');
    setEndMonth(template.endMonth);
    if (template.intervalDays) setIntervalDays(template.intervalDays);
    if (template.manualDates) setManualDates(template.manualDates);
    setIsActive(template.isActive);
    setAmounts(template.amounts);
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const templateData: Partial<BillTemplate> = {
      name,
      recurrence,
      day: Number(day),
      day2: recurrence === 'semi-monthly' ? Number(day2) : undefined,
      month: recurrence === 'yearly' ? month : undefined,
      startMonth: recurrence !== 'one-time' && recurrence !== 'manual' ? startMonth : undefined,
      endMonth:
        recurrence !== 'one-time' && recurrence !== 'manual' && endMonth ? endMonth : undefined,
      intervalDays: recurrence === 'custom-interval' ? Number(intervalDays) : undefined,
      manualDates: recurrence === 'manual' ? manualDates : undefined,
      amounts,
      autoGenerate: true,
      isActive,
    };

    if (editingId) {
      updateTemplate({
        ...templateData,
        id: editingId,
      } as BillTemplate);
    } else {
      addTemplate({
        ...templateData,
        id: uuid(),
      } as BillTemplate);
    }
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleAmountChange = (account: string, val: string) => {
    const num = parseFloat(val);
    setAmounts((prev) => {
      const next = { ...prev };
      if (!val || isNaN(num)) delete next[account];
      else next[account] = num;
      return next;
    });
  };

  const addManualDate = () => {
    setManualDates([...manualDates, { month: 'Jan', day: 1 }]);
  };

  const removeManualDate = (index: number) => {
    if (manualDates.length > 1) {
      setManualDates(manualDates.filter((_, i) => i !== index));
    }
  };

  const updateManualDate = (index: number, field: 'month' | 'day', value: string | number) => {
    const newDates = [...manualDates];
    newDates[index] = { ...newDates[index], [field]: value };
    setManualDates(newDates);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Manage Bill Templates
          </h2>
          <p className="text-[var(--text-secondary)]">Set up recurring bills to auto-generate.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleOpenForm}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            <Plus size={18} />
            New Template
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {templates
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((t) => (
            <div
              key={t.id}
              className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 relative group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">{t.name}</h3>
                    {!t.isActive && (
                      <span className="px-2 py-0.5 bg-neutral-500/20 text-[var(--text-secondary)] text-xs rounded border border-neutral-500/30">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mt-1">
                    <RefreshCw size={14} />
                    <span className="capitalize">{t.recurrence.replace('-', ' ')}</span>
                    <span>•</span>
                    <Calendar size={14} />
                    <span>
                      {t.recurrence === 'bi-weekly'
                        ? `Starts Day ${t.day}`
                        : t.recurrence === 'custom-interval'
                          ? `Every ${t.intervalDays} days`
                          : t.recurrence === 'manual'
                            ? `${t.manualDates?.length || 0} dates`
                            : t.recurrence === 'yearly'
                              ? `${t.month} ${t.day}`
                              : `Day ${t.day}`}
                    </span>
                  </div>
                  {t.endMonth && (
                    <div className="text-xs text-[var(--text-tertiary)] mt-1">
                      Ends: {t.endMonth}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleEdit(t)}
                  className="text-[var(--text-tertiary)] hover:text-blue-400 p-2 hover:bg-blue-500/10 rounded-lg transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => deleteTemplate(t.id)}
                  className="text-[var(--text-tertiary)] hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-2 border-t border-[var(--border-color)] pt-4">
                {Object.entries(t.amounts).map(([acc, amt]) => (
                  <div key={acc} className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">{acc}</span>
                    <span className="font-mono text-emerald-300">${amt}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

        {templates.length === 0 && (
          <div className="col-span-full py-12 text-center text-[var(--text-tertiary)] border-2 border-dashed border-[var(--border-color)] rounded-xl">
            No templates yet. Create one to get started.
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
              {editingId ? 'Edit Bill Template' : 'New Bill Template'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Bill Name</label>
                <input
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-primary)]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
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
                    <option value="custom-interval">Custom Interval (Every X Days)</option>
                    <option value="manual">Manual Dates (Specific List)</option>
                    <option value="one-time">One Time</option>
                  </select>
                </div>

                {recurrence !== 'manual' && (
                  <div className="col-span-2">
                    <label className="block text-sm text-[var(--text-secondary)] mb-1">
                      {recurrence === 'bi-weekly' || recurrence === 'custom-interval'
                        ? 'Start Day'
                        : 'Day of Month'}
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
                )}
              </div>

              {recurrence === 'custom-interval' && (
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">
                    Repeat Every (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-primary)]"
                    value={intervalDays}
                    onChange={(e) => setIntervalDays(Number(e.target.value))}
                    required
                  />
                </div>
              )}

              {recurrence === 'manual' && (
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-2">
                    Selected Dates
                  </label>
                  <div className="space-y-2 mb-2">
                    {manualDates.map((date, idx) => (
                      <div key={idx} className="flex gap-2">
                        <select
                          className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-2 py-1 text-[var(--text-primary)] text-sm"
                          value={date.month}
                          onChange={(e) => updateManualDate(idx, 'month', e.target.value)}
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
                        <select
                          className="w-20 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-2 py-1 text-[var(--text-primary)] text-sm"
                          value={date.day}
                          onChange={(e) => updateManualDate(idx, 'day', Number(e.target.value))}
                        >
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => removeManualDate(idx)}
                          className="text-[var(--text-secondary)] hover:text-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addManualDate}
                    className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Date
                  </button>
                </div>
              )}

              {recurrence === 'yearly' && (
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

              {recurrence !== 'one-time' && recurrence !== 'manual' && (
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

              {recurrence !== 'one-time' && recurrence !== 'manual' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[var(--text-secondary)] mb-1">
                        End Month (Optional)
                      </label>
                      <select
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-primary)]"
                        value={endMonth || ''}
                        onChange={(e) => setEndMonth(e.target.value || undefined)}
                      >
                        <option value="">No end date</option>
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
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={(e) => setIsActive(e.target.checked)}
                          className="w-4 h-4 rounded border-[var(--border-color)] bg-[var(--bg-secondary)] text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                        />
                        <span className="text-sm text-[var(--text-secondary)]">Active</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">Amounts</label>
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
                          value={amounts[acc.name] || ''}
                          onChange={(e) => handleAmountChange(acc.name, e.target.value)}
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

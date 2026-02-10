import { useState, useRef } from 'react';
import { useData } from '@/context/DataContext';
import type { Bill, Entry } from '@/types';
import { formatCurrency } from '@/utils/format';
import { Check, Circle, Edit2, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { Popover } from '@/components/Popover';

interface BillTableProps {
  data: Entry[];
  onTogglePaid: (id: string) => void;
  onEdit: (entry: Entry) => void;
  onDelete: (id: string) => void;
}

export const BillTable = ({ data, onTogglePaid, onEdit, onDelete }: BillTableProps) => {
  const { accounts } = useData();
  return (
    <div className="overflow-auto max-h-[calc(100vh-140px)] rounded-xl border border-[var(--border-color)] shadow-2xl backdrop-blur-md bg-[var(--bg-card)] mx-[-16px] md:mx-0">
      <table className="w-full text-sm text-left text-[var(--text-primary)]">
        <thead className="text-xs uppercase bg-[var(--bg-secondary)] text-[var(--text-primary)] font-bold tracking-wider sticky top-0 z-20 shadow-md">
          <tr>
            <th className="px-2 py-3 sticky left-0 z-30 bg-[var(--bg-secondary)] w-12 text-center border-r border-[var(--border-color)] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
              Mo
            </th>
            <th className="px-3 py-3 sticky left-12 z-30 bg-[var(--bg-secondary)] min-w-[60px] border-r border-[var(--border-color)] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
              Date
            </th>
            <th className="px-4 py-3 min-w-[100px]">Bill</th>
            <th className="px-2 py-3 text-center w-12">Paid</th>
            {accounts.map((account) => (
              <th key={account.id} className="px-4 py-3 text-right min-w-[100px] text-emerald-400">
                {account.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((entry) => (
            <Row
              key={entry.id}
              entry={entry}
              onTogglePaid={onTogglePaid}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Row = ({
  entry,
  onTogglePaid,
  onEdit,
  onDelete,
}: {
  entry: Entry;
  onTogglePaid: (id: string) => void;
  onEdit: (entry: Entry) => void;
  onDelete: (id: string) => void;
}) => {
  const { accounts } = useData();
  const isPayday = entry.type === 'payday';
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const nameRef = useRef<HTMLSpanElement>(null);

  const handleNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPopoverOpen(true);
  };

  const handleEdit = () => {
    setIsPopoverOpen(false);
    onEdit(entry);
  };

  const handleDelete = () => {
    setIsPopoverOpen(false);
    onDelete(entry.id);
  };

  if (isPayday) {
    return (
      <tr
        id={`row-${entry.id}`}
        className="bg-emerald-500/10 border-y border-emerald-500/20 font-bold text-[var(--text-primary)] relative group"
      >
        <td className="px-2 py-3 sticky left-0 z-20 bg-emerald-500/10 border-r border-emerald-500/20 text-center text-xs shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
          {entry.month}
        </td>
        <td className="px-3 py-3 sticky left-12 z-20 bg-emerald-500/10 border-r border-emerald-500/20 text-emerald-400 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
          {entry.date}
        </td>
        <td className="px-4 py-3 text-base md:text-lg text-emerald-300 uppercase tracking-wide">
          <span
            ref={nameRef}
            onClick={handleNameClick}
            className="cursor-pointer hover:text-emerald-200 transition-colors"
          >
            {entry.name}
          </span>
          <Popover isOpen={isPopoverOpen} onClose={() => setIsPopoverOpen(false)}>
            <div className="flex flex-col gap-1">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-3 hover:bg-[var(--bg-secondary)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-left"
              >
                <Edit2 size={16} />
                <span>Edit</span>
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-3 hover:bg-red-500/20 rounded text-[var(--text-secondary)] hover:text-red-400 transition-colors text-left"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          </Popover>
        </td>
        <td className="px-2 py-3 text-center text-emerald-500/50">-</td>
        {accounts.map((account) => {
          const owed = entry.totalOwed?.[account.name] || 0;
          const remaining = entry.calculatedBalances?.[account.name] ?? 0;

          return (
            <td key={account.id} className="px-4 py-3 text-right">
              <div className="flex flex-col items-end gap-1">
                <div className="flex flex-col items-end text-[10px] font-mono opacity-60 leading-tight">
                  <span>Start:</span>
                  <span className="mb-1">{formatCurrency(owed)}</span>
                </div>
                <span className="px-2 py-1 rounded shadow-sm font-bold min-w-[70px] text-center bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs md:text-sm">
                  {formatCurrency(remaining)}
                </span>
              </div>
            </td>
          );
        })}
      </tr>
    );
  }

  const bill = entry as Bill;
  return (
    <tr
      id={`row-${entry.id}`}
      className={clsx(
        'border-b border-[var(--border-color)] transition-colors hover:bg-[var(--bg-secondary)] group',
        bill.paid && 'opacity-50 grayscale-[0.5]'
      )}
    >
      <td className="px-2 py-3 sticky left-0 z-10 bg-[var(--bg-primary)] border-r border-[var(--border-color)] text-center text-xs shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
        {entry.month}
      </td>
      <td className="px-3 py-3 sticky left-12 z-10 bg-[var(--bg-primary)] border-r border-[var(--border-color)] font-mono text-[var(--text-secondary)] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
        {entry.date}
      </td>
      <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
        <span
          ref={nameRef}
          onClick={handleNameClick}
          className="cursor-pointer hover:text-emerald-400 transition-colors"
        >
          {entry.name}
        </span>
        <Popover isOpen={isPopoverOpen} onClose={() => setIsPopoverOpen(false)}>
          <div className="flex flex-col gap-1">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-3 hover:bg-[var(--bg-secondary)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-left"
            >
              <Edit2 size={16} />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-3 hover:bg-red-500/20 rounded text-[var(--text-secondary)] hover:text-red-400 transition-colors text-left"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
        </Popover>
      </td>
      <td className="px-2 py-3 text-center">
        <button
          onClick={() => onTogglePaid(entry.id)}
          className={clsx(
            'p-2 rounded-md transition-all duration-300 shadow-lg',
            bill.paid
              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 ring-1 ring-emerald-500/50'
              : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 ring-2 ring-orange-500/50'
          )}
        >
          {bill.paid ? <Check size={14} strokeWidth={3} /> : <Circle size={14} />}
        </button>
      </td>
      {accounts.map((account) => {
        const amount = bill.amounts[account.name];
        return (
          <td
            key={account.id}
            className="px-4 py-3 text-right font-mono text-[var(--text-secondary)]"
          >
            {amount !== undefined ? formatCurrency(amount) : <span className="opacity-20">-</span>}
          </td>
        );
      })}
    </tr>
  );
};

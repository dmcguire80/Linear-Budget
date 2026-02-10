import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Trash2, Plus, AlertCircle, Edit2, ArrowUp, ArrowDown, Save, X } from 'lucide-react';
import type { Account } from '@/types';

export const ManageAccounts = () => {
  const { accounts, addAccount, removeAccount, updateAccount, reorderAccounts } = useData();
  const [newAccount, setNewAccount] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newAccount.trim();

    if (!trimmed) return;

    if (accounts.some((a) => a.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('Account already exists');
      return;
    }

    addAccount(trimmed);
    setNewAccount('');
    setError('');
  };

  const handleDelete = (id: string, name: string) => {
    if (
      confirm(
        `Are you sure you want to delete account "${name}"? This will not remove existing amounts, but they won't be visible in the table columns.`
      )
    ) {
      removeAccount(id);
    }
  };

  const startEdit = (account: Account) => {
    setEditingId(account.id);
    setEditName(account.name);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      updateAccount(editingId, editName.trim());
      setEditingId(null);
    }
  };

  const moveAccount = (index: number, direction: 'up' | 'down') => {
    const newAccounts = [...accounts];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;

    if (swapIndex >= 0 && swapIndex < newAccounts.length) {
      [newAccounts[index], newAccounts[swapIndex]] = [newAccounts[swapIndex], newAccounts[index]];
      reorderAccounts(newAccounts);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Manage Accounts</h2>
        <p className="text-[var(--text-secondary)]">
          Add, rename, or reorder payment accounts/sources.
        </p>
      </div>

      <div className="bg-white/5 border border-[var(--border-color)] rounded-xl p-6 max-w-xl">
        <form onSubmit={handleAdd} className="flex gap-4 items-start">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              New Account Name
            </label>
            <input
              type="text"
              value={newAccount}
              onChange={(e) => {
                setNewAccount(e.target.value);
                setError('');
              }}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="e.g. Chase Sapphire"
            />
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm mt-2">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={!newAccount.trim()}
            className="mt-6 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus size={18} />
            Add
          </button>
        </form>
      </div>

      <div className="space-y-3 max-w-3xl">
        {accounts
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((account, index) => (
            <div
              key={account.id}
              className="bg-white/5 border border-[var(--border-color)] rounded-xl p-4 flex justify-between items-center group hover:bg-white/10 transition-colors"
            >
              {editingId === account.id ? (
                <div className="flex items-center gap-3 flex-1">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-[var(--bg-primary)] border border-emerald-500/50 rounded px-3 py-1 text-[var(--text-primary)] flex-1"
                    autoFocus
                  />
                  <button
                    onClick={saveEdit}
                    className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded"
                  >
                    <Save size={18} />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-2 text-[var(--text-secondary)] hover:bg-white/10 rounded"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-[var(--text-tertiary)] font-mono text-sm w-6">
                    #{index + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-sm border border-emerald-500/20">
                    {account.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-[var(--text-primary)]">{account.name}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => moveAccount(index, 'up')}
                  disabled={index === 0}
                  className="p-2 text-[var(--text-tertiary)] hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors disabled:opacity-20"
                  title="Move Up"
                >
                  <ArrowUp size={18} />
                </button>
                <button
                  onClick={() => moveAccount(index, 'down')}
                  disabled={index === accounts.length - 1}
                  className="p-2 text-[var(--text-tertiary)] hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors disabled:opacity-20"
                  title="Move Down"
                >
                  <ArrowDown size={18} />
                </button>
                <div className="w-px h-6 bg-[var(--border-color)] mx-2" />
                <button
                  onClick={() => startEdit(account)}
                  className="p-2 text-[var(--text-tertiary)] hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                  title="Rename Account"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(account.id, account.name)}
                  className="p-2 text-[var(--text-tertiary)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete Account"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

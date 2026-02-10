import { useState, useRef } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Download, Upload, AlertTriangle, CheckCircle, FileJson, Trash2 } from 'lucide-react';

export const DataManagement = () => {
  const { exportData, importData, deleteAccountData } = useData();
  const { deleteAccount } = useAuth();
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `bill-tracker-data-${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (!data.entries && !data.accounts && !data.templates) {
          throw new Error('Invalid backup file format');
        }

        if (
          window.confirm(
            'WARNING: This will overwrite all current data. This action cannot be undone. Are you sure?'
          )
        ) {
          importData(data);
          setImportStatus('success');
          setErrorMessage('');
          if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      } catch (err) {
        console.error('Import error:', err);
        setImportStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Failed to parse backup file');
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteAccount = async () => {
    const confirm1 = window.confirm(
      'Are you sure you want to delete your account? This will permanently delete all your data and cannot be undone.'
    );
    if (!confirm1) return;

    const confirm2 = window.confirm(
      'LAST WARNING: This action is irreversible. Are you absolutely sure?'
    );
    if (!confirm2) return;

    try {
      await deleteAccountData();
      await deleteAccount();
    } catch (error) {
      console.error('Delete account error:', error);
      alert('Failed to delete account. You may need to re-login and try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Data Management</h2>
        <p className="text-[var(--text-secondary)]">
          Back up your data or restore from a previous backup.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <Trash2 className="text-red-400" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">Danger Zone</h3>
              <p className="text-sm text-[var(--text-secondary)]">Irreversible account actions.</p>
            </div>
          </div>

          <p className="text-[var(--text-secondary)] mb-6 text-sm">
            Deleting your account will permanently remove all your data, including bills, accounts,
            and history. This action cannot be undone.
          </p>

          <button
            onClick={handleDeleteAccount}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 w-full md:w-auto"
          >
            <Trash2 size={20} />
            Delete Account & Data
          </button>
        </div>

        <div className="bg-white/5 border border-[var(--border-color)] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <Download className="text-emerald-400" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-[var(--text-primary)]">Export Data</h3>
          </div>
          <p className="text-[var(--text-secondary)] mb-6">
            Download a JSON file containing all your accounts, bills, templates, and history. Keep
            this file safe as a backup.
          </p>
          <button
            onClick={handleExport}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Download size={20} />
            Download Backup
          </button>
        </div>

        <div className="bg-white/5 border border-[var(--border-color)] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Upload className="text-blue-400" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-[var(--text-primary)]">Import Data</h3>
          </div>
          <p className="text-[var(--text-secondary)] mb-6">
            Restore your data from a previously exported JSON file.
            <span className="block mt-2 text-amber-400 text-sm flex items-center gap-1">
              <AlertTriangle size={14} />
              Warning: This will overwrite current data.
            </span>
          </p>

          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
              id="backup-upload"
            />
            <label
              htmlFor="backup-upload"
              className="w-full bg-white/10 hover:bg-white/20 text-[var(--text-primary)] px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[var(--border-color)] hover:border-white/20"
            >
              <FileJson size={20} />
              Select Backup File
            </label>
          </div>

          {importStatus === 'success' && (
            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm flex items-center gap-2">
              <CheckCircle size={16} />
              Data restored successfully!
            </div>
          )}

          {importStatus === 'error' && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
              <AlertTriangle size={16} />
              {errorMessage || 'Failed to import data.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

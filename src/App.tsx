import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { BillTable } from '@/components/BillTable';
import { BillForm } from '@/components/BillForm';
import { PaydayForm } from '@/components/PaydayForm';
import { Layout } from '@/components/Layout';
import { SetupWizard } from '@/components/SetupWizard';
import { useCalculations } from '@/hooks/useCalculations';
import { useData } from '@/context/DataContext';
import type { Bill, Payday, Entry } from '@/types';
import { Plus, Calendar, Eye, EyeOff, Filter } from 'lucide-react';
import { uuid } from '@/utils/uuid';

import { DataManagement } from '@/pages/DataManagement';
import { Settings } from '@/pages/Settings';
import { SettingsProfile } from '@/pages/SettingsProfile';
import { SettingsSecurity } from '@/pages/SettingsSecurity';
import { Analytics } from '@/pages/Analytics';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Login } from '@/pages/Login';
import { Signup } from '@/pages/Signup';
import { ForgotPassword } from '@/pages/ForgotPassword';

function Dashboard() {
  const {
    entries,
    accounts,
    addEntry,
    updateEntry,
    deleteEntry,
    hideOldData,
    hidePaid,
    setHidePaid,
  } = useData();
  const [isBillFormOpen, setIsBillFormOpen] = useState(false);
  const [isPaydayFormOpen, setIsPaydayFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterBillName, setFilterBillName] = useState('');

  const calculatedData = useCalculations(entries, accounts);

  const visibleData = hideOldData
    ? calculatedData.filter((entry) => {
        const [monthName, yearShort] = entry.month.split(" '");
        const year = 2000 + parseInt(yearShort || '26');
        const monthIndex = [
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
        ].indexOf(monthName);

        const entryDate = new Date(year, monthIndex, entry.date);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 56);

        return entryDate >= cutoff;
      })
    : calculatedData;

  const finalVisibleData = hidePaid
    ? (() => {
        const unpaidBillsAndPaydays = visibleData.filter(
          (entry) => entry.type === 'payday' || !(entry as Bill).paid
        );

        const result: Entry[] = [];

        for (let i = 0; i < unpaidBillsAndPaydays.length; i++) {
          const current = unpaidBillsAndPaydays[i];

          if (current.type === 'payday') {
            let hasUnpaidBills = false;
            for (let j = i + 1; j < unpaidBillsAndPaydays.length; j++) {
              if (unpaidBillsAndPaydays[j].type === 'payday') {
                break;
              }
              hasUnpaidBills = true;
              break;
            }

            if (hasUnpaidBills) {
              result.push(current);
            }
          } else {
            result.push(current);
          }
        }

        return result;
      })()
    : visibleData;

  const billNames = [
    ...new Set(finalVisibleData.filter((e) => e.type === 'bill').map((e) => e.name)),
  ].sort();

  const filteredData = filterBillName
    ? finalVisibleData.filter((entry) => entry.type === 'payday' || entry.name === filterBillName)
    : finalVisibleData;

  const handleScrollToToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const entriesWithDates = filteredData.map((entry) => {
      const [monthName, yearShort] = entry.month.split(" '");
      const year = 2000 + parseInt(yearShort || '26');
      const monthIndex = [
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
      ].indexOf(monthName);

      const entryDate = new Date(year, monthIndex, entry.date);
      entryDate.setHours(0, 0, 0, 0);

      return { entry, date: entryDate };
    });

    const targetEntryData = entriesWithDates.find(({ date }) => date >= today);

    if (targetEntryData) {
      document.getElementById(`row-${targetEntryData.entry.id}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  const handleTogglePaid = (id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (entry && entry.type === 'bill') {
      updateEntry({ ...entry, paid: !entry.paid });
    }
  };

  const handleAddBill = (billData: Omit<Bill, 'id' | 'type' | 'paid'>) => {
    const newBill: Bill = {
      ...billData,
      id: uuid(),
      type: 'bill',
      paid: false,
      amounts: billData.amounts,
    };
    addEntry(newBill);
  };

  const handleAddPayday = (paydayData: Omit<Payday, 'id' | 'type'>) => {
    const newPayday: Payday = {
      ...paydayData,
      id: uuid(),
      type: 'payday',
      balances: paydayData.balances,
    };
    addEntry(newPayday);
  };

  const handleEditBill = (billData: Omit<Bill, 'id' | 'type' | 'paid'>) => {
    if (!editingId) return;
    const entry = entries.find((e) => e.id === editingId);
    if (entry && entry.type === 'bill') {
      updateEntry({ ...entry, ...billData });
      setEditingId(null);
      setIsBillFormOpen(false);
    }
  };

  const handleEditPayday = (paydayData: Omit<Payday, 'id' | 'type'>) => {
    if (!editingId) return;
    const entry = entries.find((e) => e.id === editingId);
    if (entry && entry.type === 'payday') {
      updateEntry({ ...entry, ...paydayData });
      setEditingId(null);
      setIsPaydayFormOpen(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      deleteEntry(id);
    }
  };

  const openEdit = (entry: Entry) => {
    setEditingId(entry.id);
    if (entry.type === 'bill') {
      setIsBillFormOpen(true);
    } else {
      setIsPaydayFormOpen(true);
    }
  };

  const closeForm = () => {
    setIsBillFormOpen(false);
    setIsPaydayFormOpen(false);
    setEditingId(null);
  };

  const editingEntry = editingId ? entries.find((e) => e.id === editingId) : undefined;

  return (
    <>
      <header className="flex justify-between items-end border-b border-[var(--border-color)] pb-4 mb-4 md:pb-6 md:mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] hidden sm:block">
            Dashboard
          </h2>
          <p className="text-[var(--text-secondary)] hidden sm:block">
            Overview of your bills and payments.
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3 items-center">
          <div className="relative shrink-0">
            <select
              value={filterBillName}
              onChange={(e) => setFilterBillName(e.target.value)}
              className={`appearance-none pl-8 pr-6 py-0 rounded-lg font-medium transition-colors h-11 text-sm border cursor-pointer w-auto ${
                filterBillName
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                  : 'btn-secondary'
              }`}
              title="Filter by bill name"
            >
              <option value="">All Bills</option>
              {billNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <Filter
              size={16}
              className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-current"
            />
          </div>
          <button
            onClick={handleScrollToToday}
            className="btn-secondary px-3 py-2 rounded-lg font-medium transition-colors h-11 w-11 flex items-center justify-center shrink-0"
            title="Scroll to Today"
          >
            <Calendar size={20} />
          </button>
          <button
            onClick={() => setHidePaid(!hidePaid)}
            className={`border px-3 py-2 rounded-lg font-medium transition-colors h-11 w-11 flex items-center justify-center shrink-0 ${
              hidePaid
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                : 'btn-secondary'
            }`}
            title={hidePaid ? 'Show Paid Bills' : 'Hide Paid Bills'}
          >
            {hidePaid ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          <div className="w-px h-8 bg-[var(--border-color)] mx-1 hidden sm:block"></div>
          <button
            onClick={() => setIsPaydayFormOpen(true)}
            className="btn-secondary text-emerald-400 border-emerald-500/20 px-3 sm:px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors h-11 shrink-0"
            title="Add Deposit"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add Deposit</span>
          </button>
          <button
            onClick={() => setIsBillFormOpen(true)}
            className="btn-primary text-white px-3 sm:px-4 py-2 rounded-lg font-medium shadow-lg flex items-center gap-2 transition-colors h-11 shrink-0"
            title="One-time Payment"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">One-time Payment</span>
          </button>
        </div>
      </header>

      <BillTable
        data={filteredData}
        onTogglePaid={handleTogglePaid}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {isBillFormOpen && (
        <BillForm
          initialData={editingEntry as Bill}
          onSave={editingId ? handleEditBill : handleAddBill}
          onClose={closeForm}
        />
      )}

      {isPaydayFormOpen && (
        <PaydayForm
          initialData={editingEntry as Payday}
          onSave={editingId ? handleEditPayday : handleAddPayday}
          onClose={closeForm}
        />
      )}
    </>
  );
}

export default function App() {
  const { accounts, loading, importData } = useData();

  const handleSetupComplete = async (data: unknown) => {
    await importData(
      data as {
        entries?: Entry[];
        accounts?: Account[];
        templates?: BillTemplate[];
        paydayTemplates?: PaydayTemplate[];
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner"></div>
          <p className="text-[var(--text-secondary)] font-mono text-sm">Syncing data...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Setup Route */}
      <Route
        path="/setup"
        element={
          <ProtectedRoute>
            {accounts.length > 0 ? (
              <Navigate to="/" replace />
            ) : (
              <SetupWizard onComplete={handleSetupComplete} />
            )}
          </ProtectedRoute>
        }
      />

      {/* Protected App Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            {accounts.length === 0 ? (
              <Navigate to="/setup" replace />
            ) : (
              <Layout>
                <Dashboard />
              </Layout>
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            {accounts.length === 0 ? (
              <Navigate to="/setup" replace />
            ) : (
              <Layout>
                <Analytics />
              </Layout>
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            {accounts.length === 0 ? (
              <Navigate to="/setup" replace />
            ) : (
              <Layout>
                <Settings />
              </Layout>
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            {accounts.length === 0 ? (
              <Navigate to="/setup" replace />
            ) : (
              <Layout>
                <SettingsProfile />
              </Layout>
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/security"
        element={
          <ProtectedRoute>
            {accounts.length === 0 ? (
              <Navigate to="/setup" replace />
            ) : (
              <Layout>
                <SettingsSecurity />
              </Layout>
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/data"
        element={
          <ProtectedRoute>
            {accounts.length === 0 ? (
              <Navigate to="/setup" replace />
            ) : (
              <Layout>
                <DataManagement />
              </Layout>
            )}
          </ProtectedRoute>
        }
      />

      {/* Redirects for old settings URLs */}
      <Route path="/settings/bills" element={<Navigate to="/settings" replace />} />
      <Route path="/settings/paydays" element={<Navigate to="/settings" replace />} />
      <Route path="/settings/accounts" element={<Navigate to="/settings" replace />} />
      <Route path="/settings/profile" element={<Navigate to="/profile" replace />} />
      <Route path="/settings/appearance" element={<Navigate to="/settings" replace />} />
      <Route path="/settings/security" element={<Navigate to="/security" replace />} />
      <Route path="/settings/data" element={<Navigate to="/data" replace />} />
      <Route path="/settings/preferences" element={<Navigate to="/settings" replace />} />
      <Route path="/appearance" element={<Navigate to="/settings" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Type imports for App component
import type { Account, BillTemplate, PaydayTemplate } from '@/types';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Entry, BillTemplate, Account, PaydayTemplate, Bill } from '@/types';
import { generateEntries } from '@/utils/generator';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/config/firebase';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
} from 'firebase/firestore';

interface DataContextType {
  entries: Entry[];
  accounts: Account[];
  templates: BillTemplate[];
  paydayTemplates: PaydayTemplate[];
  addEntry: (entry: Entry) => void;
  updateEntry: (entry: Entry) => void;
  deleteEntry: (id: string) => void;
  addAccount: (name: string) => void;
  removeAccount: (id: string) => void;
  updateAccount: (id: string, name: string) => void;
  reorderAccounts: (accounts: Account[]) => void;
  addTemplate: (template: BillTemplate) => void;
  updateTemplate: (template: BillTemplate) => void;
  deleteTemplate: (id: string) => void;
  addPaydayTemplate: (template: PaydayTemplate) => void;
  updatePaydayTemplate: (template: PaydayTemplate) => void;
  deletePaydayTemplate: (id: string) => void;
  exportData: () => {
    entries: Entry[];
    accounts: Account[];
    templates: BillTemplate[];
    paydayTemplates: PaydayTemplate[];
  };
  importData: (data: {
    entries?: Entry[];
    accounts?: Account[];
    templates?: BillTemplate[];
    paydayTemplates?: PaydayTemplate[];
  }) => Promise<void>;
  deleteAccountData: () => Promise<void>;
  hideOldData: boolean;
  setHideOldData: (hide: boolean) => void;
  hidePaid: boolean;
  setHidePaid: (hide: boolean) => void;
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

/** Get the subcollection path for a user's data */
function userCollection(userId: string, collectionName: string) {
  return collection(db, 'users', userId, collectionName);
}

/** Get a doc ref within a user's subcollection */
function userDoc(userId: string, collectionName: string, docId: string) {
  return doc(db, 'users', userId, collectionName, docId);
}

/** Remove the `id` field before writing to Firestore (doc ID is managed by Firestore) */
function withoutId<T extends { id: string }>({ id: _id, ...rest }: T): Omit<T, 'id'> {
  return rest as Omit<T, 'id'>;
}

/** Strip undefined values from an object before writing to Firestore */
function cleanForFirestore<T extends Record<string, unknown>>(data: T): Partial<T> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result as Partial<T>;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [entries, setEntries] = useState<Entry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [templates, setTemplates] = useState<BillTemplate[]>([]);
  const [paydayTemplates, setPaydayTemplates] = useState<PaydayTemplate[]>([]);
  const [hideOldData, setHideOldDataState] = useState(() => {
    const saved = localStorage.getItem('hideOldData');
    return saved ? JSON.parse(saved) : true;
  });
  const [hidePaid, setHidePaidState] = useState(() => {
    const saved = localStorage.getItem('hidePaid');
    return saved ? JSON.parse(saved) : false;
  });
  const [loading, setLoading] = useState(true);

  // Real-time sync via subcollections
  useEffect(() => {
    if (!user) {
      setEntries([]);
      setAccounts([]);
      setTemplates([]);
      setPaydayTemplates([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const uid = user.uid;

    const unsubEntries = onSnapshot(userCollection(uid, 'entries'), (snapshot) => {
      const data = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as Entry);
      setEntries(data);
    });

    const unsubAccounts = onSnapshot(userCollection(uid, 'accounts'), (snapshot) => {
      const data = snapshot.docs
        .map((d) => ({ ...d.data(), id: d.id }) as Account)
        .sort((a, b) => a.order - b.order);
      setAccounts(data);
    });

    const unsubTemplates = onSnapshot(userCollection(uid, 'templates'), (snapshot) => {
      const data = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as BillTemplate);
      setTemplates(data);
    });

    const unsubPaydayTemplates = onSnapshot(userCollection(uid, 'paydayTemplates'), (snapshot) => {
      const data = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as PaydayTemplate);
      setPaydayTemplates(data);
    });

    setLoading(false);

    return () => {
      unsubEntries();
      unsubAccounts();
      unsubTemplates();
      unsubPaydayTemplates();
    };
  }, [user]);

  // Firestore write helpers using subcollections
  const addToCollection = useCallback(
    async (collectionName: string, data: Record<string, unknown>) => {
      if (!user) return;
      const cleaned = cleanForFirestore(data);
      await addDoc(userCollection(user.uid, collectionName), cleaned);
    },
    [user]
  );

  const updateInCollection = useCallback(
    async (collectionName: string, docId: string, data: Record<string, unknown>) => {
      if (!user) return;
      const cleaned = cleanForFirestore(data);
      await updateDoc(userDoc(user.uid, collectionName, docId), cleaned);
    },
    [user]
  );

  const deleteFromCollection = useCallback(
    async (collectionName: string, docId: string) => {
      if (!user) return;
      await deleteDoc(userDoc(user.uid, collectionName, docId));
    },
    [user]
  );

  // Entry CRUD
  const addEntry = useCallback(
    (entry: Entry) => {
      addToCollection('entries', withoutId(entry) as unknown as Record<string, unknown>);
    },
    [addToCollection]
  );

  const updateEntry = useCallback(
    (entry: Entry) => {
      const { id, ...rest } = entry;
      updateInCollection('entries', id, rest as unknown as Record<string, unknown>);
    },
    [updateInCollection]
  );

  const deleteEntry = useCallback(
    (id: string) => {
      deleteFromCollection('entries', id);
    },
    [deleteFromCollection]
  );

  // Account CRUD
  const addAccount = useCallback(
    (name: string) => {
      if (!accounts.some((a) => a.name === name)) {
        addToCollection('accounts', { name, order: accounts.length });
      }
    },
    [accounts, addToCollection]
  );

  const updateAccount = useCallback(
    (id: string, name: string) => {
      const account = accounts.find((a) => a.id === id);
      if (account) {
        updateInCollection('accounts', id, { name, order: account.order });
      }
    },
    [accounts, updateInCollection]
  );

  const removeAccount = useCallback(
    (id: string) => {
      deleteFromCollection('accounts', id);
    },
    [deleteFromCollection]
  );

  const reorderAccounts = useCallback(
    (newOrder: Account[]) => {
      if (!user) return;
      const batch = writeBatch(db);
      newOrder.forEach((acc, index) => {
        const ref = userDoc(user.uid, 'accounts', acc.id);
        batch.update(ref, { order: index });
      });
      batch.commit();
    },
    [user]
  );

  // Template sync helper
  const syncEntriesWithTemplate = useCallback(
    (template: BillTemplate | PaydayTemplate, isDeleted: boolean = false) => {
      if (isDeleted) {
        entries
          .filter((e) => e.templateId === template.id && !(e as Bill).paid)
          .forEach((e) => deleteFromCollection('entries', e.id));
        return;
      }

      const isBillTemplate = 'amounts' in template;
      const newGenerated = generateEntries(
        isBillTemplate ? [template as BillTemplate] : [],
        !isBillTemplate ? [template as PaydayTemplate] : [],
        new Date().getFullYear()
      );

      newGenerated.forEach((gen) => {
        const alreadyExists = entries.some(
          (e) => e.templateId === template.id && e.month === gen.month && e.date === gen.date
        );

        if (!alreadyExists) {
          addToCollection('entries', withoutId(gen) as unknown as Record<string, unknown>);
        }
      });
    },
    [entries, addToCollection, deleteFromCollection]
  );

  // Bill Template CRUD
  const addTemplate = useCallback(
    (template: BillTemplate) => {
      addToCollection('templates', withoutId(template) as unknown as Record<string, unknown>).then(
        () => {
          syncEntriesWithTemplate(template);
        }
      );
    },
    [addToCollection, syncEntriesWithTemplate]
  );

  const updateTemplate = useCallback(
    (template: BillTemplate) => {
      const { id, ...rest } = template;
      updateInCollection('templates', id, rest as unknown as Record<string, unknown>).then(() => {
        syncEntriesWithTemplate(template);
      });
    },
    [updateInCollection, syncEntriesWithTemplate]
  );

  const deleteTemplate = useCallback(
    (id: string) => {
      const template = templates.find((t) => t.id === id);
      if (template) {
        deleteFromCollection('templates', id);
        syncEntriesWithTemplate(template, true);
      }
    },
    [templates, deleteFromCollection, syncEntriesWithTemplate]
  );

  // Payday Template CRUD
  const addPaydayTemplate = useCallback(
    (template: PaydayTemplate) => {
      addToCollection(
        'paydayTemplates',
        withoutId(template) as unknown as Record<string, unknown>
      ).then(() => {
        syncEntriesWithTemplate(template);
      });
    },
    [addToCollection, syncEntriesWithTemplate]
  );

  const updatePaydayTemplate = useCallback(
    (template: PaydayTemplate) => {
      const { id, ...rest } = template;
      updateInCollection('paydayTemplates', id, rest as unknown as Record<string, unknown>).then(
        () => {
          syncEntriesWithTemplate(template);
        }
      );
    },
    [updateInCollection, syncEntriesWithTemplate]
  );

  const deletePaydayTemplate = useCallback(
    (id: string) => {
      const template = paydayTemplates.find((t) => t.id === id);
      if (template) {
        deleteFromCollection('paydayTemplates', id);
        syncEntriesWithTemplate(template, true);
      }
    },
    [paydayTemplates, deleteFromCollection, syncEntriesWithTemplate]
  );

  // Import/Export
  const exportData = useCallback(() => {
    return { entries, accounts, templates, paydayTemplates };
  }, [entries, accounts, templates, paydayTemplates]);

  const importData = useCallback(
    async (data: {
      entries?: Entry[];
      accounts?: Account[];
      templates?: BillTemplate[];
      paydayTemplates?: PaydayTemplate[];
    }) => {
      if (!user || !data) return;

      const batch = writeBatch(db);
      let count = 0;

      const addToBatch = (collectionName: string, item: Record<string, unknown>) => {
        const ref = doc(userCollection(user.uid, collectionName));
        const cleaned = cleanForFirestore(item);
        batch.set(ref, cleaned);
        count++;
      };

      if (Array.isArray(data.entries)) {
        data.entries.forEach((item) =>
          addToBatch('entries', item as unknown as Record<string, unknown>)
        );
      }
      if (Array.isArray(data.accounts)) {
        data.accounts.forEach((item) =>
          addToBatch('accounts', item as unknown as Record<string, unknown>)
        );
      }
      if (Array.isArray(data.templates)) {
        data.templates.forEach((item) =>
          addToBatch('templates', item as unknown as Record<string, unknown>)
        );
      }
      if (Array.isArray(data.paydayTemplates)) {
        data.paydayTemplates.forEach((item) =>
          addToBatch('paydayTemplates', item as unknown as Record<string, unknown>)
        );
      }

      if (count > 0) {
        await batch.commit();
      }
    },
    [user]
  );

  const deleteAccountData = useCallback(async () => {
    if (!user) return;
    const batch = writeBatch(db);

    const queueDeletes = (items: { id: string }[], collectionName: string) => {
      items.forEach((item) => {
        batch.delete(userDoc(user.uid, collectionName, item.id));
      });
    };

    queueDeletes(entries, 'entries');
    queueDeletes(accounts, 'accounts');
    queueDeletes(templates, 'templates');
    queueDeletes(paydayTemplates, 'paydayTemplates');

    await batch.commit();
  }, [user, entries, accounts, templates, paydayTemplates]);

  const setHideOldData = useCallback((hide: boolean) => {
    setHideOldDataState(hide);
    localStorage.setItem('hideOldData', JSON.stringify(hide));
  }, []);

  const setHidePaid = useCallback((hide: boolean) => {
    setHidePaidState(hide);
    localStorage.setItem('hidePaid', JSON.stringify(hide));
  }, []);

  return (
    <DataContext.Provider
      value={{
        entries,
        accounts,
        templates,
        paydayTemplates,
        addEntry,
        updateEntry,
        deleteEntry,
        addAccount,
        removeAccount,
        updateAccount,
        reorderAccounts,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        addPaydayTemplate,
        updatePaydayTemplate,
        deletePaydayTemplate,
        exportData,
        importData,
        deleteAccountData,
        hideOldData,
        setHideOldData,
        hidePaid,
        setHidePaid,
        loading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
}

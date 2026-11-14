import React, { useEffect, useState } from 'react';
import { ListChecks, PlusCircle, Send } from 'lucide-react';
import { BagList } from './components/BagList';
import { ItemForm, type NewItemPayload } from './components/ItemForm';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { WhatsAppCardPanel } from './components/WhatsAppCardPanel';
import { STARTER_ITEMS } from './data/catalog';
import type { CategoryId, SavedContact, ShoppingItem } from './types/shopping';
import { stepQuantity } from './utils/bagLogic';

const STORAGE_KEYS = {
  items: 'alakti_items_v1',
  phone: 'alakti_phone_v1',
  country: 'alakti_country_v1',
  recipient: 'alakti_recipient_v1',
  contacts: 'alakti_contacts_v1',
} as const;

function readStorageJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function readStorageString(key: string, fallback: string): string {
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

type MobileTab = 'add' | 'list' | 'whatsapp';

export default function App() {
  const [items, setItems] = useState<ShoppingItem[]>(() =>
    readStorageJson<ShoppingItem[]>(STORAGE_KEYS.items, STARTER_ITEMS)
  );
  const [activeFilter, setActiveFilter] = useState<CategoryId | 'all'>('all');
  const [countryCode, setCountryCode] = useState<string>(() =>
    readStorageString(STORAGE_KEYS.country, '964')
  );
  const [phoneNumber, setPhoneNumber] = useState<string>(() =>
    readStorageString(STORAGE_KEYS.phone, '')
  );
  const [recipientLabel, setRecipientLabel] = useState<string>(() =>
    readStorageString(STORAGE_KEYS.recipient, '')
  );
  const [savedContacts, setSavedContacts] = useState<SavedContact[]>(() =>
    readStorageJson<SavedContact[]>(STORAGE_KEYS.contacts, [])
  );
  const [mobileTab, setMobileTab] = useState<MobileTab>('add');

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.items, JSON.stringify(items));
    } catch {
      // ignore quota errors
    }
  }, [items]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.country, countryCode);
      window.localStorage.setItem(STORAGE_KEYS.phone, phoneNumber);
      window.localStorage.setItem(STORAGE_KEYS.recipient, recipientLabel);
    } catch {
      // ignore quota errors
    }
  }, [countryCode, phoneNumber, recipientLabel]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.contacts,
        JSON.stringify(savedContacts)
      );
    } catch {
      // ignore quota errors
    }
  }, [savedContacts]);

  const handleAddItem = (payload: NewItemPayload) => {
    const newItem: ShoppingItem = {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: payload.name,
      category: payload.category,
      quantity: payload.quantity,
      unit: payload.unit,
      note: payload.note,
      checked: false,
      createdAt: Date.now(),
    };
    setItems((prev) => [newItem, ...prev]);
    if (activeFilter !== 'all' && activeFilter !== payload.category) {
      setActiveFilter('all');
    }
  };

  const handleToggleChecked = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleStepQuantity = (id: string, direction: 1 | -1) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: stepQuantity(item.quantity, item.unit, direction),
            }
          : item
      )
    );
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearChecked = () => {
    setItems((prev) => prev.filter((item) => !item.checked));
  };

  const handleClearAll = () => {
    setItems([]);
  };

  const handleLoadStarter = () => {
    setItems(STARTER_ITEMS);
    setActiveFilter('all');
  };

  const handleSaveContact = (contact: Omit<SavedContact, 'id'>) => {
    setSavedContacts((prev) => {
      const exists = prev.some(
        (c) =>
          c.phone === contact.phone && c.countryCode === contact.countryCode
      );
      if (exists) {
        return prev.map((c) =>
          c.phone === contact.phone && c.countryCode === contact.countryCode
            ? { ...c, label: contact.label }
            : c
        );
      }
      const next: SavedContact = {
        ...contact,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
      return [next, ...prev].slice(0, 6);
    });
  };

  const handleDeleteContact = (id: string) => {
    setSavedContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const handleMobileNav = (tab: MobileTab) => {
    setMobileTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pendingCount = items.filter((item) => !item.checked).length;

  return (
    <div className="min-h-screen bg-[#F6F8F6] text-[#111C16] pb-24 lg:pb-10">
      {/* Top Navigation Bar (Strict 3-Zone Contract, 52px height) */}
      <header className="sticky top-0 z-30 h-[52px] border-b border-[#DCE5DD] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-8 px-4 sm:px-6">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="#top"
            className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-[#111C16] whitespace-nowrap shrink-0"
          >
            <img
              src="/icon.svg"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 rounded-lg shrink-0"
            />
            <span className="font-display">علاكتي</span>
          </a>

          {/* Zone 2: Desktop Single-Line Navigation Links */}
          <nav
            aria-label="التنقل الرئيسي"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-[#46574E]"
          >
            <a
              href="#add-item-section"
              className="hover:text-[#111C16] hover:underline underline-offset-4 transition whitespace-nowrap shrink-0"
            >
              إضافة مادة
            </a>
            <a
              href="#bag-list-section"
              className="hover:text-[#111C16] hover:underline underline-offset-4 transition whitespace-nowrap shrink-0 tabular-nums"
            >
              قائمة المواد ({items.length})
            </a>
            <a
              href="#whatsapp-card-section"
              className="hover:text-[#111C16] hover:underline underline-offset-4 transition whitespace-nowrap shrink-0"
            >
              بطاقة واتساب
            </a>
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center shrink-0">
            <PWAInstallButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="top" className="mx-auto max-w-6xl px-4 sm:px-6 pt-5 sm:pt-7">
        {/* Compact Hero Intro */}
        <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111C16] leading-tight">
              قائمة علاكتي للمقاضي اليومية
            </h1>
            <p className="mt-1 text-sm text-[#52635A] max-w-2xl leading-relaxed">
              رتّب احتياجاتك من الفواكه والخضروات واللحوم والدجاج والأسماك حسب الوزن والكمية، وأرسلها كبطاقة جاهزة إلى رقم الواتساب.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#52635A] tabular-nums shrink-0">
            <span>المتبقي للشراء: {pendingCount}</span>
            <span aria-hidden="true">·</span>
            <span>الإجمالي: {items.length}</span>
          </div>
        </div>

        {/* Desktop 2-Column Split / Mobile Tabbed Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Primary Column: Item Form + Bag List */}
          <div className="lg:col-span-7 space-y-5">
            <div className={mobileTab === 'whatsapp' ? 'hidden lg:block' : 'block'}>
              {mobileTab !== 'list' ? (
                <ItemForm onAddItem={handleAddItem} />
              ) : (
                <div className="hidden lg:block">
                  <ItemForm onAddItem={handleAddItem} />
                </div>
              )}
            </div>

            <div className={mobileTab === 'whatsapp' ? 'hidden lg:block' : 'block'}>
              <BagList
                items={items}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                onToggleChecked={handleToggleChecked}
                onStepQuantity={handleStepQuantity}
                onDeleteItem={handleDeleteItem}
                onClearChecked={handleClearChecked}
                onClearAll={handleClearAll}
                onLoadStarter={handleLoadStarter}
              />
            </div>
          </div>

          {/* Secondary Column: Live Card Preview & WhatsApp Sender */}
          <div
            className={`lg:col-span-5 ${
              mobileTab === 'whatsapp' ? 'block' : 'hidden lg:block'
            }`}
          >
            <WhatsAppCardPanel
              items={items}
              countryCode={countryCode}
              phoneNumber={phoneNumber}
              recipientLabel={recipientLabel}
              savedContacts={savedContacts}
              onCountryCodeChange={setCountryCode}
              onPhoneNumberChange={setPhoneNumber}
              onRecipientLabelChange={setRecipientLabel}
              onSaveContact={handleSaveContact}
              onDeleteContact={handleDeleteContact}
            />
          </div>
        </div>
      </main>

      {/* Mobile Fixed Bottom Thumb Navigation (60px height, stays under 15% viewport cap) */}
      <nav
        aria-label="شريط التنقل السفلي"
        className="fixed bottom-0 left-0 right-0 z-40 h-[60px] border-t border-[#DCE5DD] bg-white/95 backdrop-blur-md pb-safe lg:hidden"
      >
        <div className="grid h-full grid-cols-3 items-center">
          <button
            type="button"
            onClick={() => handleMobileNav('add')}
            aria-current={mobileTab === 'add' ? 'page' : undefined}
            className={`flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition ${
              mobileTab === 'add' ? 'text-emerald-700' : 'text-[#52635A]'
            }`}
          >
            <PlusCircle className="h-5 w-5" />
            <span>إضافة مادة</span>
          </button>

          <button
            type="button"
            onClick={() => handleMobileNav('list')}
            aria-current={mobileTab === 'list' ? 'page' : undefined}
            className={`flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition tabular-nums ${
              mobileTab === 'list' ? 'text-emerald-700' : 'text-[#52635A]'
            }`}
          >
            <ListChecks className="h-5 w-5" />
            <span>العلاكة ({items.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleMobileNav('whatsapp')}
            aria-current={mobileTab === 'whatsapp' ? 'page' : undefined}
            className={`flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition ${
              mobileTab === 'whatsapp' ? 'text-emerald-700' : 'text-[#52635A]'
            }`}
          >
            <Send className="h-5 w-5" />
            <span>إرسال واتساب</span>
          </button>
        </div>
      </nav>

      <OfflineIndicator />
    </div>
  );
}

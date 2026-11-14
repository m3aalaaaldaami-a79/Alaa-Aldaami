import React, { useRef, useState } from 'react';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import {
  CATEGORIES,
  CATEGORY_MAP,
  QUICK_SUGGESTIONS,
  UNITS,
  UNIT_MAP,
} from '../data/catalog';
import type { CategoryId, UnitId } from '../types/shopping';
import { normalizeQuantityInput, stepQuantity } from '../utils/bagLogic';
import { CategoryIcon } from './CategoryIcon';

export interface NewItemPayload {
  name: string;
  category: CategoryId;
  quantity: number;
  unit: UnitId;
  note?: string;
}

interface ItemFormProps {
  onAddItem: (payload: NewItemPayload) => void;
}

export const ItemForm: React.FC<ItemFormProps> = ({ onAddItem }) => {
  const [category, setCategory] = useState<CategoryId>('vegetables');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState<UnitId>('kg');
  const [quantityText, setQuantityText] = useState('1');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [justAddedName, setJustAddedName] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleSelectCategory = (nextCat: CategoryId) => {
    setCategory(nextCat);
    const defaultUnit = CATEGORY_MAP[nextCat].defaultUnit;
    setUnit(defaultUnit);
    setQuantityText(defaultUnit === 'g' ? '500' : '1');
    setError(null);
  };

  const handleSelectSuggestion = (
    suggestionName: string,
    suggestedUnit: UnitId,
    suggestedQty: number
  ) => {
    setName(suggestionName);
    setUnit(suggestedUnit);
    setQuantityText(String(suggestedQty));
    setError(null);
  };

  const handleSelectUnit = (nextUnit: UnitId) => {
    setUnit(nextUnit);
    if (nextUnit === 'g' && normalizeQuantityInput(quantityText) < 50) {
      setQuantityText('500');
    } else if (nextUnit !== 'g' && normalizeQuantityInput(quantityText) >= 50) {
      setQuantityText('1');
    }
  };

  const handleStep = (direction: 1 | -1) => {
    const current = normalizeQuantityInput(quantityText);
    const base = current > 0 ? current : UNIT_MAP[unit].min;
    const next = stepQuantity(base, unit, direction);
    setQuantityText(String(next));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('يرجى كتابة اسم المادة المطلوبة أو اختيارها من المقترحات.');
      nameInputRef.current?.focus();
      return;
    }

    const parsedQuantity = normalizeQuantityInput(quantityText);
    if (parsedQuantity <= 0) {
      setError('يرجى إدخال وزن أو كمية صحيحة أكبر من صفر.');
      return;
    }

    onAddItem({
      name: trimmedName,
      category,
      quantity: parsedQuantity,
      unit,
      note: note.trim() || undefined,
    });

    setJustAddedName(trimmedName);
    setName('');
    setNote('');
    setError(null);
    window.setTimeout(() => {
      setJustAddedName((prev) => (prev === trimmedName ? null : prev));
    }, 2200);
  };

  const suggestions = QUICK_SUGGESTIONS[category] ?? [];
  const activeUnitMeta = UNIT_MAP[unit];
  const parsedQty = normalizeQuantityInput(quantityText);

  return (
    <section
      id="add-item-section"
      aria-labelledby="add-item-heading"
      className="rounded-2xl border border-[#DCE5DD] bg-white p-4 sm:p-5 shadow-xs"
    >
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <div>
          <h2 id="add-item-heading" className="text-lg font-bold text-[#111C16]">
            إضافة مادة إلى علاكتي
          </h2>
          <p className="text-xs text-[#52635A] mt-0.5">
            اختر الصنف وحدد الوزن أو الكمية المطلوبة
          </p>
        </div>
        {justAddedName && (
          <span
            role="status"
            aria-live="polite"
            className="text-xs font-semibold text-emerald-700"
          >
            تمت إضافة «{justAddedName}» ✓
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Categories */}
        <div>
          <span className="block text-xs font-semibold text-[#3B4C43] mb-2">
            1. القسم الغذائي
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2" role="group" aria-label="الأقسام الغذائية">
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat.id)}
                  aria-pressed={isSelected}
                  className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2 text-xs font-semibold transition whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${
                    isSelected
                      ? 'border-emerald-700 bg-emerald-700 text-white shadow-xs'
                      : 'border-[#DCE5DD] bg-[#F7FAF7] text-[#27372F] hover:border-emerald-300 hover:bg-emerald-50/60'
                  }`}
                >
                  <CategoryIcon category={cat.id} className="h-4 w-4 shrink-0" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick-pick suggestions */}
        <div>
          <span className="block text-xs font-semibold text-[#3B4C43] mb-1.5">
            مواد سريعة في قسم {CATEGORY_MAP[category].label}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((item) => {
              const isChosen = name.trim() === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() =>
                    handleSelectSuggestion(item.name, item.unit, item.defaultQuantity)
                  }
                  className={`min-h-[36px] rounded-lg border px-2.5 py-1 text-xs font-medium transition whitespace-nowrap shrink-0 ${
                    isChosen
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-[#E2E8E2] bg-white text-[#33443B] hover:border-emerald-300 hover:bg-[#F7FAF7]'
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Item Name + Note */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="item-name-input"
              className="block text-xs font-semibold text-[#3B4C43] mb-1.5"
            >
              2. اسم المادة
            </label>
            <input
              ref={nameInputRef}
              id="item-name-input"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="مثال: طماطة، لحم غنم، سمك مسكوف..."
              className="w-full min-h-[44px] rounded-xl border border-[#CED9CF] bg-[#FAFBF9] px-3.5 py-2 text-sm text-[#111C16] placeholder:text-[#7E8F85] focus:border-emerald-700 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="item-note-input"
              className="block text-xs font-semibold text-[#3B4C43] mb-1.5"
            >
              ملاحظة (اختياري)
            </label>
            <input
              id="item-note-input"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="مثال: ناضج، مقطع بدون عظم..."
              className="w-full min-h-[44px] rounded-xl border border-[#CED9CF] bg-[#FAFBF9] px-3.5 py-2 text-sm text-[#111C16] placeholder:text-[#7E8F85] focus:border-emerald-700 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Unit & Quantity */}
        <div className="space-y-3 rounded-xl bg-[#F4F7F4] p-3.5 border border-[#E3EBE3]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-xs font-semibold text-[#3B4C43]">
              3. الوزن أو الكمية المطلوبة
            </span>
            <div
              className="grid grid-cols-3 sm:flex sm:flex-wrap gap-1.5"
              role="group"
              aria-label="وحدة القياس"
            >
              {UNITS.map((u) => {
                const isSelected = unit === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectUnit(u.id)}
                    aria-pressed={isSelected}
                    className={`min-h-[38px] rounded-lg px-2.5 py-1 text-xs font-semibold transition whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-[#111C16] text-white'
                        : 'bg-white text-[#33443B] border border-[#DCE5DD] hover:bg-slate-50'
                    }`}
                  >
                    {u.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Stepper */}
            <div className="flex items-center rounded-xl border border-[#CED9CF] bg-white overflow-hidden">
              <button
                type="button"
                onClick={() => handleStep(-1)}
                aria-label="إنقاص الكمية"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center text-[#27372F] hover:bg-slate-100 active:bg-slate-200 transition"
              >
                <Minus className="h-4 w-4" />
              </button>

              <label htmlFor="item-quantity-input" className="sr-only">
                الكمية أو الوزن
              </label>
              <input
                id="item-quantity-input"
                type="text"
                inputMode="decimal"
                dir="ltr"
                value={quantityText}
                onChange={(e) => {
                  setQuantityText(e.target.value);
                  if (error) setError(null);
                }}
                className="w-20 min-h-[44px] border-x border-[#E2E8E2] bg-white px-2 text-center text-base font-bold text-[#111C16] tabular-nums focus:outline-none"
              />

              <button
                type="button"
                onClick={() => handleStep(1)}
                aria-label="زيادة الكمية"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center text-[#27372F] hover:bg-slate-100 active:bg-slate-200 transition"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <span className="text-sm font-semibold text-[#27372F]">
              {activeUnitMeta.label}
            </span>

            {/* Presets */}
            <div className="flex w-full sm:w-auto flex-wrap items-center gap-1.5">
              {activeUnitMeta.presets.map((preset) => {
                const isSame = parsedQty === preset.value;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setQuantityText(String(preset.value));
                      setError(null);
                    }}
                    className={`min-h-[36px] rounded-lg px-2.5 py-1 text-xs font-semibold tabular-nums transition whitespace-nowrap shrink-0 ${
                      isSame
                        ? 'bg-emerald-700 text-white'
                        : 'bg-white border border-[#DCE5DD] text-[#33443B] hover:border-emerald-400'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-800"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          <ShoppingBag className="h-4 w-4 shrink-0" />
          <span>إضافة إلى علاكتي</span>
        </button>
      </form>
    </section>
  );
};

import React, { useState } from 'react';
import { Check, Minus, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { CATEGORIES, CATEGORY_MAP } from '../data/catalog';
import type { CategoryId, ShoppingItem } from '../types/shopping';
import { formatQuantity, summarizeBag } from '../utils/bagLogic';
import { CategoryIcon } from './CategoryIcon';

interface BagListProps {
  items: ShoppingItem[];
  activeFilter: CategoryId | 'all';
  onFilterChange: (filter: CategoryId | 'all') => void;
  onToggleChecked: (id: string) => void;
  onStepQuantity: (id: string, direction: 1 | -1) => void;
  onDeleteItem: (id: string) => void;
  onClearChecked: () => void;
  onClearAll: () => void;
  onLoadStarter: () => void;
}

export const BagList: React.FC<BagListProps> = ({
  items,
  activeFilter,
  onFilterChange,
  onToggleChecked,
  onStepQuantity,
  onDeleteItem,
  onClearChecked,
  onClearAll,
  onLoadStarter,
}) => {
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const summary = summarizeBag(items);
  const filteredItems =
    activeFilter === 'all'
      ? items
      : items.filter((item) => item.category === activeFilter);

  return (
    <section
      id="bag-list-section"
      aria-labelledby="bag-list-heading"
      className="rounded-2xl border border-[#DCE5DD] bg-white p-4 sm:p-6 shadow-xs"
    >
      {/* Header & Unboxed Summary */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 id="bag-list-heading" className="text-lg font-bold text-[#111C16]">
            محتويات علاكتي
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#52635A] tabular-nums">
            <span>{summary.totalItems} مادة</span>
            <span aria-hidden="true">·</span>
            <span>متبقي {summary.pendingItems}</span>
            {summary.totalKg > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>إجمالي الوزن {summary.totalKg} كغم</span>
              </>
            )}
          </div>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-2">
            {summary.checkedItems > 0 && (
              <button
                type="button"
                onClick={onClearChecked}
                className="min-h-[38px] rounded-lg border border-[#DCE5DD] bg-white px-3 py-1.5 text-xs font-semibold text-[#33443B] hover:bg-slate-50 transition whitespace-nowrap shrink-0"
              >
                حذف المكتمل ({summary.checkedItems})
              </button>
            )}
            {!confirmClearAll ? (
              <button
                type="button"
                onClick={() => setConfirmClearAll(true)}
                className="min-h-[38px] rounded-lg border border-rose-200 bg-rose-50/70 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition whitespace-nowrap shrink-0"
              >
                إفراغ العلاكة
              </button>
            ) : (
              <div className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1">
                <span className="text-xs font-semibold text-rose-800 whitespace-nowrap">
                  تأكيد المسح؟
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClearAll();
                    setConfirmClearAll(false);
                  }}
                  className="min-h-[32px] rounded-md bg-rose-700 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-800 whitespace-nowrap"
                >
                  نعم
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(false)}
                  className="min-h-[32px] rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 whitespace-nowrap"
                >
                  إلغاء
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-3 border-b border-[#E8EEE9]"
        role="tablist"
        aria-label="تصفية القائمة حسب القسم"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeFilter === 'all'}
          onClick={() => onFilterChange('all')}
          className={`min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap shrink-0 tabular-nums ${
            activeFilter === 'all'
              ? 'bg-[#111C16] text-white'
              : 'bg-[#F4F7F4] text-[#3B4C43] hover:bg-[#E7EFE8]'
          }`}
        >
          الكل ({items.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = summary.byCategory[cat.id] ?? 0;
          const isSelected = activeFilter === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onFilterChange(cat.id)}
              className={`min-h-[38px] inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap shrink-0 tabular-nums ${
                isSelected
                  ? 'bg-emerald-700 text-white'
                  : 'bg-[#F4F7F4] text-[#3B4C43] hover:bg-[#E7EFE8]'
              }`}
            >
              <span>{cat.label}</span>
              {count > 0 && <span className="opacity-85">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* List Content */}
      {items.length === 0 ? (
        <div className="py-10 text-center space-y-3">
          <p className="text-sm font-semibold text-[#27372F]">
            علاكتك فارغة حالياً
          </p>
          <p className="text-xs text-[#52635A] max-w-xs mx-auto leading-relaxed">
            أضف ما تحتاجه من الفواكه والخضروات واللحوم والدجاج والأسماك من النموذج أعلاه، أو ابدأ بقائمة جاهزة.
          </p>
          <button
            type="button"
            onClick={onLoadStarter}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition"
          >
            <RotateCcw className="h-4 w-4" />
            <span>إضافة قائمة تجريبية سريعة</span>
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm font-medium text-[#52635A]">
            لا توجد مواد مضافة في قسم «{CATEGORY_MAP[activeFilter as CategoryId]?.label}».
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-[#EDF2EE]" data-testid="bag-items-list">
          {filteredItems.map((item) => {
            const catMeta = CATEGORY_MAP[item.category];
            return (
              <li
                key={item.id}
                className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 py-3 min-h-[64px]"
              >
                {/* Check + Title + Unboxed metadata */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => onToggleChecked(item.id)}
                    aria-label={
                      item.checked
                        ? `إلغاء تحديد ${item.name} كمكتمل`
                        : `تحديد ${item.name} كمكتمل`
                    }
                    aria-pressed={item.checked}
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${
                      item.checked
                        ? 'border-emerald-700 bg-emerald-700 text-white'
                        : 'border-[#CED9CF] bg-[#FAFBF9] text-transparent hover:border-emerald-500'
                    }`}
                  >
                    <Check className="h-5 w-5" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm sm:text-base font-bold truncate ${
                          item.checked
                            ? 'line-through text-[#7E8F85]'
                            : 'text-[#111C16]'
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-[#52635A]">
                      <span className={`inline-flex items-center gap-1 font-medium ${catMeta.textColor}`}>
                        <CategoryIcon category={item.category} className="h-3.5 w-3.5" />
                        <span>{catMeta.label}</span>
                      </span>
                      {item.note && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="truncate max-w-[200px]">{item.note}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Inline quantity stepper + delete */}
                <div className="flex items-center gap-2 shrink-0 mr-auto sm:mr-0">
                  <div className="flex items-center rounded-xl border border-[#DCE5DD] bg-[#F8FAF8]">
                    <button
                      type="button"
                      onClick={() => onStepQuantity(item.id, -1)}
                      aria-label={`إنقاص كمية ${item.name}`}
                      className="flex h-10 w-10 items-center justify-center text-[#27372F] hover:bg-slate-200/60 rounded-r-xl transition"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-[68px] px-2 text-center text-xs sm:text-sm font-bold text-[#111C16] tabular-nums whitespace-nowrap">
                      {formatQuantity(item.quantity, item.unit)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onStepQuantity(item.id, 1)}
                      aria-label={`زيادة كمية ${item.name}`}
                      className="flex h-10 w-10 items-center justify-center text-[#27372F] hover:bg-slate-200/60 rounded-l-xl transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteItem(item.id)}
                    aria-label={`حذف ${item.name}`}
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-[#6A7B71] hover:bg-rose-50 hover:text-rose-700 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

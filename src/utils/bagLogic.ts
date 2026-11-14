import { CATEGORIES, CATEGORY_MAP, UNIT_MAP } from '../data/catalog';
import type { CategoryId, ShoppingItem, UnitId } from '../types/shopping';

const ARABIC_INDIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const EASTERN_ARABIC_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toWesternDigits(input: string): string {
  let out = input;
  for (let i = 0; i < 10; i++) {
    out = out.replaceAll(ARABIC_INDIC_DIGITS[i], String(i));
    out = out.replaceAll(EASTERN_ARABIC_DIGITS[i], String(i));
  }
  return out;
}

export function normalizeQuantityInput(raw: string | number): number {
  if (typeof raw === 'number') {
    if (!Number.isFinite(raw) || raw <= 0) return 0;
    return Math.round(raw * 100) / 100;
  }
  const normalized = toWesternDigits(raw)
    .replace(/[٫,]/g, '.')
    .replace(/[^0-9.]/g, '');
  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.round(parsed * 100) / 100;
}

export function getUnitStep(unit: UnitId): number {
  return UNIT_MAP[unit]?.step ?? 1;
}

export function stepQuantity(
  current: number,
  unit: UnitId,
  direction: 1 | -1
): number {
  const meta = UNIT_MAP[unit];
  const step = meta?.step ?? 1;
  const min = meta?.min ?? 1;
  const next = Math.round((current + direction * step) * 100) / 100;
  return Math.max(min, next);
}

export function formatQuantity(quantity: number, unit: UnitId): string {
  const rounded = Math.round(quantity * 100) / 100;
  const unitLabel = UNIT_MAP[unit]?.label ?? unit;
  return `${rounded} ${unitLabel}`;
}

export interface NormalizedPhoneResult {
  valid: boolean;
  e164Digits: string;
  formattedDisplay: string;
  error?: string;
}

export function normalizeWhatsAppPhone(
  rawPhone: string,
  countryCode: string
): NormalizedPhoneResult {
  const westernPhone = toWesternDigits(rawPhone).trim();
  const westernCode = toWesternDigits(countryCode).replace(/\D/g, '');

  if (!westernPhone) {
    return {
      valid: false,
      e164Digits: '',
      formattedDisplay: '',
      error: 'يرجى إدخال رقم الواتساب أولاً',
    };
  }

  let digits = westernPhone.replace(/[\s\-().]/g, '');
  const hasPlusPrefix = digits.startsWith('+');
  const hasDoubleZero = digits.startsWith('00');

  digits = digits.replace(/\D/g, '');
  if (!digits) {
    return {
      valid: false,
      e164Digits: '',
      formattedDisplay: '',
      error: 'يرجى إدخال أرقام صحيحة لرقم الواتساب',
    };
  }

  let fullDigits = '';
  if (hasPlusPrefix) {
    fullDigits = digits;
  } else if (hasDoubleZero) {
    fullDigits = digits.slice(2);
  } else if (westernCode && digits.startsWith(westernCode) && digits.length >= westernCode.length + 7) {
    fullDigits = digits;
  } else {
    const localDigits = digits.replace(/^0+/, '');
    if (!localDigits) {
      return {
        valid: false,
        e164Digits: '',
        formattedDisplay: '',
        error: 'رقم الهاتف غير مكتمل',
      };
    }
    fullDigits = `${westernCode}${localDigits}`;
  }

  if (fullDigits.length < 8) {
    return {
      valid: false,
      e164Digits: '',
      formattedDisplay: '',
      error: 'رقم الواتساب قصير جداً، يرجى التحقق منه',
    };
  }

  if (fullDigits.length > 15) {
    return {
      valid: false,
      e164Digits: '',
      formattedDisplay: '',
      error: 'رقم الواتساب أطول من المسموح دولياً',
    };
  }

  return {
    valid: true,
    e164Digits: fullDigits,
    formattedDisplay: `+${fullDigits}`,
  };
}

export interface BagSummary {
  totalItems: number;
  pendingItems: number;
  checkedItems: number;
  totalKg: number;
  byCategory: Record<CategoryId, number>;
}

export function summarizeBag(items: ShoppingItem[]): BagSummary {
  const byCategory: Record<CategoryId, number> = {
    fruits: 0,
    vegetables: 0,
    meats: 0,
    poultry: 0,
    fish: 0,
    other: 0,
  };

  let checkedItems = 0;
  let totalKg = 0;

  for (const item of items) {
    byCategory[item.category] = (byCategory[item.category] ?? 0) + 1;
    if (item.checked) {
      checkedItems += 1;
    }
    if (item.unit === 'kg') {
      totalKg += item.quantity;
    } else if (item.unit === 'g') {
      totalKg += item.quantity / 1000;
    }
  }

  return {
    totalItems: items.length,
    pendingItems: items.length - checkedItems,
    checkedItems,
    totalKg: Math.round(totalKg * 100) / 100,
    byCategory,
  };
}

export function groupItemsByCategory(
  items: ShoppingItem[]
): Array<{ category: CategoryId; label: string; items: ShoppingItem[] }> {
  const groups: Array<{ category: CategoryId; label: string; items: ShoppingItem[] }> = [];
  for (const cat of CATEGORIES) {
    const matching = items.filter((item) => item.category === cat.id);
    if (matching.length > 0) {
      groups.push({
        category: cat.id,
        label: cat.label,
        items: matching,
      });
    }
  }
  return groups;
}

export interface BuildCardParams {
  items: ShoppingItem[];
  listTitle?: string;
  recipientLabel?: string;
  includeChecked?: boolean;
  dateText?: string;
}

export function buildWhatsAppCardText(params: BuildCardParams): string {
  const {
    items,
    listTitle = 'بطاقة علاكتي للمقاضي',
    recipientLabel,
    includeChecked = false,
    dateText,
  } = params;

  const activeItems = includeChecked ? items : items.filter((item) => !item.checked);
  const grouped = groupItemsByCategory(activeItems);

  const lines: string[] = [];
  lines.push(`🛍️ *${listTitle}*`);
  if (dateText) {
    lines.push(`📅 ${dateText}`);
  }
  if (recipientLabel && recipientLabel.trim()) {
    lines.push(`👤 إلى: ${recipientLabel.trim()}`);
  }
  lines.push('━━━━━━━━━━━━━━━━━━');

  if (grouped.length === 0) {
    lines.push('القائمة فارغة حالياً.');
  } else {
    for (const group of grouped) {
      const catLabel = CATEGORY_MAP[group.category]?.label ?? group.label;
      lines.push('');
      lines.push(`▪️ *${catLabel}* (${group.items.length})`);
      for (const item of group.items) {
        const qtyStr = formatQuantity(item.quantity, item.unit);
        const statusMark = item.checked ? '✅ ' : '• ';
        const notePart = item.note?.trim() ? ` — _(${item.note.trim()})_` : '';
        lines.push(`${statusMark}*${item.name}* : ${qtyStr}${notePart}`);
      }
    }
  }

  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━');
  const summary = summarizeBag(activeItems);
  const weightSuffix = summary.totalKg > 0 ? ` | الوزن الكلي: ${summary.totalKg} كغم` : '';
  lines.push(`📦 الإجمالي: *${activeItems.length}* مادة${weightSuffix}`);
  lines.push('✨ تم الإعداد عبر تطبيق *علاكتي*');

  return lines.join('\n');
}

export function buildWhatsAppUrl(e164Digits: string, cardText: string): string {
  const cleanDigits = e164Digits.replace(/\D/g, '');
  return `https://wa.me/${cleanDigits}?text=${encodeURIComponent(cardText)}`;
}

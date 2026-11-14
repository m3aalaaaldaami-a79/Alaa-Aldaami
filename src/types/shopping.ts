export type CategoryId =
  | 'fruits'
  | 'vegetables'
  | 'meats'
  | 'poultry'
  | 'fish'
  | 'other';

export type UnitId = 'kg' | 'g' | 'piece' | 'pack' | 'dozen' | 'box';

export interface ShoppingItem {
  id: string;
  name: string;
  category: CategoryId;
  quantity: number;
  unit: UnitId;
  note?: string;
  checked: boolean;
  createdAt: number;
}

export interface SavedContact {
  id: string;
  label: string;
  countryCode: string;
  phone: string;
}

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  defaultUnit: UnitId;
  textColor: string;
  softBg: string;
  borderColor: string;
  accentHex: string;
}

export interface QuickSuggestion {
  name: string;
  unit: UnitId;
  defaultQuantity: number;
}

export interface CountryOption {
  code: string;
  label: string;
  shortLabel: string;
  placeholder: string;
}

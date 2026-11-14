import type {
  CategoryId,
  CategoryMeta,
  CountryOption,
  QuickSuggestion,
  ShoppingItem,
  UnitId,
} from '../types/shopping';

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'fruits',
    label: 'فواكه',
    defaultUnit: 'kg',
    textColor: 'text-amber-800',
    softBg: 'bg-amber-50',
    borderColor: 'border-amber-200',
    accentHex: '#b45309',
  },
  {
    id: 'vegetables',
    label: 'خضروات',
    defaultUnit: 'kg',
    textColor: 'text-emerald-800',
    softBg: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    accentHex: '#15803d',
  },
  {
    id: 'meats',
    label: 'لحوم',
    defaultUnit: 'kg',
    textColor: 'text-rose-800',
    softBg: 'bg-rose-50',
    borderColor: 'border-rose-200',
    accentHex: '#9f1239',
  },
  {
    id: 'poultry',
    label: 'دجاج',
    defaultUnit: 'kg',
    textColor: 'text-orange-800',
    softBg: 'bg-orange-50',
    borderColor: 'border-orange-200',
    accentHex: '#c2410c',
  },
  {
    id: 'fish',
    label: 'أسماك',
    defaultUnit: 'kg',
    textColor: 'text-sky-800',
    softBg: 'bg-sky-50',
    borderColor: 'border-sky-200',
    accentHex: '#0369a1',
  },
  {
    id: 'other',
    label: 'مواد أخرى',
    defaultUnit: 'piece',
    textColor: 'text-slate-700',
    softBg: 'bg-slate-100',
    borderColor: 'border-slate-200',
    accentHex: '#334155',
  },
];

export const CATEGORY_MAP: Record<CategoryId, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
) as Record<CategoryId, CategoryMeta>;

export interface UnitMeta {
  id: UnitId;
  label: string;
  step: number;
  min: number;
  presets: { label: string; value: number }[];
}

export const UNITS: UnitMeta[] = [
  {
    id: 'kg',
    label: 'كيلو',
    step: 0.5,
    min: 0.25,
    presets: [
      { label: 'ربع (0.25)', value: 0.25 },
      { label: 'نصف (0.5)', value: 0.5 },
      { label: '1 كيلو', value: 1 },
      { label: '2 كيلو', value: 2 },
      { label: '3 كيلو', value: 3 },
    ],
  },
  {
    id: 'g',
    label: 'غرام',
    step: 250,
    min: 50,
    presets: [
      { label: '100 غ', value: 100 },
      { label: '250 غ', value: 250 },
      { label: '500 غ', value: 500 },
      { label: '750 غ', value: 750 },
    ],
  },
  {
    id: 'piece',
    label: 'حبة / قطعة',
    step: 1,
    min: 1,
    presets: [
      { label: '1', value: 1 },
      { label: '2', value: 2 },
      { label: '4', value: 4 },
      { label: '6', value: 6 },
    ],
  },
  {
    id: 'pack',
    label: 'علبة / كيس',
    step: 1,
    min: 1,
    presets: [
      { label: '1', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '5', value: 5 },
    ],
  },
  {
    id: 'dozen',
    label: 'دزينة',
    step: 1,
    min: 1,
    presets: [
      { label: '1', value: 1 },
      { label: '2', value: 2 },
    ],
  },
  {
    id: 'box',
    label: 'سلة / صندوق',
    step: 1,
    min: 1,
    presets: [
      { label: '1', value: 1 },
      { label: '2', value: 2 },
    ],
  },
];

export const UNIT_MAP: Record<UnitId, UnitMeta> = Object.fromEntries(
  UNITS.map((u) => [u.id, u])
) as Record<UnitId, UnitMeta>;

export const QUICK_SUGGESTIONS: Record<CategoryId, QuickSuggestion[]> = {
  fruits: [
    { name: 'تفاح أحمر', unit: 'kg', defaultQuantity: 1 },
    { name: 'موز', unit: 'kg', defaultQuantity: 1.5 },
    { name: 'برتقال', unit: 'kg', defaultQuantity: 2 },
    { name: 'رقي', unit: 'piece', defaultQuantity: 1 },
    { name: 'عنب', unit: 'kg', defaultQuantity: 1 },
    { name: 'رمان', unit: 'kg', defaultQuantity: 1 },
    { name: 'ليمون', unit: 'kg', defaultQuantity: 0.5 },
    { name: 'تمر', unit: 'kg', defaultQuantity: 1 },
  ],
  vegetables: [
    { name: 'طماطة', unit: 'kg', defaultQuantity: 2 },
    { name: 'خيار', unit: 'kg', defaultQuantity: 1 },
    { name: 'بطاطا', unit: 'kg', defaultQuantity: 2 },
    { name: 'بصل', unit: 'kg', defaultQuantity: 1.5 },
    { name: 'باذنجان', unit: 'kg', defaultQuantity: 1 },
    { name: 'فلفل أخضر', unit: 'kg', defaultQuantity: 0.5 },
    { name: 'ثوم', unit: 'g', defaultQuantity: 250 },
    { name: 'خس', unit: 'piece', defaultQuantity: 2 },
  ],
  meats: [
    { name: 'لحم غنم بعظم', unit: 'kg', defaultQuantity: 1 },
    { name: 'لحم غنم مفروم', unit: 'kg', defaultQuantity: 0.5 },
    { name: 'لحم عجل هبرة', unit: 'kg', defaultQuantity: 1 },
    { name: 'لحم عجل مفروم', unit: 'kg', defaultQuantity: 1 },
    { name: 'ريش غنم', unit: 'kg', defaultQuantity: 1 },
    { name: 'كبدة / معلاك', unit: 'g', defaultQuantity: 500 },
  ],
  poultry: [
    { name: 'دجاجة كاملة', unit: 'piece', defaultQuantity: 2 },
    { name: 'صدر دجاج', unit: 'kg', defaultQuantity: 1 },
    { name: 'أفخاذ دجاج', unit: 'kg', defaultQuantity: 1 },
    { name: 'أجنحة دجاج', unit: 'kg', defaultQuantity: 1 },
    { name: 'شاورما دجاج متبلة', unit: 'g', defaultQuantity: 500 },
  ],
  fish: [
    { name: 'سمك مسكوف (كارب)', unit: 'kg', defaultQuantity: 2 },
    { name: 'سمك زبيدي', unit: 'kg', defaultQuantity: 1 },
    { name: 'فيليه سمك', unit: 'kg', defaultQuantity: 1 },
    { name: 'روبيان طازج', unit: 'g', defaultQuantity: 500 },
    { name: 'سمك هامور', unit: 'kg', defaultQuantity: 1.5 },
  ],
  other: [
    { name: 'خبز / صمون', unit: 'pack', defaultQuantity: 2 },
    { name: 'بيض', unit: 'dozen', defaultQuantity: 1 },
    { name: 'حليب طازج', unit: 'pack', defaultQuantity: 2 },
    { name: 'جبن أبيض', unit: 'g', defaultQuantity: 500 },
    { name: 'رز (تمن)', unit: 'kg', defaultQuantity: 5 },
    { name: 'زيت طبخ', unit: 'pack', defaultQuantity: 1 },
  ],
};

export const COUNTRY_CODES: CountryOption[] = [
  { code: '964', label: 'العراق (+964)', shortLabel: 'العراق 964+', placeholder: '0770 123 4567' },
  { code: '966', label: 'السعودية (+966)', shortLabel: 'السعودية 966+', placeholder: '050 123 4567' },
  { code: '971', label: 'الإمارات (+971)', shortLabel: 'الإمارات 971+', placeholder: '050 123 4567' },
  { code: '965', label: 'الكويت (+965)', shortLabel: 'الكويت 965+', placeholder: '5123 4567' },
  { code: '962', label: 'الأردن (+962)', shortLabel: 'الأردن 962+', placeholder: '079 123 4567' },
  { code: '20', label: 'مصر (+20)', shortLabel: 'مصر 20+', placeholder: '010 1234 5678' },
  { code: '974', label: 'قطر (+974)', shortLabel: 'قطر 974+', placeholder: '5512 3456' },
  { code: '973', label: 'البحرين (+973)', shortLabel: 'البحرين 973+', placeholder: '3612 3456' },
  { code: '968', label: 'عُمان (+968)', shortLabel: 'عُمان 968+', placeholder: '9123 4567' },
  { code: '961', label: 'لبنان (+961)', shortLabel: 'لبنان 961+', placeholder: '70 123 456' },
  { code: '90', label: 'تركيا (+90)', shortLabel: 'تركيا 90+', placeholder: '0532 123 4567' },
  { code: '44', label: 'بريطانيا (+44)', shortLabel: 'بريطانيا 44+', placeholder: '07700 900123' },
  { code: '49', label: 'ألمانيا (+49)', shortLabel: 'ألمانيا 49+', placeholder: '0151 23456789' },
  { code: '1', label: 'أمريكا/كندا (+1)', shortLabel: 'أمريكا 1+', placeholder: '202 555 0143' },
];

export const STARTER_ITEMS: ShoppingItem[] = [
  {
    id: 'seed-1',
    name: 'طماطة',
    category: 'vegetables',
    quantity: 2,
    unit: 'kg',
    note: 'طازجة للسلطة',
    checked: false,
    createdAt: 1700000001000,
  },
  {
    id: 'seed-2',
    name: 'تفاح أحمر',
    category: 'fruits',
    quantity: 1.5,
    unit: 'kg',
    checked: false,
    createdAt: 1700000002000,
  },
  {
    id: 'seed-3',
    name: 'لحم غنم مفروم',
    category: 'meats',
    quantity: 500,
    unit: 'g',
    note: 'مفروم ناعم',
    checked: false,
    createdAt: 1700000003000,
  },
  {
    id: 'seed-4',
    name: 'صدر دجاج',
    category: 'poultry',
    quantity: 1,
    unit: 'kg',
    checked: false,
    createdAt: 1700000004000,
  },
];

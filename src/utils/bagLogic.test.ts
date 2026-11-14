import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWhatsAppCardText,
  buildWhatsAppUrl,
  formatQuantity,
  groupItemsByCategory,
  normalizeQuantityInput,
  normalizeWhatsAppPhone,
  stepQuantity,
  summarizeBag,
  toWesternDigits,
} from './bagLogic';
import type { ShoppingItem } from '../types/shopping';

test('toWesternDigits converts Arabic-Indic and Eastern Arabic numerals', () => {
  assert.equal(toWesternDigits('٠٧٧٠١٢٣٤٥٦٧'), '07701234567');
  assert.equal(toWesternDigits('۲٫۵'), '2٫5');
});

test('normalizeQuantityInput parses Arabic decimals and rejects non-positive inputs', () => {
  assert.equal(normalizeQuantityInput('١٫٥'), 1.5);
  assert.equal(normalizeQuantityInput('2,25'), 2.25);
  assert.equal(normalizeQuantityInput('500'), 500);
  assert.equal(normalizeQuantityInput('-3'), 3); // stripped minus -> 3
  assert.equal(normalizeQuantityInput('0'), 0);
  assert.equal(normalizeQuantityInput('abc'), 0);
});

test('stepQuantity increments and clamps cleanly by unit', () => {
  assert.equal(stepQuantity(1, 'kg', 1), 1.5);
  assert.equal(stepQuantity(0.5, 'kg', -1), 0.25);
  assert.equal(stepQuantity(0.25, 'kg', -1), 0.25);
  assert.equal(stepQuantity(500, 'g', 1), 750);
  assert.equal(stepQuantity(1, 'piece', -1), 1);
  assert.equal(stepQuantity(2, 'piece', 1), 3);
});

test('normalizeWhatsAppPhone handles local Iraqi numbers, Arabic digits, + and 00 prefixes', () => {
  const iraqLocal = normalizeWhatsAppPhone('0770 123 4567', '964');
  assert.equal(iraqLocal.valid, true);
  assert.equal(iraqLocal.e164Digits, '9647701234567');
  assert.equal(iraqLocal.formattedDisplay, '+9647701234567');

  const arabicDigits = normalizeWhatsAppPhone('٠٧٨٠٩٨٧٦٥٤٣', '964');
  assert.equal(arabicDigits.valid, true);
  assert.equal(arabicDigits.e164Digits, '9647809876543');

  const withDoubleZero = normalizeWhatsAppPhone('00966501234567', '964');
  assert.equal(withDoubleZero.valid, true);
  assert.equal(withDoubleZero.e164Digits, '966501234567');

  const withPlus = normalizeWhatsAppPhone('+971 50 123 4567', '964');
  assert.equal(withPlus.valid, true);
  assert.equal(withPlus.e164Digits, '971501234567');

  const empty = normalizeWhatsAppPhone('', '964');
  assert.equal(empty.valid, false);
  assert.ok(empty.error);

  const tooShort = normalizeWhatsAppPhone('1234', '964');
  assert.equal(tooShort.valid, false);
  assert.ok(tooShort.error);
});

test('summarizeBag and groupItemsByCategory compute accurate counts and weights', () => {
  const items: ShoppingItem[] = [
    {
      id: '1',
      name: 'طماطة',
      category: 'vegetables',
      quantity: 2,
      unit: 'kg',
      checked: false,
      createdAt: 1,
    },
    {
      id: '2',
      name: 'لحم غنم',
      category: 'meats',
      quantity: 500,
      unit: 'g',
      checked: true,
      createdAt: 2,
    },
    {
      id: '3',
      name: 'دجاجة كاملة',
      category: 'poultry',
      quantity: 2,
      unit: 'piece',
      checked: false,
      createdAt: 3,
    },
  ];

  const summary = summarizeBag(items);
  assert.equal(summary.totalItems, 3);
  assert.equal(summary.pendingItems, 2);
  assert.equal(summary.checkedItems, 1);
  assert.equal(summary.totalKg, 2.5);
  assert.equal(summary.byCategory.vegetables, 1);
  assert.equal(summary.byCategory.meats, 1);
  assert.equal(summary.byCategory.poultry, 1);

  const grouped = groupItemsByCategory(items);
  assert.equal(grouped.length, 3);
  assert.equal(grouped[0].label, 'خضروات');
});

test('buildWhatsAppCardText and buildWhatsAppUrl generate clean RTL WhatsApp card message', () => {
  const items: ShoppingItem[] = [
    {
      id: '1',
      name: 'سمك مسكوف',
      category: 'fish',
      quantity: 2.5,
      unit: 'kg',
      note: 'منظف ومفتوح',
      checked: false,
      createdAt: 1,
    },
    {
      id: '2',
      name: 'تفاح',
      category: 'fruits',
      quantity: 1,
      unit: 'kg',
      checked: true,
      createdAt: 2,
    },
  ];

  const cardText = buildWhatsAppCardText({
    items,
    recipientLabel: 'أبو علي',
    includeChecked: false,
    dateText: 'الجمعة',
  });

  assert.match(cardText, /بطاقة علاكتي للمقاضي/);
  assert.match(cardText, /أبو علي/);
  assert.match(cardText, /أسماك/);
  assert.match(cardText, /سمك مسكوف/);
  assert.match(cardText, /2\.5 كيلو/);
  assert.match(cardText, /منظف ومفتوح/);
  assert.doesNotMatch(cardText, /تفاح/); // checked item excluded by default

  const url = buildWhatsAppUrl('9647701234567', cardText);
  assert.ok(url.startsWith('https://wa.me/9647701234567?text='));
  assert.ok(url.includes(encodeURIComponent('سمك مسكوف')));
  assert.equal(formatQuantity(500, 'g'), '500 غرام');
});

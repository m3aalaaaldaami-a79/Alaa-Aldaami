import React, { useMemo, useRef, useState } from 'react';
import {
  BookmarkPlus,
  Check,
  Copy,
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Send,
  Share2,
  Trash2,
} from 'lucide-react';
import { CATEGORY_MAP, COUNTRY_CODES } from '../data/catalog';
import type { SavedContact, ShoppingItem } from '../types/shopping';
import {
  buildWhatsAppCardText,
  buildWhatsAppUrl,
  formatQuantity,
  groupItemsByCategory,
  normalizeWhatsAppPhone,
  summarizeBag,
} from '../utils/bagLogic';
import { renderWhatsAppCardBlob } from '../utils/cardImage';
import { CategoryIcon } from './CategoryIcon';

interface WhatsAppCardPanelProps {
  items: ShoppingItem[];
  countryCode: string;
  phoneNumber: string;
  recipientLabel: string;
  savedContacts: SavedContact[];
  onCountryCodeChange: (code: string) => void;
  onPhoneNumberChange: (phone: string) => void;
  onRecipientLabelChange: (label: string) => void;
  onSaveContact: (contact: Omit<SavedContact, 'id'>) => void;
  onDeleteContact: (id: string) => void;
}

export const WhatsAppCardPanel: React.FC<WhatsAppCardPanelProps> = ({
  items,
  countryCode,
  phoneNumber,
  recipientLabel,
  savedContacts,
  onCountryCodeChange,
  onPhoneNumberChange,
  onRecipientLabelChange,
  onSaveContact,
  onDeleteContact,
}) => {
  const [previewMode, setPreviewMode] = useState<'visual' | 'text'>('visual');
  const [includeChecked, setIncludeChecked] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);

  const phoneInputRef = useRef<HTMLInputElement>(null);

  const dateText = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('ar-IQ', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date());
    } catch {
      return new Date().toLocaleDateString();
    }
  }, []);

  const activeItems = useMemo(
    () => (includeChecked ? items : items.filter((item) => !item.checked)),
    [items, includeChecked]
  );

  const grouped = useMemo(() => groupItemsByCategory(activeItems), [activeItems]);
  const summary = useMemo(() => summarizeBag(activeItems), [activeItems]);

  const cardText = useMemo(
    () =>
      buildWhatsAppCardText({
        items,
        recipientLabel,
        includeChecked,
        dateText,
      }),
    [items, recipientLabel, includeChecked, dateText]
  );

  const phoneCheck = useMemo(
    () => normalizeWhatsAppPhone(phoneNumber, countryCode),
    [phoneNumber, countryCode]
  );

  const whatsAppHref = useMemo(() => {
    if (!phoneCheck.valid || activeItems.length === 0) return '#';
    return buildWhatsAppUrl(phoneCheck.e164Digits, cardText);
  }, [phoneCheck, activeItems.length, cardText]);

  const showTempStatus = (msg: string) => {
    setStatusFeedback(msg);
    window.setTimeout(() => {
      setStatusFeedback((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const handleSendClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (activeItems.length === 0) {
      e.preventDefault();
      setPhoneError('أضف مادة واحدة على الأقل إلى علاكتك قبل الإرسال.');
      return;
    }
    if (!phoneCheck.valid) {
      e.preventDefault();
      setPhoneError(phoneCheck.error ?? 'يرجى إدخال رقم واتساب صحيح.');
      phoneInputRef.current?.focus();
      return;
    }
    setPhoneError(null);
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(cardText);
      setCopied(true);
      showTempStatus('تم نسخ بطاقة القائمة للحافظة');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      showTempStatus('تعذر النسخ التلقائي، يمكنك تحديد النص يدوياً');
    }
  };

  const triggerBlobDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDownloadImage = async () => {
    if (activeItems.length === 0) {
      setPhoneError('أضف مادة واحدة على الأقل لتصدير البطاقة.');
      return;
    }
    try {
      setIsExportingImage(true);
      const blob = await renderWhatsAppCardBlob({
        items,
        recipientLabel,
        includeChecked,
        dateText,
      });
      triggerBlobDownload(blob, 'alakti-card.png');
      showTempStatus('تم حفظ صورة البطاقة (PNG)');
    } catch {
      showTempStatus('حدث خطأ أثناء تجهيز صورة البطاقة');
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleShareImage = async () => {
    if (activeItems.length === 0) {
      setPhoneError('أضف مادة واحدة على الأقل لمشاركة البطاقة.');
      return;
    }
    try {
      setIsExportingImage(true);
      const blob = await renderWhatsAppCardBlob({
        items,
        recipientLabel,
        includeChecked,
        dateText,
      });
      const file = new File([blob], 'alakti-card.png', { type: 'image/png' });

      if (
        typeof navigator !== 'undefined' &&
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: 'بطاقة علاكتي للمقاضي',
          text: recipientLabel.trim()
            ? `بطاقة مقاضي لـ ${recipientLabel.trim()}`
            : 'بطاقة علاكتي للمقاضي',
          files: [file],
        });
        showTempStatus('تمت مشاركة صورة البطاقة بنجاح');
      } else {
        triggerBlobDownload(blob, 'alakti-card.png');
        showTempStatus('تم تنزيل صورة البطاقة — أرفقها مباشرة في واتساب');
      }
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        showTempStatus('تم تجهيز الصورة، يمكنك تنزيلها وإرفاقها في واتساب');
      }
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleBookmarkNumber = () => {
    if (!phoneCheck.valid) {
      setPhoneError(phoneCheck.error ?? 'أدخل رقم واتساب صحيحاً قبل الحفظ.');
      phoneInputRef.current?.focus();
      return;
    }
    const label = recipientLabel.trim() || phoneCheck.formattedDisplay;
    onSaveContact({
      label,
      countryCode,
      phone: phoneNumber.trim(),
    });
    setPhoneError(null);
    showTempStatus(`تم حفظ «${label}» للوصول السريع`);
  };

  const selectedCountry =
    COUNTRY_CODES.find((c) => c.code === countryCode) ?? COUNTRY_CODES[0];

  return (
    <aside
      id="whatsapp-card-section"
      aria-labelledby="whatsapp-panel-heading"
      className="space-y-4 lg:sticky lg:top-20"
    >
      {/* Recipient WhatsApp Input Card */}
      <div className="rounded-2xl border border-[#DCE5DD] bg-white p-4 sm:p-5 shadow-xs space-y-4">
        <div>
          <h2 id="whatsapp-panel-heading" className="text-lg font-bold text-[#111C16]">
            إرسال البطاقة إلى واتساب
          </h2>
          <p className="text-xs text-[#52635A] mt-0.5">
            أدخل رقم الواتساب المستلم لإرسال القائمة مرتبة كبطاقة
          </p>
        </div>

        {/* Saved contacts */}
        {savedContacts.length > 0 && (
          <div>
            <span className="block text-xs font-semibold text-[#52635A] mb-1.5">
              أرقام محفوظة
            </span>
            <div className="flex flex-wrap gap-1.5">
              {savedContacts.map((contact) => {
                const isActive =
                  contact.phone === phoneNumber && contact.countryCode === countryCode;
                return (
                  <div
                    key={contact.id}
                    className={`inline-flex items-center rounded-lg border text-xs font-semibold transition ${
                      isActive
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : 'border-[#DCE5DD] bg-[#F7FAF7] text-[#27372F]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onCountryCodeChange(contact.countryCode);
                        onPhoneNumberChange(contact.phone);
                        onRecipientLabelChange(contact.label);
                        setPhoneError(null);
                      }}
                      className="min-h-[34px] px-2.5 py-1 hover:text-emerald-700"
                    >
                      {contact.label}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteContact(contact.id)}
                      aria-label={`حذف الرقم المحفوظ ${contact.label}`}
                      className="flex min-h-[34px] min-w-[28px] items-center justify-center border-r border-[#DCE5DD] px-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Phone Number + Country Code */}
        <div className="space-y-3">
          <div>
            <label
              htmlFor="whatsapp-phone-input"
              className="block text-xs font-semibold text-[#3B4C43] mb-1.5"
            >
              رقم الواتساب المستلم
            </label>
            <div className="flex gap-2" dir="ltr">
              <label htmlFor="country-code-select" className="sr-only">
                مفتاح الدولة
              </label>
              <select
                id="country-code-select"
                value={countryCode}
                onChange={(e) => {
                  onCountryCodeChange(e.target.value);
                  setPhoneError(null);
                }}
                dir="rtl"
                className="min-h-[44px] max-w-[138px] rounded-xl border border-[#CED9CF] bg-[#FAFBF9] px-2.5 text-xs font-semibold text-[#111C16] focus:border-emerald-700 focus:bg-white focus:outline-none"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.shortLabel}
                  </option>
                ))}
              </select>

              <input
                ref={phoneInputRef}
                id="whatsapp-phone-input"
                type="tel"
                inputMode="tel"
                dir="ltr"
                value={phoneNumber}
                onChange={(e) => {
                  onPhoneNumberChange(e.target.value);
                  if (phoneError) setPhoneError(null);
                }}
                placeholder={selectedCountry.placeholder}
                className="min-w-0 flex-1 min-h-[44px] rounded-xl border border-[#CED9CF] bg-[#FAFBF9] px-3.5 text-sm font-semibold text-[#111C16] tabular-nums placeholder:text-[#899990] focus:border-emerald-700 focus:bg-white focus:outline-none"
              />
            </div>
            {phoneCheck.valid && (
              <p className="mt-1 text-[11px] font-medium text-emerald-700 tabular-nums" dir="ltr">
                سيتم الإرسال إلى: {phoneCheck.formattedDisplay}
              </p>
            )}
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label
                htmlFor="recipient-label-input"
                className="block text-xs font-semibold text-[#3B4C43] mb-1.5"
              >
                اسم المستلم في البطاقة (اختياري)
              </label>
              <input
                id="recipient-label-input"
                type="text"
                value={recipientLabel}
                onChange={(e) => onRecipientLabelChange(e.target.value)}
                placeholder="مثال: أبو محمد، محل الخضار، البيت"
                className="w-full min-h-[44px] rounded-xl border border-[#CED9CF] bg-[#FAFBF9] px-3.5 text-sm text-[#111C16] placeholder:text-[#7E8F85] focus:border-emerald-700 focus:bg-white focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleBookmarkNumber}
              aria-label="حفظ رقم الواتساب للوصول السريع"
              title="حفظ الرقم"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#CED9CF] bg-[#F7FAF7] text-[#27372F] hover:border-emerald-400 hover:bg-emerald-50 transition shrink-0"
            >
              <BookmarkPlus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {phoneError && (
          <p
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-800"
          >
            {phoneError}
          </p>
        )}

        {/* Primary WhatsApp Send CTA */}
        <a
          href={whatsAppHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleSendClick}
          data-testid="send-whatsapp-btn"
          className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#15803d] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#166534] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          <Send className="h-4 w-4 shrink-0" />
          <span>إرسال البطاقة إلى واتساب</span>
        </a>

        {/* Secondary Card Export / Share Actions */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={handleShareImage}
            disabled={isExportingImage}
            className="flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border border-[#DCE5DD] bg-[#F7FAF7] px-2 py-2 text-xs font-semibold text-[#111C16] hover:bg-emerald-50 hover:border-emerald-300 transition whitespace-nowrap disabled:opacity-50"
          >
            <Share2 className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
            <span>مشاركة صورة</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={isExportingImage}
            className="flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border border-[#DCE5DD] bg-[#F7FAF7] px-2 py-2 text-xs font-semibold text-[#111C16] hover:bg-emerald-50 hover:border-emerald-300 transition whitespace-nowrap disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
            <span>حفظ PNG</span>
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className="flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border border-[#DCE5DD] bg-[#F7FAF7] px-2 py-2 text-xs font-semibold text-[#111C16] hover:bg-emerald-50 hover:border-emerald-300 transition whitespace-nowrap"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
            )}
            <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
          </button>
        </div>

        {statusFeedback && (
          <p
            role="status"
            aria-live="polite"
            className="text-center text-xs font-semibold text-emerald-700"
          >
            {statusFeedback}
          </p>
        )}
      </div>

      {/* Live Preview Card */}
      <div className="rounded-2xl border border-[#DCE5DD] bg-white overflow-hidden shadow-xs">
        <div className="flex items-center justify-between gap-2 border-b border-[#E8EEE9] px-4 py-3 bg-[#FAFBF9]">
          <div className="flex items-center gap-2 text-xs font-bold text-[#111C16]">
            <Eye className="h-4 w-4 text-emerald-700" />
            <span>معاينة البطاقة</span>
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-[#EAEFEA] p-0.5">
            <button
              type="button"
              onClick={() => setPreviewMode('visual')}
              className={`inline-flex min-h-[32px] items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition whitespace-nowrap ${
                previewMode === 'visual'
                  ? 'bg-white text-[#111C16] shadow-2xs'
                  : 'text-[#52635A] hover:text-[#111C16]'
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>بطاقة</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('text')}
              className={`inline-flex min-h-[32px] items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition whitespace-nowrap ${
                previewMode === 'text'
                  ? 'bg-white text-[#111C16] shadow-2xs'
                  : 'text-[#52635A] hover:text-[#111C16]'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>نص واتساب</span>
            </button>
          </div>
        </div>

        {previewMode === 'visual' ? (
          <div data-testid="visual-card-preview">
            {/* Emerald Card Header */}
            <div className="bg-gradient-to-l from-emerald-700 to-teal-700 px-5 py-4 text-white">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-bold">بطاقة علاكتي للمقاضي</h3>
                <span className="text-xs font-semibold opacity-90 tabular-nums">
                  {activeItems.length} مادة
                </span>
              </div>
              <p className="mt-1 text-xs text-emerald-50/90">{dateText}</p>
              {recipientLabel.trim() && (
                <p className="mt-1 text-xs font-semibold text-white">
                  إلى: {recipientLabel.trim()}
                </p>
              )}
            </div>

            {/* Card Body */}
            <div className="p-4 space-y-4">
              {grouped.length === 0 ? (
                <p className="py-6 text-center text-xs font-medium text-[#52635A]">
                  لا توجد مواد غير مكتملة لعرضها في البطاقة.
                </p>
              ) : (
                grouped.map((group) => {
                  const meta = CATEGORY_MAP[group.category];
                  return (
                    <div key={group.category} className="space-y-1.5">
                      <div className="flex items-center justify-between rounded-lg bg-[#F4F7F4] px-3 py-1.5">
                        <div className={`flex items-center gap-1.5 text-xs font-bold ${meta.textColor}`}>
                          <CategoryIcon category={group.category} className="h-3.5 w-3.5" />
                          <span>{group.label}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-[#52635A] tabular-nums">
                          {group.items.length}
                        </span>
                      </div>
                      <ul className="divide-y divide-[#F0F4F0] px-1">
                        {group.items.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-start justify-between gap-3 py-2 text-xs"
                          >
                            <div className="min-w-0">
                              <p className="font-semibold text-[#111C16]">
                                {item.checked ? `✓ ${item.name}` : item.name}
                              </p>
                              {item.note && (
                                <p className="text-[11px] text-[#52635A] mt-0.5">
                                  {item.note}
                                </p>
                              )}
                            </div>
                            <span className={`font-bold tabular-nums whitespace-nowrap shrink-0 ${meta.textColor}`}>
                              {formatQuantity(item.quantity, item.unit)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })
              )}
            </div>

            {/* Card Footer */}
            <div className="flex items-center justify-between border-t border-[#E8EEE9] bg-[#F8FAF8] px-4 py-3 text-xs">
              <span className="font-bold text-[#111C16] tabular-nums">
                الإجمالي: {activeItems.length} مادة
                {summary.totalKg > 0 ? ` · ${summary.totalKg} كغم` : ''}
              </span>
              <span className="font-bold text-emerald-700">علاكتي</span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-[#EFEAE2]">
            <div className="rounded-xl bg-[#D9FDD3] p-3.5 text-xs text-[#111B21] shadow-2xs whitespace-pre-wrap leading-relaxed font-normal">
              {cardText}
            </div>
          </div>
        )}

        {/* Include checked toggle */}
        <div className="border-t border-[#E8EEE9] px-4 py-2.5 bg-white">
          <label className="flex items-center gap-2.5 text-xs font-medium text-[#3B4C43] cursor-pointer min-h-[36px]">
            <input
              type="checkbox"
              checked={includeChecked}
              onChange={(e) => setIncludeChecked(e.target.checked)}
              className="h-4 w-4 rounded border-[#CED9CF] accent-emerald-700"
            />
            <span>تضمين المواد المحددة كمكتملة في البطاقة</span>
          </label>
        </div>
      </div>
    </aside>
  );
};

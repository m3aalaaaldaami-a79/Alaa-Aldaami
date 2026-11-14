import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
      >
        <Download className="h-4 w-4 shrink-0" />
        <span>تثبيت التطبيق</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowGuide(true)}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 whitespace-nowrap shrink-0"
        >
          <Smartphone className="h-4 w-4 shrink-0" />
          <span>تثبيت على الهاتف</span>
        </button>

        {showGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
          >
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <h3 id="ios-install-title" className="text-lg font-bold text-slate-900">
                  تثبيت علاكتي على الشاشة الرئيسية
                </h3>
                <button
                  type="button"
                  onClick={() => setShowGuide(false)}
                  aria-label="إغلاق دليل التثبيت"
                  className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <ol className="mt-3 space-y-2 text-sm text-slate-600 list-decimal list-inside leading-relaxed">
                <li>اضغط على زر المشاركة (Share) في شريط المتصفح.</li>
                <li>مرر للأسفل واختر إضافة إلى الشاشة الرئيسية (Add to Home Screen).</li>
              </ol>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="mt-5 w-full min-h-[44px] rounded-xl bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                حسناً
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowGuide(true)}
        className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
      >
        <Smartphone className="h-4 w-4 shrink-0 text-emerald-700" />
        <span>تثبيت أندرويد</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="android-install-title"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 id="android-install-title" className="text-lg font-bold text-slate-900">
                تثبيت علاكتي كتطبيق أندرويد
              </h3>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="إغلاق نافذة التثبيت"
                className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              يعمل علاكتي كتطبيق ويب متكامل (PWA) بدون الحاجة لمتجر:
            </p>
            <ol className="mt-3 space-y-2 text-sm text-slate-700 list-decimal list-inside leading-relaxed">
              <li>افتح التطبيق من متصفح Chrome على هاتفك الأندرويد.</li>
              <li>اضغط على قائمة النقاط الثلاث أعلى المتصفح.</li>
              <li>اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».</li>
            </ol>
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full min-h-[44px] rounded-xl bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              فهمت
            </button>
          </div>
        </div>
      )}
    </>
  );
};

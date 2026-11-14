import { CATEGORY_MAP } from '../data/catalog';
import type { ShoppingItem } from '../types/shopping';
import { formatQuantity, groupItemsByCategory, summarizeBag } from './bagLogic';

export interface CardImageParams {
  items: ShoppingItem[];
  listTitle?: string;
  recipientLabel?: string;
  includeChecked?: boolean;
  dateText: string;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export async function renderWhatsAppCardBlob(
  params: CardImageParams
): Promise<Blob> {
  if (typeof document !== 'undefined' && 'fonts' in document) {
    await document.fonts.ready;
  }

  const {
    items,
    listTitle = 'بطاقة علاكتي للمقاضي',
    recipientLabel,
    includeChecked = false,
    dateText,
  } = params;

  const activeItems = includeChecked ? items : items.filter((item) => !item.checked);
  const groups = groupItemsByCategory(activeItems);
  const summary = summarizeBag(activeItems);

  const width = 460;
  const padX = 22;
  const headerH = recipientLabel?.trim() ? 114 : 92;
  const footerH = 64;

  let bodyH = 24;
  if (groups.length === 0) {
    bodyH += 64;
  } else {
    for (const g of groups) {
      bodyH += 36; // group title
      for (const item of g.items) {
        bodyH += item.note?.trim() ? 52 : 36;
      }
      bodyH += 14;
    }
  }

  const height = headerH + bodyH + footerH;
  const scale = 2;

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D unavailable');
  }

  ctx.scale(scale, scale);
  ctx.direction = 'rtl';

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Header gradient
  const grad = ctx.createLinearGradient(0, 0, width, headerH);
  grad.addColorStop(0, '#15803d');
  grad.addColorStop(1, '#0f766e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, headerH);

  // Header text
  ctx.textAlign = 'right';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 22px "Cairo", "IBM Plex Sans Arabic", sans-serif';
  ctx.fillText(listTitle, width - padX, 38);

  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.font = '500 13px "IBM Plex Sans Arabic", sans-serif';
  ctx.fillText(dateText, width - padX, 64);

  if (recipientLabel?.trim()) {
    ctx.fillStyle = '#ECFDF5';
    ctx.font = '600 13px "IBM Plex Sans Arabic", sans-serif';
    ctx.fillText(`إلى: ${recipientLabel.trim()}`, width - padX, 90);
  }

  // Body
  let y = headerH + 20;

  if (groups.length === 0) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748B';
    ctx.font = '500 15px "IBM Plex Sans Arabic", sans-serif';
    ctx.fillText('لا توجد مواد في البطاقة حالياً', width / 2, y + 32);
  } else {
    for (const group of groups) {
      const meta = CATEGORY_MAP[group.category];
      const accent = meta?.accentHex ?? '#15803d';

      // Group header
      drawRoundedRect(ctx, padX, y, width - padX * 2, 28, 8);
      ctx.fillStyle = '#F3F6F4';
      ctx.fill();

      // Category small indicator square
      ctx.fillStyle = accent;
      ctx.fillRect(width - padX - 12, y + 9, 4, 10);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#111C16';
      ctx.font = '700 13px "Cairo", "IBM Plex Sans Arabic", sans-serif';
      ctx.fillText(`${group.label} (${group.items.length})`, width - padX - 22, y + 19);

      y += 36;

      for (const item of group.items) {
        const qtyStr = formatQuantity(item.quantity, item.unit);

        // Item name on right
        ctx.textAlign = 'right';
        ctx.fillStyle = item.checked ? '#64748B' : '#111C16';
        ctx.font = '600 15px "IBM Plex Sans Arabic", sans-serif';
        const prefix = item.checked ? '✓ ' : '';
        ctx.fillText(`${prefix}${item.name}`, width - padX - 8, y + 16);

        // Quantity on left
        ctx.textAlign = 'left';
        ctx.fillStyle = accent;
        ctx.font = '700 14px "IBM Plex Sans Arabic", sans-serif';
        ctx.fillText(qtyStr, padX + 8, y + 16);

        if (item.note?.trim()) {
          ctx.textAlign = 'right';
          ctx.fillStyle = '#52635A';
          ctx.font = '400 12px "IBM Plex Sans Arabic", sans-serif';
          ctx.fillText(item.note.trim(), width - padX - 8, y + 34);
          y += 52;
        } else {
          y += 36;
        }

        // Hairline divider
        ctx.strokeStyle = '#E8EEE9';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padX + 6, y - 6);
        ctx.lineTo(width - padX - 6, y - 6);
        ctx.stroke();
      }
      y += 10;
    }
  }

  // Footer
  const footerY = height - footerH;
  ctx.fillStyle = '#F3F7F4';
  ctx.fillRect(0, footerY, width, footerH);
  ctx.strokeStyle = '#DCE5DD';
  ctx.beginPath();
  ctx.moveTo(0, footerY);
  ctx.lineTo(width, footerY);
  ctx.stroke();

  ctx.textAlign = 'right';
  ctx.fillStyle = '#111C16';
  ctx.font = '700 14px "Cairo", "IBM Plex Sans Arabic", sans-serif';
  const weightTxt = summary.totalKg > 0 ? ` · ${summary.totalKg} كغم` : '';
  ctx.fillText(`الإجمالي: ${activeItems.length} مادة${weightTxt}`, width - padX, footerY + 28);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#15803d';
  ctx.font = '700 13px "Cairo", "IBM Plex Sans Arabic", sans-serif';
  ctx.fillText('علاكتي', padX, footerY + 28);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#52635A';
  ctx.font = '400 11px "IBM Plex Sans Arabic", sans-serif';
  ctx.fillText('تم الإعداد وإرساله عبر تطبيق علاكتي', width - padX, footerY + 48);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('فشل إنشاء صورة البطاقة'));
      }
    }, 'image/png');
  });
}

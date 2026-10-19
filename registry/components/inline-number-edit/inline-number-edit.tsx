"use client";

import { InlineEdit } from "../inline-edit/inline-edit";
import { displayText, editTextOf, parseText } from "./inline-number-edit-format";
import type { InlineNumberFormat, InlineNumberKind } from "./inline-number-edit-format";

export interface InlineNumberEditProps {
  /** Kayıtlı değer; `kind="money"` ise kuruş tam sayısı (₺12,50 → 1250). `null` boştur. */
  value: number | null;
  /** Yeni değeri kaydeder. Promise döndürürse kaydediliyor durumu görünür; reddedilirse son kayıtlı değer geri gelir. */
  onSave: (next: number | null) => void | Promise<unknown>;
  /** Erişilebilir ad, ör. "Birim fiyat". */
  label: string;
  kind?: InlineNumberKind | undefined;
  /** "money" için birim kodu. Varsayılan TRY. */
  currency?: string | undefined;
  /** "number" için en çok ondalık basamak. Varsayılan 2. */
  maxFractionDigits?: number | undefined;
  /** Sınırlar; para için kuruş cinsinden. Dışındaki değer kaydedilmez, ileti çıkar. */
  min?: number | undefined;
  max?: number | undefined;
  /** Boş bırakılabilir mi. Varsayılan evet (`null` kaydedilir). */
  allowEmpty?: boolean | undefined;
  placeholder?: string | undefined;
  variant?: "title" | "body" | undefined;
  className?: string | undefined;
}

/**
 * Basınca yerinde sayı kutusuna dönen sayı ya da tutar. Düzenlerken ham metin ("1234,5"), kaydedince biçimli ("1.234,5", "₺1.234,50").
 * Enter kaydeder, Escape vazgeçer; kayıt başarısız olursa son kayıtlı değer geri gelir (InlineEdit davranışı).
 */
export function InlineNumberEdit({ value, onSave, label, kind = "number", currency = "TRY", maxFractionDigits = 2, min, max, allowEmpty = true, placeholder = "Boş", variant, className }: InlineNumberEditProps) {
  const format: InlineNumberFormat = { kind, currency, maxFraction: maxFractionDigits };
  const limit = (edge: number) => displayText(edge, format);
  const validate = (text: string) => {
    if (!text) return allowEmpty ? null : `${label} gerekli`;
    const parsed = parseText(text, format);
    if (parsed === null) return kind === "money" ? "Tutar okunamadı" : "Sayı okunamadı";
    if (min !== undefined && parsed < min) return `En az ${limit(min)} olmalı`;
    if (max !== undefined && parsed > max) return `En çok ${limit(max)} olabilir`;
    return null;
  };
  return <InlineEdit
    value={displayText(value, format)} label={label} placeholder={placeholder} variant={variant} className={className} inputMode="decimal" validate={validate}
    editText={shown => editTextOf(shown, format)} normalize={text => displayText(parseText(text, format), format)}
    onSave={text => onSave(parseText(text, format))} />;
}

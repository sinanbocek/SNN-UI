// Çizgi grafiğin varsayılan etiket biçimleyicileri. Saf mantık: React ve CSS içermez; test doğrudan bunu okur.
import { formatCompact, formatNumber } from "../lib/chart-format";

/** İpucu ve veri tablosundaki değer: en çok 1 ondalık, binlik ayracı nokta ("1.234,5"). */
export const formatLineValue = (value: number): string => formatNumber(value, 1);

/** Değer ekseni etiketi: kısaltılmış sayı ("1,2B", "1,25Mn"); 1000'in altı olduğu gibi. */
export const formatLineTick = (value: number): string => formatCompact(value);

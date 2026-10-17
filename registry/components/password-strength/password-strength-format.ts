// Parola gücü puanlamasının saf mantığı: kurallar, karakter sayımı ve adım hesabı. React ve CSS içermez; test doğrudan bunu okur.

export interface PasswordRule {
  id: string;
  label: string;
  test: (password: string) => boolean;
  /** Eksik kalan karakter sayısı. Kural karşılanmadıkça kuralın yanında dönen bir sayı olarak gösterilir. */
  remaining?: (password: string) => number;
}

export interface PasswordStrengthResult {
  level: 0 | 1 | 2 | 3 | 4;
  label: string;
  met: string[];
  /** Parola kısa uzunluktan kısaysa true olur; ölçer ilk adımda kalır. */
  short?: boolean;
}

/** Ölçerin her adımı için güç sözcüğü. Ölçeri başka dile çevirmek için değiştirin. */
export interface PasswordStrengthLevels {
  tooShort: string;
  weak: string;
  fair: string;
  good: string;
  strong: string;
}

export const defaultPasswordStrengthLevels: PasswordStrengthLevels = { tooShort: "Çok kısa", weak: "Zayıf", fair: "Orta", good: "İyi", strong: "Güçlü" };

/** Kod noktalarını sayar; emoji ya da başka bir astral karakter bir sayılır. */
export const countCodePoints = (password: string) => Array.from(password).length;

/** Hazır kuralların etiketleri. `length` en az uzunluğu alır. */
export interface PasswordRuleLabels {
  length: (minLength: number) => string;
  case: string;
  number: string;
  symbol: string;
}

export interface PasswordRuleOptions {
  /** Uzunluk kuralının istediği karakter sayısı. Varsayılan 12. */
  minLength?: number;
  /** Çevrilmiş ya da yeniden yazılmış kural etiketleri. */
  labels?: Partial<PasswordRuleLabels>;
  /** Uzunluk kuralının karakterleri nasıl saydığı. Varsayılan kod noktalarıdır. */
  countCharacters?: (password: string) => number;
}

const defaultRuleLabels: PasswordRuleLabels = {
  length: minLength => `En az ${minLength} karakter`,
  case: "Büyük ve küçük harf",
  number: "En az bir rakam",
  symbol: "En az bir simge",
};

/** Hazır kurallar (uzunluk, büyük/küçük harf, rakam, simge); en az uzunluk, etiketler ve karakter sayımı özelleştirilebilir. */
export function createPasswordRules({ minLength = 12, labels, countCharacters = countCodePoints }: PasswordRuleOptions = {}): PasswordRule[] {
  const copy = { ...defaultRuleLabels, ...labels };
  return [
    { id: "length", label: copy.length(minLength), test: password => countCharacters(password) >= minLength, remaining: password => Math.max(0, minLength - countCharacters(password)) },
    { id: "case", label: copy.case, test: password => /\p{Ll}/u.test(password) && /\p{Lu}/u.test(password) },
    { id: "number", label: copy.number, test: password => /\p{N}/u.test(password) },
    { id: "symbol", label: copy.symbol, test: password => /[^\p{L}\p{N}\s]/u.test(password) },
  ];
}

export const defaultPasswordRules: PasswordRule[] = createPasswordRules();

export interface EstimateStrengthOptions {
  /** Bu karakter sayısının altında parola ne kadar çeşitli olursa olsun ilk adımda kalır. Varsayılan 8. */
  shortLength?: number;
  /** Sonucun etiketi için güç sözcükleri. */
  levels?: Partial<PasswordStrengthLevels>;
  /** shortLength için karakterlerin nasıl sayıldığı. Varsayılan kod noktalarıdır. */
  countCharacters?: (password: string) => number;
}

/** Parolayı cihazda puanlar: karşılanan kural payına göre bir adım; kısa uzunluktan (varsayılan 8) kısaysa ilk adımda sınırlanır. */
export function estimateStrength(password: string, rules: PasswordRule[] = defaultPasswordRules, { shortLength = 8, levels, countCharacters = countCodePoints }: EstimateStrengthOptions = {}): PasswordStrengthResult {
  if (!password) return { level: 0, label: "", met: [] };
  const words = { ...defaultPasswordStrengthLevels, ...levels };
  const met = rules.filter(rule => rule.test(password)).map(rule => rule.id);
  if (countCharacters(password) < shortLength) return { level: 1, label: words.tooShort, met, short: true };
  const level = Math.min(4, Math.max(1, Math.round((met.length / Math.max(rules.length, 1)) * 4))) as 1 | 2 | 3 | 4;
  return { level, label: [words.weak, words.fair, words.good, words.strong][level - 1] ?? words.weak, met };
}

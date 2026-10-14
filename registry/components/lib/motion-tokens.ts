/** Hareket ön ayarları galeri ile gelecekteki kayıt defteri tüketicileri arasında paylaşılır. */
export const motionTokens = {
  duration: { instant: 0.12, fast: 0.16, exit: 0.18, standard: 0.24, considered: 0.48 },
  ease: {
    enter: [0.16, 1, 0.3, 1],
    exit: [0.7, 0, 0.84, 0],
    standard: [0.22, 1, 0.36, 1],
    /** Zaten ekranda olup hareket eden öğeler için. */
    inOut: [0.65, 0, 0.35, 1],
  },
  spring: {
    responsive: { type: "spring", stiffness: 520, damping: 38 },
    gentle: { type: "spring", stiffness: 340, damping: 34 },
    /** Basışlar, anahtarlar, başparmaklar ve küçük göstergeler. Hızlı oturur, hafif bir canlılık taşır. */
    snappy: { type: "spring", visualDuration: 0.26, bounce: 0.12 },
    /** Paneller, yükseklik değişimleri ve yerleşim kaymaları. Kritik sönümlü, asla aşmaz. */
    smooth: { type: "spring", visualDuration: 0.4, bounce: 0 },
    /** Şekil dönüşümleri, ortak yerleşim vurguları ve yeni içeriği izleyen genişlik değişimleri. */
    morph: { type: "spring", visualDuration: 0.42, bounce: 0.16 },
  },
  /** Kademe adımları, saniye cinsinden. Toplam kademeyi yaklaşık 0,4 sn altında tut. */
  stagger: { char: 0.016, word: 0.04, line: 0.08, item: 0.035 },
  /** Metin ve içerik çapraz geçişleri için bulanıklık yarıçapları, px cinsinden. Bulanıklığı küçük ve kısa tut. */
  blur: { subtle: 2, soft: 4, text: 8 },
} as const;

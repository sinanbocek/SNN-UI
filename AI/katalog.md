# SNN-UI kataloğu (AI için)

> Bu dosya `scripts/make-registry.mjs` ile üretilir; elle düzenlenmez. Kaynak: `scripts/catalog.mjs`.

Yeni bir arayüz parçası yazmadan önce bu listeye bak. Burada varsa kur, kopyasını yazma.
Yoksa Arc'a (uiarc.dev) bak; ikisinde de yoksa yaz ve kataloğa aday olarak bildir.

**Kurallar (kısa):**

- Renk, boşluk, köşe, gölge ve hareket süresi elle yazılmaz; `snn-foundation.css` değişkenlerinden alınır.
- Uyarı rengi amber/turuncu olmaz (`--warning` mavi-gridir). Kırmızı (`--danger`) yalnız gerçek hata içindir.
- Sayı, para, tarih kutusu bu rafta yok: ABACUS ile 2. rafta gelir. `Intl`, `toLocaleString`, `toFixed` kullanılmaz (`giris-alanlari-standardi.md`).
- Ekran metni Türkçe; tanımlayıcılar İngilizce.
- Arc'ın MCP sunucusu kullanılmaz: oradan uyarlanmamış bileşen gelebilir.

## Projeye bir kez kurulum

1. `components.json` dosyasına kayıt ekle:

```json
{ "registries": { "@snn-ui": "https://raw.githubusercontent.com/sinanbocek/SNN-UI/main/public/r/{name}.json" } }
```

2. Bileşeni kur (temel değişkenler ve hareket değerleri kendiliğinden gelir):

```bash
npx shadcn@latest add @snn-ui/button
```

3. Temel değişkenleri uygulamanın girişinde **bir kez** içe aktar (`src/main.tsx`):

```ts
import "@/components/snn/snn-foundation.css";
```

4. Vurgu rengini proje seçer: `<html data-accent="blue">` (`neutral`, `violet`, `blue`, `green`, `coral`, `rose`). Koyu tema: `data-theme="dark"`.

Gereken paketler: React 19, `motion`; bazı bileşenlerde Radix ve `lucide-react` (kurulum kendisi ekler).

## Bileşenler (ilk raf)

| Ad | Türkçe adı | Ne işe yarar | Kurulum |
|---|---|---|---|
| `button` | Düğme | Açık, tepki veren eylem düğmesi; ikincil durumları sakin. | `npx shadcn@latest add @snn-ui/button` |
| `button-group` | Düğme grubu | İlgili eylemler ince ayraçlı tek yüzeyde; isteğe bağlı açılır menüyle biter. | `npx shadcn@latest add @snn-ui/button-group` |
| `input` | Metin kutusu | Tek satırlı alan; açık etiket ve anlamlı durumlar (hata, açıklama). Sayı, para, tarih için kullanılmaz: o alanlar ABACUS ile 2. rafta (giris-alanlari-standardi.md). | `npx shadcn@latest add @snn-ui/input` |
| `textarea` | Çok satırlı metin | Not, açıklama ve uzun metin alanı. | `npx shadcn@latest add @snn-ui/textarea` |
| `select` | Seçim kutusu | Klavyeyle rahat kullanılan açılır listeden tek seçim. | `npx shadcn@latest add @snn-ui/select` |
| `checkbox` | Onay kutusu | İki durumlu seçim; durumu net okunur. | `npx shadcn@latest add @snn-ui/checkbox` |
| `switch` | Anahtar | Hemen etkili olan ayarlar için aç/kapa. | `npx shadcn@latest add @snn-ui/switch` |
| `radio-group` | Radyo grubu | Görünür seçeneklerden birini seçtirir. | `npx shadcn@latest add @snn-ui/radio-group` |
| `dialog` | Pencere | Dikkat isteyen karar için odaklı pencere. | `npx shadcn@latest add @snn-ui/dialog` |
| `dropdown-menu` | Açılır menü | Bir düğmeye bağlı kısa eylem listesi. | `npx shadcn@latest add @snn-ui/dropdown-menu` |
| `popover` | Açılır kutu | Bir öğeye bağlı küçük bağlamsal bilgi yüzeyi. | `npx shadcn@latest add @snn-ui/popover` |
| `tooltip` | İpucu | Tanıdık olmayan denetim için kısa yardımcı metin. | `npx shadcn@latest add @snn-ui/tooltip` |
| `tabs` | Sekmeler | Aynı bağlamdaki ilgili içerikler arasında geçiş. | `npx shadcn@latest add @snn-ui/tabs` |
| `card` | Kart | İlgili içerik ve eylemleri bir arada tutan kutu; isteğe bağlı hızlı bakış. | `npx shadcn@latest add @snn-ui/card` |
| `toast` | Bildirim balonu | Arka planda biten işin kısa onayı. | `npx shadcn@latest add @snn-ui/toast` |
| `empty-state` | Boş durum | Gösterilecek bir şey yokken bir sonraki adımı söyler. | `npx shadcn@latest add @snn-ui/empty-state` |
| `skeleton` | Yükleniyor iskeleti | İçerik yüklenirken yer ayırır. | `npx shadcn@latest add @snn-ui/skeleton` |
| `pagination` | Sayfalama | Uzun listede sınırları belli sayfa geçişi. | `npx shadcn@latest add @snn-ui/pagination` |
| `search-field` | Arama kutusu | Tanınır arama girişi; temizleme düğmesiyle. | `npx shadcn@latest add @snn-ui/search-field` |
| `save-bar` | Kaydetme çubuğu | Formun altında yüzer; "{n} kaydedilmemiş değişiklik", Vazgeç ve Kaydet. Kaydediliyor, kaydedildi, hata durumları ve Ctrl/Cmd+S vardır. Gerçek kaydetmeyi proje yapar; çubuk yalnız durumu gösterir. Arc Pro settings-page'den esinlenildi (tarif: docs/tarifler/settings-page.md). | `npx shadcn@latest add @snn-ui/save-bar` |
| `badge` | Rozet | Durumu kısa bir etiketle gösterir; metin ve simge değişince hap yumuşakça yeni genişliğe yaylanır. Tonlar: neutral, success, info, warning (mavi-gri), danger. | `npx shadcn@latest add @snn-ui/badge` |
| `breadcrumb` | Yol izi | Bulunulan yeri üst sayfalarıyla gösterir; son parça geçerli sayfadır. Bağlantı yoksa düğme olarak çizilir. Bağlantı düz `<a>` ile çizilir; yönlendirici (router) bağlantısı gerekiyorsa proje `onClick` ile kendi yönlendirmesini çağırır. | `npx shadcn@latest add @snn-ui/breadcrumb` |
| `progress` | İlerleme çubuğu | Bilinen bir işin ne kadar bittiğini gösterir; yüzde etiketi çubukla birlikte sayılır, bitince onay işareti çıkar. | `npx shadcn@latest add @snn-ui/progress` |
| `segmented-control` | Bölmeli seçici | Birkaç kardeş görünüm arasında tek seçim; seçili vurgu kayarak geçer, ok tuşlarıyla gezilir. | `npx shadcn@latest add @snn-ui/segmented-control` |
| `drawer` | Çekmece | Kenardan kayarak gelen yan panel; başlık çubuğundan sürüklenip kapatılır, Escape ve dışarı tıklama da kapatır. | `npx shadcn@latest add @snn-ui/drawer` |
| `combobox` | Aramalı seçim | Yazarak süzülen açılır liste; ok tuşları, Enter ve Escape ile kullanılır. Türkçe aramada "İstanbul", "Istanbul" ve "istanbul" aynı sonucu bulur. Arama anahtarı ABACUS `text.searchKey` ile üretilir; proje `@snn/abacus-core` paketini kendiliğinden alır. | `npx shadcn@latest add @snn-ui/combobox` |
| `avatar` | Kişi simgesi | Fotoğraf ya da ad baş harfleri; isteğe bağlı çevrimiçi/çevrimdışı noktası. Fotoğraf yüklenemezse baş harflere döner. Baş harf ABACUS `text.upper` ile büyütülür ("ismail" → "İ"). Fotoğraf düz `<img>` ile çizilir. | `npx shadcn@latest add @snn-ui/avatar` |
| `settings-page` | Ayarlar sayfası | Blok: solda bölüm listesi, sağda seçili bölümün formu, altta yüzen kaydetme çubuğu. Bölümler arasında yarım kalan değişiklik korunur; kaydedilmemiş bölümde nokta çıkar. Yükleniyor, boş ve dar ekran durumları vardır. Alanları ve değişiklik sayısını proje verir (`changeCount`); gerçek kaydetmeyi de proje yapar. Arc Pro settings-page'den esinlenildi (tarif: docs/tarifler/settings-page.md). | `npx shadcn@latest add @snn-ui/settings-page` |
| `team-members` | Ekip üyeleri | Blok: koltuk sayacı, e-posta etiketli davet kutusu, üye listesi (rol değiştirme, satır içi çıkarma sorusu, arama, sayfalama) ve bekleyen davetler. Boş, yükleniyor, hata, koltuk dolu ve dar ekran durumları vardır. E-posta denetimi ABACUS `text.email`, arama süzmesi `text.searchKey` ile yapılır. Gerçek davet, rol kaydı ve çıkarmayı proje bağlar; işlemler reddedilirse (Promise) satırda hata yazılır ve eski hâle dönülür. Tarihler ve "son görülme" hazır metin olarak gelir (ABACUS `date`). Arc Pro team-members'dan esinlenildi (tarif: docs/tarifler/team-members.md). | `npx shadcn@latest add @snn-ui/team-members` |
| `sidebar` | Kenar menüsü | Blok: solda gruplu, katlanır gezinme menüsü; şeride daralır (Ctrl+B), dar kolonda çekmeceye dönüşür. Üstte yol izi, ortada kayan içerik, altta Ayarlar ve kullanıcı kartı. Yükleniyor ve hata durumları vardır. Menü verisini, etkin sayfayı ve katlama tercihinin saklanmasını proje yapar (`onCollapsedChange`). Çekmece kararı pencereye değil bloğun kendi genişliğine bakar. Kullanıcı kartı menüsü ve şerit grup menüsü `popover` ile açılır (`dropdown-menu` özel tetikleyici kabul etmediği için). Arc Pro sidebar'dan esinlenildi (tarif: docs/tarifler/sidebar.md). | `npx shadcn@latest add @snn-ui/sidebar` |
| `search-results` | Arama sonuçları | Blok: birleşik arama kutusu (son ve önerilen aramalar), sayılı süzgeçler (tür, ekip, ay aralığı), etkin süzgeç çipleri, sıralama, kayan imleç dolgulu sonuç listesi ve önizleme paneli. Orta ve dar kolonda önizleme ve süzgeçler alttan açılan sayfalara taşınır. Boş, yükleniyor ve hata durumları vardır. Aranan her kelime Türkçe harf farkı gözetmeden (`text.searchKey`) bulunur; tarihler ABACUS `date`, sıralama `collate` ile yazılır. Bu blok verilen listeyi tarayıcıda süzer ve sıralar; birkaç yüz kayıttan sonra aramayı sunucuya taşımak projenin işidir. Arc Pro search-results'tan esinlenildi (tarif: docs/tarifler/search-results.md). | `npx shadcn@latest add @snn-ui/search-results` |
| `help-center` | Yardım merkezi | Blok: büyük arama kutusu (sonuçlar kutunun altında, kelimeler vurgulu), hızlı aramalar, konu kartları, çok okunanlar, makale okuma görünümü ("Bu sayfada" ana hattı, Evet/Hayır geri bildirimi, ilgili makaleler) ve destek kartı. Görünümler yönüne göre kayar. Boş, yükleniyor, hata, makale bulunamadı ve dar ekran durumları vardır. Makale içeriği (`paragraphs`, `steps`, isteğe bağlı `content`), tarih ve okuma süresi metni projeden gelir; arama Türkçe harf farkı gözetmez (`text.searchKey`). İletişim ve geri bildirimi proje bağlar; reddedilirse hata yazılır. Arc Pro help-center'dan esinlenildi (tarif: docs/tarifler/help-center.md). | `npx shadcn@latest add @snn-ui/help-center` |
| `settings-command` | Aranabilir ayarlar | Blok: onlarca ayarın tek uzun sayfada durduğu ekran. Arama kutusu Ctrl+K ya da / ile komut paletini açar (Türkçe harf farkı gözetmez, ek anahtar kelimelerle bulur); seçilen ayara sayfa kayar ve satır iki kez nefes alır. Solda bölüm gezgini, satırlarda anahtar, seçenek, açılır liste ve metin denetimleri, altta toplu kaydetme çubuğu. Yükleniyor, boş arama, doğrulama hatası, kaydetme hatası ve dar ekran durumları vardır. Ayar şemasını (bölümler, satırlar, denetim türü, anahtar kelimeler) ve gerçek kaydı proje verir; blok yalnız değişen kimlik ve değerleri `onSave`'e iletir (reddedilirse çubukta "Yeniden dene"). Arama `text.searchKey` ile yapılır. Kısa profil formu için `settings-page` kullanılır; ikisi birlikte kurulmaz. Arc Pro settings-command'dan esinlenildi (tarif: docs/tarifler/settings-command.md). | `npx shadcn@latest add @snn-ui/settings-command` |
| `team-directory` | Ekip rehberi | Blok: solda aranabilir kişi listesi (ad ve göreve göre), üstte sayılı ekip süzgeç düğmeleri, sağda seçili kişinin profil paneli (durum, ekip, üzerinde çalıştığı iş, konum, e-posta ve Kopyala). Kayan vurgular, süzülen satırlar. Boş sonuç, yükleniyor, hata ve dar kolon durumları vardır. Kişi listesini proje verir; yerel saat gibi metinler hazır gelir (ABACUS `date`). Arama Türkçe harf farkı gözetmez (`text.searchKey`). Yüzlerce kişide süzmeyi ve sayfalamayı sunucuya taşımak projenin işidir. Rol atama için `team-members` kullanılır. Arc Pro team-directory'den esinlenildi (tarif: docs/tarifler/team-directory.md). | `npx shadcn@latest add @snn-ui/team-directory` |
| `roles-permissions` | Roller ve izinler | Blok: satırlar izin, sütunlar rol olan matris. İzinler katlanabilir gruplarda; grup kutusu hepsini dalga gibi açar ve karışık durumu (çizgili) gösterir. Sahip sütunu kilitlidir. Ok tuşlu tek durak gezinme, üzerinde durulan sütun vurgusu, rol menüsü, değişiklik özetli inceleme çubuğu. Boş, yükleniyor, kaydetme hatası ve dar ekran (sabit izin sütunu, yana kayan tablo) durumları vardır. İzin gruplarını, rolleri ve gerçek kaydı proje verir; blok değişen (rol, izin, verildi mi) çiftlerini `onSave`'e iletir, reddedilirse çubukta "Yeniden dene" çıkar. İzinlerin uygulanması projenin yetkilendirme sistemindedir. Kişiye rol atama için `team-members` kullanılır. Arc Pro roles-permissions'tan esinlenildi (tarif: docs/tarifler/roles-permissions.md). | `npx shadcn@latest add @snn-ui/roles-permissions` |
| `inbox-triage` | Gelen kutusu ayıklama | Blok: karar bekleyen mesaj kuyruğu. Gelen, Ertelenen ve Arşiv sekmeleri (sayılı), yerinde açılan satırlar, "yalnız okunmamışlar" süzgeci, tek tuş kısayolları (E arşivle, S ertele, U geri al) ve geri alınabilir son hamle durum satırı. Hamleden sonra odak sonraki satıra geçer. Her klasör için ayrı boş durum, yükleniyor, taşıma hatası ("Yeniden dene") ve dar kolon (iki satırlı satır) durumları vardır. Mesajları ve zaman metnini ("09.42", "Dün") proje verir (ABACUS `date`); blok yalnız hamle olaylarını (`onMove`) ve okunma olayını iletir, gerçek veri servisini proje bağlar. Hamle reddedilirse mesaj eski klasörüne döner. Mesaj yazma, etiket ve sistem bildirimleri kapsam dışıdır. Arc Pro inbox-triage'dan esinlenildi (tarif: docs/tarifler/inbox-triage.md). | `npx shadcn@latest add @snn-ui/inbox-triage` |
| `release-readiness` | Yayına hazırlık listesi | Blok: bir iş yapılmadan önce tamamlanması gereken kontroller. Sayaç ("3 kontrol kaldı" / "Hazır") ve ilerleme çubuğu, iki sütunlu kontrol satırları, isteğe bağlı "ilgilileri bilgilendir" anahtarı ve hepsi işaretlenince açılan ana eylem düğmesi. Pasif düğmenin nedeni yazıyla söylenir. Yükleniyor, çalışıyor, başarı, hata ("Yeniden dene") ve dar kolon durumları vardır. Kontrol listesini ve son eylemi proje verir; kontrollerin otomatik doğrulanması (CI sonucu okumak gibi) projenin işidir. Eylem reddedilirse satır içi uyarı çıkar ve düğme "Yeniden dene" olur. Çok adımlı akış için `multi-step-form` kullanılır. Arc Pro release-readiness'tan esinlenildi (tarif: docs/tarifler/release-readiness.md). | `npx shadcn@latest add @snn-ui/release-readiness` |
| `multi-step-form` | Adım adım form | Blok: uzun formu kısa adımlara böler. Numaralı adım listesi (tamamlananlarda çizilen tik, etkin adım vurgulu; tamamlanan adıma geri dönülür), yönlü kayan geçiş, adımın yüksekliğine yaylanan kutu, "Adım 1 / 2" sayacı, Geri / Devam / Bitir düğmeleri ve başarı ekranı. Yerel kısıtlar (`required`, `pattern`) ve isteğe bağlı özel denetim geçişi engeller, ilk geçersiz alana odak gider. Gönderiliyor, sunucu hatası ("Yeniden dene") ve dar kolon durumları vardır. Adım içeriğindeki alanları (`input`, `select`, `textarea`, `switch` …) ve değerlerini proje verir; değerler üst bileşende tutulur, geri dönünce kaybolmaz. Sayı, para, tarih, telefon alanları ABACUS ile 2. rafta gelir. Dallanan adım, taslak kaydetme ve gelişmiş doğrulama kapsam dışıdır. Arc Pro multi-step-form'dan esinlenildi (tarif: docs/tarifler/multi-step-form.md). | `npx shadcn@latest add @snn-ui/multi-step-form` |
| `week-calendar` | Haftalık takvim | Blok: haftalık zaman ızgarası. Boş zamanı sürükleyerek etkinlik oluşturma (15 dakikalık adımlar), etkinliği sürükleyip taşıma, alt kenardan uzatma; üst çubukta Bugün, oklar, aralık başlığı, Hafta / İş haftası / Gün / 3 gün / Gündem görünümleri ve takvim açma kapama. Tüm gün satırı ("+N daha"), çakışan etkinlikler yan yana, "şimdi" çizgisi, ayrıntı kutusu, silince geri al (Ctrl+Z). Klavyeyle taşıma (Alt+ok), N / T / D / W kısayolları. Boş hafta, yükleniyor, kaydetme hatası ve dar kolon (3 gün + gündem) durumları vardır. Etkinlikleri ("2026-10-15T09:30" biçiminde, uygulamanın saat diliminde), takvimleri ve gerçek kaydı proje verir; blok oluşturma, güncelleme ve silme olaylarını iletir, reddedilirse etkinlik geri döner ve "Yeniden dene" çıkar. Gün ve ay adları ABACUS `date`, gün toplama `period.addDays` ile yazılır. Sürükleme `snn-pointer-drag` kancasıyla yapılır (kütüphanesiz). Tekrarlayan etkinlik, ay görünümü, mini ay takvimi ve saat dilimi seçimi kapsam dışıdır. Arc Pro week-calendar'dan esinlenildi (tarif: docs/tarifler/week-calendar.md). | `npx shadcn@latest add @snn-ui/week-calendar` |
| `availability-picker` | Ortak uygun saat seçici | Blok: birkaç kişinin ortak toplantı saatini seçtirir. Başlıkta toplantı adı, süre ve saat dilimi, katılımcı avatarları; beş günlük şerit (kartta "N boş"), seçili günün saatleri iki sütunda ve her saatte kişi başına müsait/meşgul çubukları (yazıyla da bildirilir), altta özet çubuğu ve "Saati onayla". Gün değişince saat listesi yönüne göre kayar, seçili saat vurgusu saatler arasında kayar. Boş gün (en yakın uygun gün önerisi), hiç ortak saat yok, yükleniyor, onay hatası ve dar kolon durumları vardır. Gün ve saat verisini ("2026-10-19T10:30", uygulamanın saat diliminde) proje takvim servisinden hazırlar; blok yalnız seçimi (`onConfirm`) iletir, davet göndermez. Gün adı ve saat etiketi ABACUS `date` ile yazılır. Meşgul kişili saat seçilebilir, özet uyarır. Beşten fazla gün ve haftalık gezinme kapsam dışıdır. Arc Pro availability-picker'dan esinlenildi (tarif: docs/tarifler/availability-picker.md). | `npx shadcn@latest add @snn-ui/availability-picker` |
| `project-board` | Küçük proje panosu | Blok: az sayıda işin sabit aşamalar (Planlandı, Sürüyor, Kontrolde, Bitti) arasında ilerlediği pano. Sürükleme yok: her kartta önceki ve sonraki aşamaya taşıma okları var (dokunmatikte de rahat). Üstte "Bu dönem 6 işten 1'i bitti" cümlesi ve ilerleme çubuğu, "Tümü / Benim işlerim" süzgeci, "Görev ekle" ile başlığı hemen yazılan yeni kart. Kartlar sütunlar arasında uçar. Boş sütun, hiç iş yok, süzgeç sonucu yok, yükleniyor, taşıma hatası ("Yeniden dene") ve dar kolon (yana kayan, yakınlığa oturan sütunlar) durumları vardır. Görevleri, kişileri ve gün etiketlerini ("Per", "24 Eki") proje verir (ABACUS `date`); blok taşıma ve ekleme olaylarını iletir, reddedilirse kart eski sütuna döner. İlerleme cümlesindeki sayı eki ABACUS `text.suffix` ile yazılır. Sürükle-bırak, iş sınırı ve ayrıntı çekmecesi isteyen büyük pano için `kanban-board` kullanılır. Arc Pro project-board'dan esinlenildi (tarif: docs/tarifler/project-board.md). | `npx shadcn@latest add @snn-ui/project-board` |
| `kanban-board` | Sürükle-bırak iş panosu | Blok: kartlar sütunlar arasında sürükle-bırakla taşınır. Kaldırılan kart imleci izler ve hızına göre hafifçe yatar, bırakılacağı yerde boşluk açılır; pano kenarında otomatik kayar, dokunmatikte kısa basıştan sonra başlar. Klavyeyle de taşınır (Boşluk kaldırır, ok tuşları taşır, Boşluk bırakır, Esc vazgeçer) ve her adım ekran okuyucuya duyurulur. Sütunlara iş sınırı konabilir ("3/3", aşılınca "İş sınırı aşıldı."). "Durum / Şerit" görünümü (şeritte kişiye göre), sütunda "Kart ekle", Enter ile açılan ayrıntı çekmecesi (başlık, atanan, bitiş, etiket, puan, kontrol listesi). Boş sütun, hiç kart yok, yükleniyor, kayıt hatası ("Yeniden dene") ve dar kolon durumları vardır. Kartların sıralı listesini (sütun içi sıra dizideki sıradır) ve gerçek kaydı proje verir; blok her taşıma, sıralama ve ayrıntı değişikliğinde tüm kartları yeni sırayla `onChange`'e iletir, reddedilirse kartlar eski hâline döner. Sürükleme `snn-pointer-drag` kancasıyla yapılır (yeni paket gerekmez). İş sınırı taşımayı engellemez, yalnız uyarır. Bitiş tarihi ABACUS `date.parse` / `date.format`, puan `text.digits` ile işlenir. Yüzlerce karttan sonra sanallaştırma projenin işidir; yorum, ek ve otomasyon kapsam dışıdır. Küçük, sürüklemesiz pano için `project-board` kullanılır. Arc Pro kanban-board'dan esinlenildi (tarif: docs/tarifler/kanban-board.md). | `npx shadcn@latest add @snn-ui/kanban-board` |
| `animated-counter` | Dönen rakamlı sayaç | Sayı değişince her rakam kilometre sayacı gibi döner (9 → 0 sarar, yön sayının gittiği yöndür); binlik ayracı nokta, ondalık ayracı virgül ("1.234,5"). İstenirse ilk görünüşte sıfırdan yukarı sayar. Ekran okuyucu düz metni okur. Biçim ABACUS `money.fmtDecimalGrouped` ile yazılır; Arc'ın `locale` prop'u (varsayılan en-US) kaldırıldı. Para birimi ve kısaltma için `metric-card` ya da `snn-chart-format` kullanılır. | `npx shadcn@latest add @snn-ui/animated-counter` |
| `metric-card` | Gösterge kartı | Bir göstergeyi tek kartta söyler: başlık, dönen rakamlı değer, işaretli değişim etiketi (yeşil/kırmızı) ve bağlam cümlesi. Değer düz sayı, tam tutar (₺1.250.000) ya da kısaltılmış tutar (₺1,25Mn) olabilir. Metinler değişince yön duyarlı kayar. `format`: "number" (varsayılan), "money", "compact-money"; `currency` varsayılanı TRY. Yazım ABACUS `money.formatMajor` / `money.compactMajor` çıktısıdır. Değişim etiketini ("+%12,3") proje `math.percentChange` ve `money.percent` ile üretir. Arc'ın `prefix` ve `locale` yazımı yerine `format` ve `currency` geldi. | `npx shadcn@latest add @snn-ui/metric-card` |
| `sparkline` | Mini çizgi grafik | Başlığın yanında küçük bir eğilim çizgisi: değer, değişim ve yumuşak çizgi. Görününce soldan sağa çizilir; fare, dokunma ve ok tuşlarıyla noktalar gezilir, başlık gezilen noktayı gösterir. Veri değişince çizgi yeni biçime akar. Gezilen noktanın yazımı `formatValue` ile özelleştirilir; varsayılan ABACUS biçimidir ("1.234,5"). Başlıktaki değer ve değişim hazır metin olarak gelir (`money.fmtDecimalGrouped`, `money.percent`). Renk tonları (`accent`, `success`, `warning`, `danger`) temel değişkenlerdendir; `warning` mavi-gridir. | `npx shadcn@latest add @snn-ui/sparkline` |
| `line-chart` | Çizgi grafik | Zaman içindeki bir ya da birkaç ölçüyü yumuşak çizgilerle gösterir. Fare, dokunma ve ok tuşlarıyla gezilen artı imleç ipucuyla noktaları okur; seriler göstergeden açılıp kapanır, değer ekseni kendini ölçekler, aralık değişince çizgiler yeni biçime akar. Ekran okuyucu için veri tablosu, boş ve yükleniyor durumları vardır. Değer ve eksen etiketleri ABACUS'tandır: ipucunda "1.234,5", eksende kısaltma ("1,2B", "1,25Mn"). `formatValue` ve `formatTick` ile para birimli yazım verilebilir (`snn-chart-format`: `formatMoney`, `formatMoneyCompact`). Tarih etiketlerini (`label`, `axisLabel`) proje ABACUS `date.format` ile hazırlar. Verinin aralığını ve yüklemeyi proje yönetir. | `npx shadcn@latest add @snn-ui/line-chart` |
| `bar-chart` | Çubuk grafik | Bir ölçüyü art arda gün, hafta ya da ay boyunca çubuklarla gösterir; dönemler birbirleriyle ve ortalama çizgisiyle karşılaştırılır. Başlık dururken ortalamayı, gezerken gezilen çubuğu okur (fare, dokunma, ok tuşları). Çubuklar sırayla büyür, aralık değişince yeni değerlere akar, eksen kendini ölçekler. Ekran okuyucu için veri tablosu vardır. Değerler ve eksen etiketleri ABACUS biçimindedir ("1.234"); `formatValue` ile para birimli yazım verilebilir (`snn-chart-format`: `formatMoney`). Gün etiketlerini (`label`, `axisLabel`) ve dönem metnini proje ABACUS `date.format` ile hazırlar. Çubuk renkleri vurgu rengindendir (`--series-*` gerekmez). | `npx shadcn@latest add @snn-ui/bar-chart` |
| `donut-chart` | Halka grafik | Bir bütünün birkaç parçasını halka dilimleriyle gösterir; her parçanın payı kesin karşılaştırmadan önemli olduğunda kullanılır. Üzerine gelinen ya da seçilen dilim dışarı kayar, merkez o dilimin değerini ve payını ("%36") okur; küçük parçalar "Diğer"e katılır. Eşgüdümlü gösterge dilimleri gösterip gizler, halka yeniden dağılır. Ekran okuyucu için tablo, boş durum ve ok tuşuyla gezinme vardır. Değerler ABACUS biçimindedir ("1.234,5"), paylar `money.percent` ile yazılır ("%36", yüzde birin altı "<%1"). `formatValue` ile para birimli yazım verilebilir (`snn-chart-format`: `formatMoney`). Renkler `snn-chart-palette` (mavi, menekşe, yeşil, gül) ve nötr basamaklardır; amber yok. Varsayılan metinler Türkçe ("Toplam", "Diğer", "Henüz veri yok"). | `npx shadcn@latest add @snn-ui/donut-chart` |
| `gauge` | Gösterge halkası | Bir değerin aralığındaki yerini 270 derecelik halkayla gösterir: ortada "%72" ve isteğe bağlı durum adı. Eşik bantları (örneğin Düşük / Normal / Yüksek) rengi ve durum adını belirler; anlam yalnız renge dayanmaz. Görününce dolar, değer değişince yaylanır; sayım halkayı aşmadan izler. Yüzde `%72` biçiminde, işaret sayıdan önce yazılır (Türkçe yazım). `detail` hazır metin olarak gelir (`money.percent`, `money.formatMajor`). Eşik tonlarından `warning` mavi-gridir; kırmızı (`danger`) yalnız gerçek hata içindir. | `npx shadcn@latest add @snn-ui/gauge` |

## Kullanım örnekleri

### Düğme (`button`)

```tsx
import { Button } from "@/components/snn/button/button";

<Button onClick={save}>Kaydet</Button>
```

### Düğme grubu (`button-group`)

```tsx
import { ButtonGroup } from "@/components/snn/button-group/button-group";

<ButtonGroup label="Belge işlemleri" items={[{ id: "kopyala", label: "Kopyala", onSelect: copy }]} />
```

### Metin kutusu (`input`)

```tsx
import { Input } from "@/components/snn/input/input";

<Input label="Ad" placeholder="Adınızı yazın" />
```

### Çok satırlı metin (`textarea`)

```tsx
import { Textarea } from "@/components/snn/textarea/textarea";

<Textarea label="Not" />
```

### Seçim kutusu (`select`)

```tsx
import { Select } from "@/components/snn/select/select";

<Select label="Şehir" options={[{ value: "ist", label: "İstanbul" }]} />
```

### Onay kutusu (`checkbox`)

```tsx
import { Checkbox } from "@/components/snn/checkbox/checkbox";

<Checkbox label="Koşulları okudum" />
```

### Anahtar (`switch`)

```tsx
import { Switch } from "@/components/snn/switch/switch";

<Switch label="Bildirimler" />
```

### Radyo grubu (`radio-group`)

```tsx
import { RadioGroup } from "@/components/snn/radio-group/radio-group";

<RadioGroup label="Teslimat" value={delivery} onValueChange={setDelivery} options={[{ value: "kargo", label: "Kargo" }]} />
```

### Pencere (`dialog`)

```tsx
import { Dialog, DialogTrigger, DialogContent, DialogClose } from "@/components/snn/dialog/dialog";

<Dialog><DialogTrigger asChild><Button>Aç</Button></DialogTrigger><DialogContent title="Silinsin mi?">…</DialogContent></Dialog>
```

### Açılır menü (`dropdown-menu`)

```tsx
import { DropdownMenu } from "@/components/snn/dropdown-menu/dropdown-menu";

<DropdownMenu label="İşlemler" items={[{ label: "Düzenle", onSelect: edit }, { label: "Sil", destructive: true, separatorBefore: true }]} />
```

### Açılır kutu (`popover`)

```tsx
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "@/components/snn/popover/popover";

<Popover><PopoverTrigger asChild><Button>Bilgi</Button></PopoverTrigger><PopoverContent>…</PopoverContent></Popover>
```

### İpucu (`tooltip`)

```tsx
import { Tooltip } from "@/components/snn/tooltip/tooltip";

<Tooltip content="Dışa aktar"><Button>⇩</Button></Tooltip>
```

### Sekmeler (`tabs`)

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/snn/tabs/tabs";

<Tabs defaultValue="ozet"><TabsList><TabsTrigger value="ozet">Özet</TabsTrigger></TabsList><TabsContent value="ozet">…</TabsContent></Tabs>
```

### Kart (`card`)

```tsx
import { Card } from "@/components/snn/card/card";

<Card title="Teklif 12" description="Taslak" />
```

### Bildirim balonu (`toast`)

```tsx
import { default as Toast } from "@/components/snn/toast/toast";

<Toast title="Kaydedildi" />
```

### Boş durum (`empty-state`)

```tsx
import { EmptyState } from "@/components/snn/empty-state/empty-state";

<EmptyState title="Henüz teklif yok" description="İlk teklifi oluşturun." />
```

### Yükleniyor iskeleti (`skeleton`)

```tsx
import { Skeleton } from "@/components/snn/skeleton/skeleton";

<Skeleton lines={3} />
```

### Sayfalama (`pagination`)

```tsx
import { Pagination } from "@/components/snn/pagination/pagination";

<Pagination page={page} pageCount={12} onPageChange={setPage} />
```

### Arama kutusu (`search-field`)

```tsx
import { SearchField } from "@/components/snn/search-field/search-field";

<SearchField label="Ara" value={query} onValueChange={setQuery} />
```

### Kaydetme çubuğu (`save-bar`)

```tsx
import { SaveBar } from "@/components/snn/save-bar/save-bar";

<SaveBar changeCount={3} status={status} onSave={save} onDiscard={reset} />
```

### Rozet (`badge`)

```tsx
import { Badge } from "@/components/snn/badge/badge";

<Badge tone="success">Onaylandı</Badge>
```

### Yol izi (`breadcrumb`)

```tsx
import { Breadcrumb } from "@/components/snn/breadcrumb/breadcrumb";

<Breadcrumb items={[{ label: "Projeler", href: "/projeler" }, { label: "Teklif 12" }]} />
```

### İlerleme çubuğu (`progress`)

```tsx
import { Progress } from "@/components/snn/progress/progress";

<Progress label="Yükleniyor" value={64} showValue />
```

### Bölmeli seçici (`segmented-control`)

```tsx
import SegmentedControl from "@/components/snn/segmented-control/segmented-control";

<SegmentedControl label="Görünüm" value={view} onValueChange={setView} options={[{ value: "liste", label: "Liste" }, { value: "pano", label: "Pano" }]} />
```

### Çekmece (`drawer`)

```tsx
import { Drawer, DrawerTrigger, DrawerClose, DrawerContent, useDrawerItem } from "@/components/snn/drawer/drawer";

<Drawer><DrawerTrigger asChild><Button>Aç</Button></DrawerTrigger><DrawerContent title="Ayrıntılar">…</DrawerContent></Drawer>
```

### Aramalı seçim (`combobox`)

```tsx
import { Combobox } from "@/components/snn/combobox/combobox";

<Combobox label="Şehir" options={[{ value: "ist", label: "İstanbul" }]} onValueChange={setCity} />
```

### Kişi simgesi (`avatar`)

```tsx
import { Avatar } from "@/components/snn/avatar/avatar";

<Avatar name="İsmail Yılmaz" status="online" />
```

### Ayarlar sayfası (`settings-page`)

```tsx
import { SettingsPage, SettingsGroup, SettingsRow } from "@/components/snn/settings-page/settings-page";

<SettingsPage sections={sections} status={status} onSave={save} onDiscard={reset} user={{ name: "Elif Aksoy", subtitle: "Yönetici" }} />
```

### Ekip üyeleri (`team-members`)

```tsx
import { TeamMembers } from "@/components/snn/team-members/team-members";

<TeamMembers members={members} invites={invites} roles={roles} seatLimit={10} onInvite={invite} onRoleChange={changeRole} onRemove={remove} onResend={resend} onCancelInvite={cancel} />
```

### Kenar menüsü (`sidebar`)

```tsx
import { Sidebar } from "@/components/snn/sidebar/sidebar";

<Sidebar header={{ name: "Acme Ofis" }} sections={sections} activeId={page} onNavigate={setPage}>{content}</Sidebar>
```

### Arama sonuçları (`search-results`)

```tsx
import { SearchResults } from "@/components/snn/search-results/search-results";

<SearchResults results={results} today="2026-10-15" workspaceName="Acme Ofis" suggestions={["teklif", "şartname"]} onOpen={open} />
```

### Yardım merkezi (`help-center`)

```tsx
import { HelpCenter } from "@/components/snn/help-center/help-center";

<HelpCenter topics={topics} articles={articles} quickSearches={["fatura", "parola"]} onContact={contact} onFeedback={sendFeedback} />
```

### Aranabilir ayarlar (`settings-command`)

```tsx
import { SettingsCommand } from "@/components/snn/settings-command/settings-command";

<SettingsCommand sections={sections} items={items} values={saved} suggestedIds={["dark", "twofa"]} onSave={save} />
```

### Ekip rehberi (`team-directory`)

```tsx
import { TeamDirectory } from "@/components/snn/team-directory/team-directory";

<TeamDirectory people={people} onSelect={openProfile} />
```

### Roller ve izinler (`roles-permissions`)

```tsx
import { RolesPermissions } from "@/components/snn/roles-permissions/roles-permissions";

<RolesPermissions roles={roles} groups={groups} values={granted} members={people} roleMenu={role => [{ label: "Rolü çoğalt" }]} onSave={saveChanges} />
```

### Gelen kutusu ayıklama (`inbox-triage`)

```tsx
import { InboxTriage } from "@/components/snn/inbox-triage/inbox-triage";

<InboxTriage messages={messages} onMove={moveMessage} onRead={markRead} />
```

### Yayına hazırlık listesi (`release-readiness`)

```tsx
import { ReleaseReadiness } from "@/components/snn/release-readiness/release-readiness";

<ReleaseReadiness title="Sürüm 2.4" checks={checks} channel="Teklif ekibi" actionLabel="Yayını başlat" onAction={start} />
```

### Adım adım form (`multi-step-form`)

```tsx
import { MultiStepForm } from "@/components/snn/multi-step-form/multi-step-form";

<MultiStepForm steps={[{ id: "contact", title: "İletişim", content: <Input label="Ad" required /> }]} onComplete={submit} successAction={{ label: "Panoya git", onClick: goHome }} />
```

### Haftalık takvim (`week-calendar`)

```tsx
import { WeekCalendar } from "@/components/snn/week-calendar/week-calendar";

<WeekCalendar events={events} calendars={calendars} today="2026-10-15" onCreate={create} onUpdate={update} onDelete={remove} />
```

### Ortak uygun saat seçici (`availability-picker`)

```tsx
import { AvailabilityPicker } from "@/components/snn/availability-picker/availability-picker";

<AvailabilityPicker title="Keşif toplantısı" durationMinutes={30} timezoneLabel="İstanbul saati" participants={people} days={days} onConfirm={schedule} />
```

### Küçük proje panosu (`project-board`)

```tsx
import { ProjectBoard } from "@/components/snn/project-board/project-board";

<ProjectBoard name="Teklif hazırlığı" tasks={tasks} people={people} currentUserId="p1" onMove={moveTask} onAdd={addTask} />
```

### Sürükle-bırak iş panosu (`kanban-board`)

```tsx
import { KanbanBoard } from "@/components/snn/kanban-board/kanban-board";

<KanbanBoard name="Teklif hattı" cards={cards} columns={columns} people={people} tags={tags} onChange={saveOrder} onAdd={addCard} />
```

### Dönen rakamlı sayaç (`animated-counter`)

```tsx
import { AnimatedCounter } from "@/components/snn/animated-counter/animated-counter";

<AnimatedCounter value={1234.5} decimals={1} prefix="₺" label="Aylık ciro" animateOnView />
```

### Gösterge kartı (`metric-card`)

```tsx
import { MetricCard } from "@/components/snn/metric-card/metric-card";

<MetricCard label="Aylık ciro" value={1250000} format="compact-money" change="+%12,3" context="Geçen aya göre" />
```

### Mini çizgi grafik (`sparkline`)

```tsx
import { Sparkline } from "@/components/snn/sparkline/sparkline";

<Sparkline label="Haftalık sipariş" value="1.284" change="+%8,2" data={[820, 910, 880, 1010, 1100, 1284]} labels={days} />
```

### Çizgi grafik (`line-chart`)

```tsx
import { LineChart, LineChartDatum, LineChartSeries } from "@/components/snn/line-chart/line-chart";

<LineChart label="Haftalık sipariş" data={data} series={[{ key: "bu", label: "Bu hafta" }, { key: "gecen", label: "Geçen hafta", dashed: true }]} unit="adet" />
```

### Çubuk grafik (`bar-chart`)

```tsx
import { BarChart, BarChartDatum } from "@/components/snn/bar-chart/bar-chart";

<BarChart label="Günlük sipariş" period="12–18 Ekim 2026" data={days} unit="adet" />
```

### Halka grafik (`donut-chart`)

```tsx
import { DonutChart, DonutChartDatum } from "@/components/snn/donut-chart/donut-chart";

<DonutChart label="Kaynağa göre ziyaret" data={[{ key: "arama", label: "Arama", value: 4200 }, { key: "dogrudan", label: "Doğrudan", value: 2100 }]} unit="ziyaret" />
```

### Gösterge halkası (`gauge`)

```tsx
import { Gauge } from "@/components/snn/gauge/gauge";

<Gauge label="Kasa doluluğu" value={72} detail="Hedef %80" thresholds={[{ from: 0, tone: "accent", label: "Normal" }, { from: 85, tone: "danger", label: "Kritik" }]} />
```

## Bu rafta olmayanlar

| Ad | Neden | Ne zaman |
|---|---|---|
| `metric-card` | Arc'ta `animated-counter` ile gelir; o da `Intl.NumberFormat` ve varsayılan `en-US` biçimi kullanır (`1,234`). | 2. raf, ABACUS ile |
| `money-input`, `number-field`, `phone-input`, `date-picker`, `sortable-data-table`, grafikler | B sınıfı: yasak biçim çağrısı içerir. | 2. raf, ABACUS ile |

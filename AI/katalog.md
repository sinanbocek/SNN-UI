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
| `usage-meter` | Kullanım göstergesi | Depolama ya da koltuk gibi sabit bir hakkın ne kadarının neye gittiğini tek çubukta gösterir: kategoriler vurgunun basamaklarıdır, boş alan izin kendisidir. Başlıkta dönen rakamlı toplam, durum işareti ("3,2 GB boş", "Neredeyse dolu", "… aşıldı") ve klavyeyle gezilen gösterge vardır. Limit aşılınca taşan kısım taramalı çizilir; durum değişimleri ekran okuyucuya duyurulur. Sayılar ABACUS biçimindedir (sabit ondalıklı "42,5", binlik ayracı nokta); `decimals` ondalık basamak sayısıdır. Rakam sütunları `animated-counter` ile ortaktır (`counterParts`). Durum metinleri Türkçedir ("Boş", "Limit aşımı", "Neredeyse dolu"); `warnAt` varsayılanı 0,9. Gerçek kullanım verisini proje verir. | `npx shadcn@latest add @snn-ui/usage-meter` |
| `slope-chart` | Eğim grafiği | Birkaç öğenin tam iki an arasında nasıl değiştiğini (ve sıralarının nasıl değiştiğini) gösterir: her öğe iki sütun arasında bir çizgidir. Etiketler üst üste binmez, hikâye öğesi vurgu renginde çizilir, odaktaki öğe öne çıkar ve ipucu değer, fark ve sıra değişimini söyler (yukarı/aşağı oklarla gezilir). Kapanma sırası sıra okuyla gösterilir. Değerler ABACUS biçimindedir ("1.234,5"); `formatValue` ile yüzde ya da tutar yazımı verilebilir (`snn-chart-format`: `formatPercent`, `formatMoney`). Farkı `formatChange` ile özelleştirin (varsayılan işaretli fark). Renkler `snn-chart-palette` ve nötr mürekkeptir; amber yok. Verinin iki dönemini proje verir. | `npx shadcn@latest add @snn-ui/slope-chart` |
| `treemap` | Ağaç haritası | Bölge, ülke ve plana göre ciro gibi bir parça hiyerarşisini boyutla orantılı kutularla gösterir; boyutlar kesin karşılaştırmadan önemli olduğunda kullanılır. Üst düzey dallar dört seri tonunu alır, isteğe bağlı ikinci ölçü (büyüme gibi) koyuluğu belirler. Kutuya tıklayınca ya da Enter ile içine yakınlaşılır, Escape ya da yol izi ile geri dönülür; ipucu değeri ve üst öğedeki payı ("%12,3 Avrupa içinde") söyler. Değerler ve paylar ABACUS biçimindedir ("1.234,5", "%12,3"); `formatValue` ile tutar yazımı verilebilir (`snn-chart-format`: `formatMoney`). Renkler `snn-chart-palette`tir (en çok dört ton, sonrası nötr); amber yok. Hiyerarşiyi proje verir; yüzlerce yapraktan sonra sunucu tarafında toplama projenin işidir. | `npx shadcn@latest add @snn-ui/treemap` |
| `waffle-chart` | Kare ızgara grafiği | Bir bütünün parçalarını sayılabilir karelerle gösterir: her hücre bütünün bir payıdır (10 × 10 ızgarada yüzde başına bir hücre). Hücreler sol alttan sütun sütun, bardak dolar gibi dolar; veri değişince hücreler bir kategoriden ötekine uçarak taşınır. Renk yalnız tek kanal değildir: nötr kategoriler kare, yuvarlak ve çerçeveli hücrelerle de ayrışır. Gösterge payları ("%36") yeni değerine döner; ok tuşlarıyla hücre hücre gezilir. Paylar ABACUS `money.percent` ile yazılır ("%36", `decimals` ile sabit ondalık "%36,0"); ham değerler "1.234,5" biçimindedir. `formatValue` ile birimli yazım verilebilir. Renkler `snn-chart-palette` ve nötr basamaklardır; amber yok. Hücre sayıları en büyük kalan yöntemiyle dağıtılır, toplam hep ızgarayı verir. | `npx shadcn@latest add @snn-ui/waffle-chart` |
| `brush-chart` | Fırça grafiği | Uzun ve yoğun bir zaman serisinde hem tüm geçmişi hem de herhangi bir kesitine yakından bakmayı sağlar: altta tüm serinin genel bakış şeridi, üstte seçili pencerenin büyük grafiği. Pencere kenarlarından boyutlandırılır, tutulup kaydırılır, boş izden yenisi çizilir (dokunma yeniden ortalar, çift dokunma sıfırlar); klavyeyle de gezilir. Uzaklaşınca yedi günlük ortalama ve bandı ham çizginin yerini alır; olaylar işaretlenir. Tarihler Türkçedir ("15 Ekim 2026 Per"). Veri `{ date, value }` dizisidir (artan sırada; `date` Date ya da epoch milisaniyesi, günlük aralıklar UTC gününe göre okunur). Tarih etiketleri ABACUS `date` ile (gün adı, ay adı, "15.10.2026"), değerler ABACUS sayı biçimiyle yazılır; `formatValue`, `formatTick`, `formatDate` ile değiştirilir. Renkler `snn-chart-palette`tir (mavi ve menekşe); amber yok. Pencereyi `range` / `onRangeChange` ile dışarıdan yönetebilirsiniz. | `npx shadcn@latest add @snn-ui/brush-chart` |
| `activity-heatmap` | Etkinlik takvimi | Gün başına bir kare, haftalar sütun: günün ne kadar yoğun olduğunu dört vurgu tonu söyler. Ritim, seri ve sakin haftalar kesin karşılaştırmadan önemli olduğunda kullanılır. Üstte dönen rakamlı özet ("1.284 katkı 2025 yılında"); kareler görününce dalga olur, ipucu hücreler arasında süzülür, yeni aralık ızgarayı süpürerek yeniden renklendirir. Oklarla gün ve hafta gezilir, Enter seçer; gösterge düzeyleri ızgarada önizler ve sabitler. Dar ekranda yana kayar. Gün verisi `{ date: "2025-03-14", count }` biçimindedir (ISO). Tarih ve gün adları ABACUS `date` ile ("15 Ekim 2026 Perşembe", "Eki", "Per"), sayılar `money.fmtDecimalGrouped` ile ("1.284") yazılır; Arc'ın `locale` prop'u kaldırıldı. `period` özet cümlesini tamamlar ("2025 yılında"). `unit` Türkçede çoğul almadığı için `{ one, other }` aynıdır. Renkler vurgunun tonlarıdır (`--series-*` gerekmez). | `npx shadcn@latest add @snn-ui/activity-heatmap` |
| `streamgraph` | Akış grafiği | Birkaç parçanın karışımının zamanla nasıl değiştiğini, genel biçim kesin değerlerden önemli olduğunda gösterir: katmanlar merkezden dışa, akıcı bir şerit olarak dizilir. Katmanlar yeni veriye ve gizlemeye akarak uyar, ilk görünüşte merkezden kabarır. Katman adları yeterince kalın kesitte doğrudan yazılır; üzerine gelinen katman öne çıkar, ipucu o zamandaki tüm değerleri söyler. Ok tuşlarıyla zamanda ve katmanlar arasında gezilir. Değerler ABACUS biçimindedir ("1.234,5"); `formatValue` ile birimli yazım verilebilir. Hafta ve tarih etiketlerini (`label`, `axisLabel`) proje ABACUS `date.format` ile hazırlar. Renkler `snn-chart-palette`tir (dört ton, sonrası nötr); amber yok. Verinin zaman aralığını proje yönetir. | `npx shadcn@latest add @snn-ui/streamgraph` |
| `ridgeline` | Sırt çizgisi grafiği | Birçok dağılımın biçimini aynı anda karşılaştırır, örneğin aylara göre günlük sıcaklık ya da bölgelere göre yanıt süresi: her satır, ham gözlemlerin yumuşatılmış yoğunluğudur ve üstteki satırlara taşar. Sırtlar medyanlarına göre açık tondan koyuya gölgelenir; üzerine gelinen sırt öne çıkar, ipucu medyanı, orta yarıyı, aralığı ve imleç değerinin altında kalan payı ("%36") söyler. Ok tuşlarıyla sırtlar ve değerler gezilir; veri değişince sırtlar yeni biçime akar. Değerler ABACUS biçimindedir ("1.234,5", eksi için gerçek eksi işareti); `formatValue` ile özel yazım verilebilir. Paylar `money.percent` ile yazılır ("%36"). Renk tek tondur: `snn-chart-palette` birinci serisi, medyana göre açıktan koyuya; amber yok. Ham gözlemleri proje verir (yüzlerce değer rahat; çok uzun listelerde önceden toplamak projenin işidir). | `npx shadcn@latest add @snn-ui/ridgeline` |
| `slot-text` | Makaralı metin | Metin ve sayıların yeni değerine kumar makinesi makaraları gibi dönmesi: her karakter bir makaradır, rakamlar sayının gittiği yönde çarkta sayar, harfler Türk alfabesinde (ç, ğ, ı, ö, ş, ü dahil) karışır, makaralar soldan sağa birer birer yumuşakça durur. Sayılar ABACUS biçimindedir ("12.480", "1.234,5"), baştaki ₺ gibi simgeler rakama dönmez. Fiyat, istatistik ve lansman anları için; ekran okuyucu düz metni okur. Sayı değeri `format` verilmezse ABACUS `money.fmtDecimalGrouped` biçimiyle yazılır (en çok 3 ondalık, "1.234,5"); para için `snn-chart-format` (`formatMoney`) ile `format` verilir. Metin değerler olduğu gibi çizilir; harf makaraları Türk alfabesini döner (`text.upper` ile i → İ). `announce` ekran okuyucuya nazikçe duyurur. Hareketi azalt tercihine uyar. | `npx shadcn@latest add @snn-ui/slot-text` |
| `split-bar` | Bölünmüş yüzde çubuğu | Bir bütünü tek yatay çubukta paylara böler: üzerine gelinen dilim biraz genişler, okuma alanı dilimin adını, payını ("%41,6") ve tutarını yazar. Sığmayan etiketler çubuğun altındaki şeride ince çizgiyle taşar. Açıklama satırından dilimler kapatılıp açılır, kalanlar çubuğu doldurur; son açık dilim kapanmaz. Ok tuşlarıyla gezilir; ekran okuyucu için tablo ve canlı duyuru vardır. Tutarlar TRY ve ABACUS biçimindedir ("₺1.250.000"), paylar `money.percent` ile ("%41,6"); `formatValue` ile adet gibi başka biçim verilebilir. Pay hesabı yuvarlanmamış değerle yapılır, yalnız gösterim yuvarlanır. Sıfır ve negatif dilim çubukta yer almaz; çok kategori için "Diğer"i proje toplar. Dönem seçiciyi proje `actions` ile koyar. Arc Pro split-bar'dan esinlenildi (tarif: docs/tarifler/split-bar.md). | `npx shadcn@latest add @snn-ui/split-bar` |
| `sankey-flow` | Akış şeması | Bir toplamın aşamalar boyunca nasıl bölündüğünü ve birleştiğini, düğümler arasında kalınlığı değere orantılı şeritlerle gösterir. Düğüme ya da şeride gelince o payın baştan sona tüm yolu vurgulanır, ipucu değeri ve kaynağa göre payı ("%41,6") yazar. Şeritlerde yavaşça ilerleyen noktalar yönü hissettirir; "Akış" anahtarıyla durur. Ok tuşlarıyla düğümler gezilir; dar ekranda şema dikeye döner. Ekran okuyucu için akış tablosu vardır. `kind="count"` adedi ("1.234"), `kind="money"` TRY tutarı ("₺1.250.000", düğüm yanında "₺1,25Mn") yazar; paylar `money.percent` ile. Sütunlar akış yönünden kendiliğinden bulunur (en uzun yol), döngülü akış desteklenmez. Bir sütunda yaklaşık 12'den fazla düğüm varsa küçükleri "Diğer"e proje toplar. Dönem seçiciyi proje `actions` ile koyar. Arc Pro sankey-flow'dan esinlenildi (tarif: docs/tarifler/sankey-flow.md). | `npx shadcn@latest add @snn-ui/sankey-flow` |
| `funnel-chart` | Huni grafiği | Adım adım daralan bir süreci (ziyaretçi → sipariş) tek yatay bantla gösterir: adım başlıklarında kısa sayı ve bir önceki adımdan kalan oran ("%44,3"), adımlar arasında düşüş ("↓ 15.100 (-%70,6)"). Adıma gelince odak sütunu ve ipucu tam sayıyı, ilk adıma ve öncekine oranı yazar. Parçalı veride Toplam, Bölünmüş ya da tek parça görünümü seçilir; band yeni biçime akar. Ok tuşlarıyla gezilir; dar ekranda huni dikeye döner. Ekran okuyucu için tablo vardır. `kind="count"` adedi, `kind="money"` TRY tutarı yazar; başlıkta kısa ("12,5B", "₺1,25Mn"), ipucunda tam biçim ("48.200"). Oranlar `money.percent`, düşüş yüzdesi `math.percentChange` ile (negatif işaretli). Parçasız veride yalnız Toplam görünür. İlk adım sıfırsa "Veri yok" yazar. Arc Pro funnel-chart'tan esinlenildi (tarif: docs/tarifler/funnel-chart.md). | `npx shadcn@latest add @snn-ui/funnel-chart` |
| `race-bar-chart` | Sıralama yarışı | Bir sıralamanın zaman içinde nasıl değiştiğini yatay çubuklarla anlatır: çubuklar uzar, birbirini geçer, değerler dönemler arasında ara değerle akar; büyük dönem etiketi değişir. Altta oynat/duraklat düğmesi ve istenen döneme götüren kaydırıcı vardır. Görününce kendiliğinden oynar ("hareketi azalt" açıkken oynamaz), görünüm dışında durur. Boşluk, ok tuşları, Home/End ve yukarı/aşağı ok ile gezilir; dönem ve lider kibar canlı bölgede duyurulur. Ekran okuyucu için tüm dönemlerin tablosu vardır. `kind="money"` TRY tutarı (çubukta kısa "₺1,25Mn", tabloda tam "₺1.250.000"), `kind="count"` adedi yazar; ara değerler yuvarlanır, ekranda kuruş görünmez. Dönem etiketlerini proje ABACUS `date` ile hazırlar. Eksik değer sıfır sayılır; `group` aynı renk grubunu belirler (en çok dört). `autoPlay`, `loop`, `msPerPeriod` ile oynatma ayarlanır. Anlatı bileşenidir, günlük panelde kullanılmaz. Arc Pro race-bar-chart'tan esinlenildi (tarif: docs/tarifler/race-bar-chart.md). | `npx shadcn@latest add @snn-ui/race-bar-chart` |
| `realtime-stream` | Canlı akış grafiği | Saniyeler içinde değişen bir ölçümü canlı izler: büyük anlık değer (rakamlar döner), "Canlı" / "Duraklatıldı" durum düğmesi ve son 30 saniyeyi gösteren yumuşak çizgi. Grafiğin üstüne gelince ya da odaklanınca görüntü durur, okumalar arka planda birikir; ipucu zamanı ("14:03:27"), değeri ve varsa notu yazar. Anomali notları çizgi üstünde işaretlenir ve bir kez duyurulur. Veri bekleniyor ve bağlantı kesildi ("Yeniden dene") durumları vardır; görünüm dışında çizim durur. Okuma `{ t, value, note? }` biçimindedir (`t`: epoch ms, artan sırada); diziyi büyütmeyi (son birkaç pencereyi tutmayı) ve gerçek bağlantıyı proje yapar, anomali işaretini (`note`) proje verir. Değerler ABACUS biçimindedir ("1.234,5", para `kind="money"` ile "₺41,25"), eksen kısa biçimdedir; zaman etiketleri Türkiye saatiyle ABACUS `date.format` (saat:dakika) ve saniye ile yazılır. `min`/`max` verilirse eksen sabitlenir. Arc Pro realtime-stream'den esinlenildi (tarif: docs/tarifler/realtime-stream.md). | `npx shadcn@latest add @snn-ui/realtime-stream` |
| `metrics-dashboard` | Özet gösterge paneli | Blok: dört ana gösterge sekme gibi sıralanır (ad, dönen rakamlı değer, ok ve işaretli değişim); seçilen gösterge altındaki çizgi grafikte görülür, "Karşılaştır" önceki dönemin kesikli çizgisini ekler. Üstte dönem anahtarı (7/30/90 gün) ve "Dışa aktar"; altta iki sıralı liste yatay oran çubuklarıyla durur. Yükleniyor, hata ("Yeniden dene"), boş ve dar ekran durumları vardır; düzen pencereye değil bileşenin kendi genişliğine bakar. Göstergeler `kind` ile yazılır: "count" ("1.234"), "money" (kutuda "₺1,25Mn", ipucunda "₺1.250.000"), "percent" ("%3,2"). Değişim adet ve tutarda `math.percentChange` + `money.percent` ("+%11,7"), yüzde türünde puan farkıdır ("+0,1 puan"); yön ok, işaret ve ekran okuyucu metniyle de söylenir, renk tek ipucu değildir. Azalışın iyi olduğu göstergede (`lowerIsBetter`) azalış olumlu renkte yazılır; olumsuz yön kırmızı değil mavi-gridir. Dönem, veri ve yükleme durumunu proje verir; "Dışa aktar" onay iletisini yerelde gösterir, aktarımı proje bağlar. Arc Pro metrics-dashboard'dan esinlenildi (tarif: docs/tarifler/metrics-dashboard.md). | `npx shadcn@latest add @snn-ui/metrics-dashboard` |
| `kpi-drilldown` | Gösterge ayrıntı paneli | Blok: altı kadar gösterge, her biri küçük çizgi grafikli bir kart olarak ızgarada durur. Karta basınca kart, aynı yüzeyin büyümesiyle ayrıntıya açılır: büyük çizgi grafik, önceki dönem karşılaştırması ve kırılım tablosu (değer, işaretli değişim, pay çubuğu; boyut seçilir). Esc ya da "Kapat" aynı karta geri katlar, odak karta döner. Üstte dönem anahtarı ve "Karşılaştır"; yeterli önceki dönem verisi yoksa düğme pasiftir. Yükleniyor, hata ve dar kap (3 / 2 / 1 sütun) durumları vardır. Değerler `kind` ile yazılır: "count" ("3.180"), "money" (kartta "₺842B" gibi kısa, ayrıntıda "₺842.000"), "percent" ("%91,4"). Değişim adet ve tutarda `math.percentChange` + `money.percent` ("+%11,7"), yüzde türünde puan farkıdır ("+0,1 puan"); yön ok, işaret ve ekran okuyucu metniyle verilir. Düşmesi iyi gösterge (`lowerIsBetter`) azalışta olumlu renkte yazılır; olumsuz yön kırmızı değil mavi-gridir. Kırılım payı `money.percent` ile; yüzde türünde pay sütunu yoktur. Her gösterginin serisini ve kırılımlarını proje verir; açık göstergeyi `openKey` ile dışarıdan yönetebilirsiniz. Arc Pro kpi-drilldown'dan esinlenildi (tarif: docs/tarifler/kpi-drilldown.md). | `npx shadcn@latest add @snn-ui/kpi-drilldown` |
| `metric-explorer` | Gösterge gezgini | Blok: sayfa başında dört gösterge kartı (ad, dönen rakamlı değer, işaretli değişim, dönem adı, mini çizgi). Karta basınca kart, aynı yüzeyin büyümesiyle sekmeli grafik paneline dönüşür: gösterge sekmeleri, dönem anahtarı, büyük çizgi grafik ve tarihli okuma satırı (tarih, değer, önceki noktaya göre değişim). Grafikte fare, dokunma ve ok tuşlarıyla gezilir; ilk Esc okunan noktayı, ikincisi paneli kapatır ve odak karta döner. Yükleniyor, hata, veri yok ve dar kap durumları vardır. Değerler `kind` ile yazılır: "count" ("2.410"), "money" (kartta kısa "₺1,25Mn", okuma satırında "₺41.000"), "percent" ("%91,4"). Değişim adet ve tutarda `math.percentChange` + `money.percent` ("+%11,7"), yüzde türünde puan farkıdır; yön ok, işaret ve ekran okuyucu metniyle verilir. Düşmesi iyi gösterge (`lowerIsBetter`) azalışta olumlu renkte yazılır; olumsuz yön kırmızı değil mavi-gridir. Seri iki noktadan kısaysa kart "Veri yok" der ve açılmaz. Tarih etiketlerini (`label`, `axisLabel`) ve güncelleme metnini proje ABACUS `date.format` ile hazırlar. Arc Pro metric-explorer'dan esinlenildi (tarif: docs/tarifler/metric-explorer.md). | `npx shadcn@latest add @snn-ui/metric-explorer` |
| `revenue-explorer` | Gelir gezgini | Blok: aylık yinelenen gelirin üç hareketini (yeni, genişleme, kayıp) aylara göre çizgilerle gösterir; kayıp sıfırın altında durur. Altındaki fırça şeridinde pencere sürüklenir, kenar tutamaçlarından büyütülüp küçültülür (aylık adımlarla; klavyeyle de) ya da "3A / 6A / 12A / Tümü" düğmeleriyle seçilir; çizgiler ve özet rakamları yeni döneme akar. Özet üçlüsü: ana gelir ve büyüme, aylık net yeni gelir, aylık kayıp oranı (puan farkı). Seri düğmeleri seriyi çıkarıp getirir; "Önceki dönemle karşılaştır" bir önceki aynı uzunlukta dönemi ekler. Yükleniyor, hata ve dar kap durumları ile ekran okuyucu tablosu vardır. Tutarlar TRY ve ABACUS biçimindedir: özet ve ipucunda "₺905.000", eksen ve karşılaştırma satırında kısa "₺1,25Mn"; büyüme `math.percentChange` + `money.percent` ("+%12,3"), kayıp oranı iki ondalıkla ("%1,84") ve önceki döneme fark "puan" olarak ("+0,12 puan"). Ay adları ABACUS `date` ile ("Mart 2026"; eksende ocakta yıl da yazılır). Ayları aylara toplulaştırarak vermek projenin işidir; `churn` pozitif büyüklük olarak verilir, grafikte sıfırın altına çizilir. Karşılaştırma için bir önceki aynı uzunlukta dönem yoksa anahtar pasiftir ("Önceki dönem yok"). Arc Pro revenue-explorer'dan esinlenildi (tarif: docs/tarifler/revenue-explorer.md). | `npx shadcn@latest add @snn-ui/revenue-explorer` |
| `mrr-waterfall` | Gelir şelalesi | Blok: düzenli (aylık yinelenen) gelirin bir dönemin başından sonuna nasıl değiştiğini köprü grafiğiyle anlatır: başlangıç çubuğu, yukarı doğru (yeni, genişleme, yeniden aktif) ve aşağı doğru (daralma, kayıp) yüzen basamaklar, bitiş çubuğu. Üstte dönen rakamlı bitiş değeri, dönem boyu değişim ("+₺180.000 (+%12,3)") ve net elde tutma, hızlı oran, müşteri kaybı göstergeleri vardır. Çubuğa basınca (ya da ok tuşlarıyla) altındaki panel o basamağın en büyük hesaplarını ve "Diğer hesaplar" satırını gösterir. "Tutar" / "Başlangıca göre %" birim seçicisi, yükleniyor, hata ve dar kap (panel altta) durumları vardır. Tutarlar TRY ve ABACUS biçimindedir: panel ve özet "₺2.210.000", çubuk üstü ve eksen kısa "+₺148B" / "-₺41,5B" (eksi işareti ABACUS'tan gelir, yalnız renkle değil); birim "% başlangıç" iken "+%6,7". Dönem boyu değişim `math.percentChange` + `money.percent`, hızlı oran iki ondalıkla `money.fmtDecimalGrouped` ("3,20"), net elde tutma ve kayıp `money.percent`. Dönemi, tarih metinlerini (ABACUS `date.format`) ve hesap listelerini proje verir; hareketlere `role` verilirse göstergeler hesaplanır, yoksa "—" yazılır. Çok hesap `maxAccounts` ile sınırlanır, kalanı "Diğer hesaplar (n hesap)" olur. Arc Pro mrr-waterfall'dan esinlenildi (tarif: docs/tarifler/mrr-waterfall.md). | `npx shadcn@latest add @snn-ui/mrr-waterfall` |
| `cohort-retention` | Kohort elde tutma | Blok: aynı ayda katılan grupların (kohortların) aylar geçtikçe ne kadarının aktif kaldığını gösterir. Her satır bir katılım ayı (ad ve büyüklük), her sütun katılımdan sonraki ay; hücrede kalan yüzde ("%68") yazar, rengi yüzdeye göre koyulaşır; ölçülmemiş aylar boştur (alt üçgen), en altta büyüklüğe göre ağırlıklı "Ortalama" satırı durur. Üstte "1. ay" ve "6. ay" elde tutma ile yeni kayıt toplamı (son üç kohort ile ilk üç kohort farkı "+5,2 puan"); segment seçilince renkler hücre hücre yeniden boyanır. "Isı haritası" / "Eğriler" anahtarıyla her kohort bir çizgi olur. Hücre ve eğri okuması fare ve ok tuşlarıyla yapılır, canlı bölgede duyurulur; gizli tablo, yükleniyor, hata ve boş durum vardır. Yüzdeler ABACUS `money.percent` ile yazılır: hücrede tam sayı ("%68"), okumada bir ondalık ("%68,4"); gösterge değişimi puan farkıdır ("+5,2 puan"), kohort büyüklüğü `money.fmtDecimalGrouped` ("1.234"), kohort adı ABACUS `date.format` ("Kasım 2025"). `retention` dizisinde ölçülmemiş ay `null` verilir ("Henüz ölçülmedi"). Segmenti ve kohortları proje verir; çok küçük kohort için alt sınırı proje koyar. 12×12 civarı için tasarlanmıştır. Arc Pro cohort-retention'dan esinlenildi (tarif: docs/tarifler/cohort-retention.md). | `npx shadcn@latest add @snn-ui/cohort-retention` |
| `usage-forecast` | Kullanım tahmini | Blok: bir fatura döneminde bir ölçünün (istek, depolama, koltuk) şimdiye kadarki kullanımını çizer ve dönem sonuna kadar gidişini tahmin eder; tahmin soluk bir olası aralık konisiyle devam eder. Bütçe çizgisi tutamacından sürüklenir ya da ok tuşlarıyla oynatılır: ana cümle ("Bu hızla bütçeye 26 Eylül 2026 günü ulaşırsınız, büyük olasılıkla … arası"), aşma işareti, bütçe üstü maliyet ve %50 / %80 / %100 uyarı tarihleri hemen yeniden hesaplanır. Uyarı kuralları açılıp kapanır, grafikte gün gün okunur; zaten aşıldı, aşılmayacak, yetersiz veri, yükleniyor, hata ve boş durumları ile gizli tablo vardır. Kullanım ve bütçe ABACUS biçimindedir ("38.000.000", eksen ve etikette kısa "38Mn"); yüzdeler `money.percent` ("%61"), bütçe üstü maliyet ve birim fiyat TRY ("₺1.250,00"), tarihler ABACUS `date.format` ("26 Eylül 2026"). Tahmin son yedi günün ortalama artışından doğrusal gidiştir; koni günlük artışın dalgalanmasından (yaklaşık %80 aralık) türer ve en az üç gün veri ister. Gerçekleşen günleri kümülatif olarak proje verir; bütçe `onBudgetChange` ile dışarıdan yönetilebilir (verilmezse bileşen tutar), uyarı kurallarının kaydını proje bağlar. Bütçe aşımı gerçek hata sayıldığı için kırmızıdır, yalnız renkle değil yazı ve işaretle de söylenir. Arc Pro usage-forecast'tan esinlenildi (tarif: docs/tarifler/usage-forecast.md). | `npx shadcn@latest add @snn-ui/usage-forecast` |
| `budget-variance` | Bütçe sapması | Blok: planlanan ile gerçekleşen harcamayı bölüm (maliyet merkezi) bazında hizalı çubuklarla karşılaştırır. Her satırda bütçe işareti aynı hizada durur; harcama çubuğu bu işareti geçerse geçen kısım kırmızı görünür. Yanında işaretli sapma tutarı ve yüzdesi ("+₺150.000", "+%12,5 aşım" / "-%4,0 altında" / "plana uygun") yazar. Ay, çeyrek ve yıl başından beri arasında geçilir (tutarlar sayarak değişir); bir bölüm satır içinde açılıp bütçe kalemlerine inilir, aynı anda tek bölüm açık kalır; en üstte toplam satırı vardır. Bütün kalemler gider sayılır: altında kalmak olumlu, aşmak olumsuzdur. Yükleniyor, hata, boş ve dar kap (satır içinde alt alta) durumları vardır. Harcanan ve bütçe TRY ve ABACUS biçimindedir (satırda "₺1.350.000" ve kısa "/ ₺1,25Mn"); sapma işaretli tutardır ("+₺150.000", eksi ABACUS'tandır) ve yüzdesi `math.percentChange(gerçekleşen, bütçe)` → `money.percent` ile sözle biter ("aşım", "altında", "plana uygun"), yalnız renkle değil. Bölümün ve toplamın değerleri kalemlerinden toplanır (tutmama olamaz); kalemsiz bölümde `budget` ve `actual` verilir. "Plana uygun" bandı `tolerance` (varsayılan bütçenin ±%2'si); ölçek tavanı veriden (en az %120) ya da `scale` ile sabitlenebilir. Bölüm açılınca `onOpen` çağrılır (kalemleri tembel yüklemek için). Dönemi ve veriyi proje verir. Arc Pro budget-variance'tan esinlenildi (tarif: docs/tarifler/budget-variance.md). | `npx shadcn@latest add @snn-ui/budget-variance` |
| `small-multiples` | Küçük çoklu grafikler | Blok: aynı ölçünün birkaç serisini (bölge, ürün, plan) her biri küçük bir çizgi grafikte, ızgara düzeninde gösterir. Fareyle, dokunmayla ya da oklarla gezilen tek bir dikey imleç bütün panellerde aynı ayı gösterir; panel başlığında o aydaki değer, trend oku ve geçen yıla göre işaretli büyüme ("▲ +%12,3") yazar. Y ekseni "Bağımsız" (her panel kendi aralığına sığar) ya da "Ortak" (hepsi sıfırdan başlar) olabilir; paneller son değere, büyümeye ya da ada göre sıralanır (yer değiştirerek akar); her panelin arkasında toplamın kesikli izi durur; düz giden seriler soluklaştırılabilir. Tüm ızgara tek Tab durağıdır; ay, toplam ve en yüksek seri canlı bölgede duyurulur, gizli tablo vardır. Değerler `kind` ile yazılır: "money" TRY (başlıkta ve eksende kısa "₺1,25Mn", okumada "₺1.250.000"), "count" adet ("1.234"). Büyüme `math.percentChange(şimdiki, geçen yıl)` → `money.percent` ("+%12,3", eksi işareti ABACUS'tandır) ve ok ile "Yükseliyor / Düz / Düşüyor" sözüyle de verilir, yalnız renkle değil. `lookback` (varsayılan 12 ay) kadar geçmişi olmayan seride "Yeterli geçmiş yok" yazar; `flatBelow` (varsayılan %2) altındaki büyüme düz sayılır. Ad sıralaması ABACUS `collate` (Türkçe sıra) ile. Ay etiketleri verilmezse ABACUS `date.format` ("Eylül 2026"). 4–12 seri için tasarlanmıştır. Arc Pro small-multiples'tan esinlenildi (tarif: docs/tarifler/small-multiples.md). | `npx shadcn@latest add @snn-ui/small-multiples` |
| `line-replay` | Çizgi tekrarı | Blok: bir günün (ya da bir olayın) tek serisini, oynat düğmesine basınca soldan sağa kendini çizerek anlatır. Çizginin ucunda oynatma imleci ve değer etiketi gider; kilit anlar (duyuru, yayın, sorun) imleç oradan geçince çizgi üzerinde işaretlenir, üstte açıklama çıkar, yandaki "Kilit anlar" listesinde satır yanar ve etki satırı açılır ("sonraki saatte +1.240", sorunda "20 dakikada -%12,3"). Okuma satırı saat, değer, kıyasa göre çarpan ("4,8×") ve şu ana kadarki tepeyi yazar. Oynat/duraklat, kilit an işaretli kaydırıcı ve hız seçici (0,5× 1× 2× 4×) vardır; listeden bir ana basınca imleç oraya atlar. Varsayılan olarak çizgi tamam ve tüm anlar işlidir. Sorun anı farklı simge ve başlıkla gösterilir; yükleniyor, veri yok ve dar kap durumları ile klavye ve canlı duyurular vardır. Noktalar `{ t, value }` biçimindedir (`t`: epoch ms, artan, eşit aralıklı olmayabilir); kilit anlar arada kalırsa ara değerle çizgiye konur. Değerler ABACUS biçimindedir (adet "2.316", `kind="money"` ile "₺1.250,00"), eksen kısa ("2,3B"), saatler Türkiye saatiyle ABACUS `date.format(…, "time")` (09:40); kıyas çarpanı `money.fmtDecimalGrouped` (bir ondalık) ve "×". Değer ekseni tüm seriye göre sabittir. Kaydırıcının değer metni yalnız durdurulunca güncellenir (ekran okuyucu boğulmasın). "Hareketi azalt" açıkken kendiliğinden oynama kapalıdır; oynatma izleyicinin isteğiyle çalışır. `autoPlay` bileşen %40 görününce başlatır. Arc Pro line-replay'den esinlenildi (tarif: docs/tarifler/line-replay.md). | `npx shadcn@latest add @snn-ui/line-replay` |
| `market-terminal` | İşlem ekranı | Blok: bir menkul kıymetin fiyatını mum grafikle gösteren, yanında izleme listesi ve emir fişi bulunan tam bir işlem ekranı. Üstte sembol, "Canlı" düğmesi (akışı durdurur) ve dönen rakamlı güncel fiyat, günlük değişim (ok, işaretli tutar, yüzde), açılış / en yüksek / en düşük / hacim özeti; dönem düğmeleri (1G … 1Y), iki hareketli ortalama anahtarı ve yakınlaştırma düğmeleri. Grafikte mumlar, hacim çubukları, ortalamalar, son fiyat etiketi ve imleç altındaki açılış-en yüksek-en düşük-kapanış okuması vardır; tekerlekle ve iki parmakla yakınlaştırılır, sürüklenerek kaydırılır (bırakınca savrulur), klavyeyle gezilir. İzleme listesinde fiyat değişince satır yön tonuyla solar; emir fişi piyasa ve limit emri doğrular (alım gücü, pozisyon, geçersiz adet) ve uygulamanın verdiği işleve iletir; emir listesinde bekleyen emir iptal edilir. Yükleniyor, veri yok, akış duraklatıldı ve dar kap durumları vardır. Bileşen hiçbir gerçek emir göndermez: emri `onSubmitOrder` işlevine iletir; işlev reddederse (Promise) emir verilmemiş sayılır ve `Error.message` düğmenin altında yazılır. Fiyatlar ABACUS biçimindedir ("₺112,40", iki ondalık, Türkçe ayraç; `currency` ile başka birim), günlük değişim işaretli tutar ve `math.percentChange` → `money.percent` ("+%1,23"), hacim kısa ("1,2Mn") ve tam; saatler Türkiye saatiyle ABACUS `date.format`. Emir fişindeki adet ve limit fiyat kutuları Türkçe yazımı ABACUS `money.parseNumber` ile okur ("1.250", "12,35"). Gerçek akışı, limit emrin gerçekleşmesini ve hesabı proje bağlar; mumlar `candles[dönem]` ile verilir (gün içi dönemler dakikalık, diğerleri günlük). Yükseliş yeşil, düşüş kırmızıdır ve ok ile işaret de taşır (renk tek ipucu değildir); amber yok. Arc Pro market-terminal'den esinlenildi (tarif: docs/tarifler/market-terminal.md). | `npx shadcn@latest add @snn-ui/market-terminal` |
| `journey-flow` | Yolculuk akışı | Blok: kullanıcıların bir sürecin aşamaları boyunca (ziyaret, hesap, kurulum, ilk hafta, plan) nereye gittiğini akış şemasıyla gösterir; her aşamada devam edenler kaynağın renginde, düşenler gri ayrı kollar olarak görünür. Başlıkta dönen rakamlı toplam ("16.965") ve alt cümle, kanal seçici ("Tüm kullanıcılar", kanallar) vardır; kanal değişince şeritler yeni değere akar ve "16.965 ziyaret, 1.018 ücretli plan" duyurulur. Adıma ya da şeride gelince o grup baştan sona vurgulanır; adıma basınca (Enter) yan panel adımın sayısını, ilk aşamadaki payını, nereden geldiğini ve nereye gittiğini yazar, Esc seçimi kaldırır; panelde "En büyük düşüşler" listesi durur. "Akış tablosu" anahtarı aynı sayıları tablo olarak açar. Yükleniyor, hata ve kanal verisi yok durumları ile dar kap düzeni vardır. Sayılar ABACUS biçimindedir ("16.965"); paylar `money.percent` ile ("%6,0"). Düşen kolları `muted: true` düğümle verin (gri çizilir); seçili kanalın akışını, kanal listesini ve alt cümleyi (ABACUS `date.monthName`) proje verir, kanalın verisi yoksa `data` null olur ("Bu kanal için veri yok"). Beş aşama ve yaklaşık on üç düğüm için tasarlanmıştır; sütunlar akıştan kendiliğinden bulunur. Şema `sankey-flow` ile çizilir (bu iş için `selectedId`, `onSelectedChange`, `bare` ve düğümde `muted` eklendi). Arc Pro journey-flow'dan esinlenildi (tarif: docs/tarifler/journey-flow.md). | `npx shadcn@latest add @snn-ui/journey-flow` |
| `invoice-studio` | Fatura ve teklif stüdyosu | Blok: kalemli bir fatura ya da teklif taslağını ekranda düzenletir. Üstte "Fatura" ya da "Teklif" başlığı ve gönderen / alıcı blokları; kalem tablosunda açıklama, adet, birim fiyat (₺ simgeli) ve satır tutarı vardır. Kalem eklenir (yeni satırın açıklamasına odaklanır) ve silinir (satır yükseklikle açılıp kapanır); adet ve birim fiyat değiştikçe ara toplam, KDV ve ödenecek toplam anında yeniden hesaplanır ve rakamlar akarak değişir. Virgül ondalık ayracıdır, binlik ayracı yazarken kendiliğinden konur. "Taslağı kaydet" açıklaması boş kalemi işaretler ("Her kalem için açıklama girin"), kayıt sürerken "Kaydediliyor…", sonunda "Taslak kaydedildi" ya da "Kaydedilemedi" yazar. Boş durum, dar kap (kalem kartı) ve ekran okuyucu için canlı toplam vardır. Resmî e-fatura ya da e-arşiv üretimi ve gönderimi kapsam dışıdır. Para hesabı kayan noktayla değil kuruş tamsayısıyla yapılır: her satır `math.mul` ile çarpılıp `money.toMinor` ile kuruşa yuvarlanır, KDV ara toplam üzerinden bir kez `math.round` ile hesaplanır; toplamlar ABACUS biçimindedir ("₺4.801,80", "KDV · %20"). Alanlara yazılan sayı `money.formatGroupedInput` (Türkçe ayraç) ile biçimlenir ve `money.parseNumber` ile okunur; adet ondalık olabilir (negatif yok), birim fiyat en çok iki ondalıktır. KDV oranını proje ayarından verir (`vatRate`). **Ekrandaki toplam yalnızca gösterimdir: kayıtta ve gerçek belgede toplam sunucuda yeniden hesaplanır, `onSave`'e giden veri taslak sayılır.** `onSave` reddederse "Kaydedilemedi" yazılır ve yeniden denenir. Arc Pro invoice-studio'dan esinlenildi (tarif: docs/tarifler/invoice-studio.md). | `npx shadcn@latest add @snn-ui/invoice-studio` |
| `pricing-calculator` | Fiyat hesaplayıcı | Blok: koltuk (kullanıcı) başına fiyatlanan bir ürün için ekip büyüklüğünü sabit duraklı kaydırıcıyla (ve eksi/artı düğmeleriyle) seçtirir; ortadaki büyük koltuk sayısı döner. Aylık / yıllık anahtarı ve üç plan kartı seçime göre canlı güncellenir: koltuk başı fiyat (döner), dönemlik toplam, hacim indirimi ("koltuk başı ₺30,00 daha az") ve koltuğa bağlı özellikler (yükseklikle açılıp kapanır). "Önerilen" rozeti ve seçim çerçevesi ekip büyüklüğüne en uygun plana kayar. En küçük (sınırlı) plan koltuk üst sınırını aşınca fiyat yerine "Bu plan en çok 10 koltuğa uygun. Siz 20 koltuk seçtiniz." ve "10 koltuğa dön" düğmesi gösterir. Seçim özeti toplamı, yıllıkta tasarrufu ("Tasarruf ettiğiniz: ₺…/yıl") ve "Denemeyi başlat" düğmesini taşır. Yükleniyor, deneme başlatma hatası ("Başlatılamadı") ve dar kap durumları vardır. Fiyat tablosu bileşende sabit değildir, uygulamadan gelir: plan başına hacim kademeleri (`tiers`, koltuk başı aylık TRY), `maxSeats` (sınırlı plan), `fitsSeats` (önerilen aralık) ve koltuğa bağlı özellikler. Para hesabı kuruş tamsayısıyla yapılır (`money.toMinor`, `math.mul`, `math.round`): toplam = koltuk başı aylık fiyat × koltuk × ay sayısı, yıllıkta indirim `yearlyDiscount` yüzdesiyle koltuk başı fiyata uygulanır. Fiyatlar ABACUS biçimindedir ("₺219,00"), tasarruf rozeti `money.percent` ("%20"), koltuk sayısı `money.fmtDecimalGrouped`. Kaydırıcı yerel aralık girdisidir (değer metni "20 koltuk"); dönem anahtarı radyo grubudur. Denemeyi gerçekten başlatmayı proje bağlar. Arc Pro pricing-calculator'dan esinlenildi (tarif: docs/tarifler/pricing-calculator.md). | `npx shadcn@latest add @snn-ui/pricing-calculator` |
| `usage-pricing` | Kullanıma göre fiyat hesaplayıcı | Blok: fiyatı koltuk sayısı ve ölçülen kullanıma (aylık istek gibi) bağlı bir ürün için "faturanız ne kadar olur" tahminini verir. İki kaydırıcı (koltuk, kullanım; izinde plan geçiş noktaları adlı işaretli) ve aylık / yıllık anahtarı vardır (yıllıkta tasarruf tutarı). Bileşen seçime en uygun planı kendisi bulur (koltuk × fiyat + aşım × milyon başı fiyat toplamı en düşük plan): plan adı harf harf döner, aylık tutar döner, özellikler bir önceki plana göre "yeni" işaretiyle listelenir ve değişim canlı bölgede duyurulur. Döküm maliyeti kalem kalem yazar: koltuk (sayı × birim fiyat = tutar), kullanım ("Dahil" ya da "2,5 Mn aşım × ₺70,00 / Mn = tutar") ve "Tahmini toplam, vergi öncesi". Hiçbir plana sığmayan seçimde özel teklif yönlendirmesi, ayrıca yükleniyor, deneme başlatma hatası ve dar kap durumları vardır. Fiyat tablosu uygulamadan gelir: plan başına koltuk fiyatı, dahil kullanım, milyon başı aşım fiyatı ve koltuk sınırı. Para hesabı kuruş tamsayısıyla yapılır (`money.toMinor`, `math.mul`, `math.round`); yıllıkta aylık toplam × 12 × (1 − indirim). Tutarlar ABACUS biçimindedir ("₺4.482,00"), kısa kullanım "15Mn" (tam "15.000.000" kaydırıcının değer metninde), aşım milyon cinsinden ("2,5 Mn"), tasarruf rozeti `money.percent` ("%20"). Kaydırıcılar yerel aralık girdisidir (oklar, Home/End, PageUp/PageDown). Denemeyi gerçekten başlatmayı proje bağlar. Arc Pro usage-pricing'den esinlenildi (tarif: docs/tarifler/usage-pricing.md). | `npx shadcn@latest add @snn-ui/usage-pricing` |
| `product-listing` | Ürün listeleme sayfası | Blok: bir koleksiyondaki ürünleri kart ızgarası olarak gösterir. Başlıkta ürün sayısı ve dönen adetli sepet simgesi; yanda süzgeç paneli (çift başlı fiyat aralığı, renk örnekleri, beden düğmeleri, "Yalnız stokta" anahtarı, "Süzgeçleri temizle"), üstte sıralama menüsü (Öne çıkanlar, En yeniler, Fiyat: artan / azalan). Süzülen ya da sıralanan kartlar yay hareketiyle yer değiştirir. Karta gelince ikinci fotoğraf soluk geçişle gelir ve "Hızlı ekle" hapı yükselir; çok bedenli üründe beden satırı açılır, seçince "Eklendi" olur ve eklemeyi kibar canlı bölge duyurur. Tükenen üründe düğme kapalıdır. Dar kapta (640 px altı) süzgeçler "Süzgeçler (n)" düğmesiyle soldan açılan sayfaya geçer. Sonuç yok ("Bu süzgeçlere uyan ürün yok."), yükleniyor ve dokunmatik durumları vardır. Fiyatlar TRY ve ABACUS biçimindedir ("₺1.250", kuruş varsa "₺1.250,50"); fiyat aralığı uçları ürünlerden alınıp 10'a yuvarlanır, sürgüler 10 ₺ adımlıdır; ürün sayısı ve sepet adedi `money.fmtDecimalGrouped` ile. Süzme ve sıralama bellekte yapılır (renk ve beden için "seçilenlerden herhangi biri" kuralı); çok büyük kataloglarda sunucuda yapıp sonucu `products` olarak verin, süzgeç durumunu adrese yazmak için `onChange` kullanın. Fotoğraf `src` verilmezse kendi yer tutucusu çizilir, alt metin zorunludur. Sepetin kendisi, ödeme ve ürün sayfası kapsam dışıdır. "Hareketi azalt" açıkken kartlar yer değiştirmez, yalnız solar. Arc Pro product-listing'den esinlenildi (tarif: docs/tarifler/product-listing.md). | `npx shadcn@latest add @snn-ui/product-listing` |
| `product-detail` | Ürün sayfası | Blok: tek bir ürünün sayfası. Yol izi, sürüklenebilir fotoğraf galerisi ("1 / 4" sayacı, küçük resim şeridi, sol/sağ ok), ürün adı, dönen fiyat, yıldız ortalaması, kaplama örnekleri (radyo grubu) ve her boyun adı ile fiyatı. Kaplama değişince fotoğraflar yerinde soluk geçişle o kaplamanınkilerle değişir; seçili boy o kaplamada tükenmişse seçim kalkar. Adet düzenleyici ve "Sepete ekle · ₺2.400,00" düğmesi (tutar adetle çarpılır; Ekleniyor → Sepete eklendi, başarısızsa Tekrar dene). Tükenen kaplama ve boy seçilebilir kalır ama düğme "Gelince haber ver" olur. Teslimat vaatleri, yorum özeti (ortalama ve 5'ten 1'e dolan yıldız çubukları) ve açılır ayrıntı bölümleri (ilki açık), favori kalbi. Yükleniyor ve dar kap (alt alta, dört küçük resim) durumları vardır. Fiyatlar TRY ve ABACUS biçimindedir (fiyat "₺3.190,50", düğmede iki ondalıkla "₺6.381,00"); tutar kuruş tamsayısıyla hesaplanır (fiyat × adet, `math.mul`). Yıldız ortalaması bir ondalıkla ("4,6"), yorum ve yıldız sayıları `money.fmtDecimalGrouped` ile. Kaplamaya göre fotoğraf listesi, boy fiyatları ve boyun tükendiği kaplamalar (`soldOutIn`) uygulamadan gelir; fotoğraf `src` verilmezse kendi yer tutucusu çizilir, alt metin zorunludur. Sepete ekleme isteği (`onAddToCart`, reddederse "Tekrar dene") ve haber verme kaydı (`onNotify`) uygulamanın işidir; ekrandaki tutar gösterimdir. Çok seçenekli canlı fiyatlı yapılandırıcı ve ürün listesi kapsam dışıdır. "Hareketi azalt" açıkken galeri atlar, sürüklenmez. Arc Pro product-detail'den esinlenildi (tarif: docs/tarifler/product-detail.md). | `npx shadcn@latest add @snn-ui/product-detail` |
| `cart-drawer` | Sepet çekmecesi | Blok: ürün ızgarası ve yandan açılan sepet çekmecesi. "Sepete ekle" denince ürün fotoğrafı yay çizerek sepet düğmesine uçar, rozet sayısı uçuş bitince artar. Sepet düğmesi çekmeceyi açar (odak kapat düğmesine gider, arka plan kapalı, Escape kapatır ve odağı geri verir). Çekmecede satırlar (küçük fotoğraf, ad, birim fiyat, satır tutarı, adet düzenleyici; adet 1 iken eksi "Kaldır" olur), sola kaydırarak silme (her kaydırmanın düğme karşılığı var), ücretsiz kargo çubuğu ("Ücretsiz kargo için ₺… kaldı" / "Ücretsiz kargo kazandınız"), kupon alanı (geçerliyse çipe döner, geçersizse alan uyarır), ara toplam, kargo, kupon indirimi, dönen genel toplam ve "Siparişi tamamla" düğmesi bulunur. Sipariş sürerken çekmece kilitlenir, sonra düğme onay yuvarlağına ve çizilen tike dönüşür, örnek makbuz gösterilir; başarısızsa "Tekrar dene" yazar. Boş sepet ve dar kap durumları vardır; ekleme, silme, kupon ve sipariş sonucu kibar canlı bölgede duyurulur. Fiyatlar TRY ve ABACUS biçimindedir (kartta "₺649,90", toplamlarda her zaman iki ondalık "₺1.234,50"); ara toplam, kargo, indirim ve genel toplam kuruş tamsayısıyla hesaplanır (`math.mul`, `math.add`, `money.toMinor`), genel toplam dönen rakamdır, ekran okuyucuya tek cümle okunur. Kargo ücreti, ücretsiz kargo eşiği ve kupon kuralları uygulamadan gelir; **kupon doğrulaması sunucuda yapılır** (`onApplyCoupon` kuponu ya da null döner, bileşen yalnız sonucu gösterir ve indirimi ara toplam üzerinden hesaplar). **Bileşen gerçek ödeme yapmaz:** `onCheckout` siparişi uygulamaya iletir, ekrandaki toplam gösterimdir ve sunucuda yeniden hesaplanmalıdır; kart numarası, son kullanma ve CVC alanı bu blokta yoktur (ödeme sayfasında gerekirse `giris-alanlari-standardi.md` ile ABACUS `mask` / `validate`). Sepeti kalıcı saklamak ve vergi uygulamanın işidir. "Hareketi azalt" açıkken uçuş, sıçrama ve satır sürükleme kapalıdır, çekmece kayma yerine solar. Arc Pro cart-drawer'dan esinlenildi (tarif: docs/tarifler/cart-drawer.md). | `npx shadcn@latest add @snn-ui/cart-drawer` |
| `checkout-summary` | Sipariş özeti | Blok: tek ürünlü bir siparişin ödemeden önceki son özeti. Küçük görsel kutulu ürün satırı (ad tek satır, fiyat ve dönem notu), kupon alanı (kod yazılıp Enter ya da "Uygula"; geçerliyse alan çipe döner ve indirim satırı yükseklikle açılır, geçersizse alan yatay sallanır ve "Bu kupon geçerli değil." çıkar; çipin kaldır düğmesi kodu geri alır ve odağı alana verir), otomatik indirim satırları (eksi tutar), vergi satırı (oran verilirse hesaplanır, verilmezse "ödemede hesaplanır"), dönen genel toplam ve "₺… öde" düğmesi. Düğme boşta → İşleniyor (dönen halka) → Ödendi arasında yükselerek ve bulanıkla değişir, hata olursa "Tekrar dene" ve satır içi hata yazar; ödeme kapalıysa düğme görünür ama basılamaz. Altında kilit simgeli "Şifreli ödeme" notu ve isteğe bağlı küçük yazı vardır. Kart en çok 440 px, daha dar kapta doldurur. Tutarlar TRY ve ABACUS biçimindedir ("₺4.780,80", toplam satırında iki ondalık); hesap kuruş tamsayısıyla yapılır (`math.mul`, `math.round`, `money.toMinor`): otomatik indirimler ve kupon fiyattan düşülür, ara toplam sıfırın altına inmez, vergi indirimli ara toplam üzerinden hesaplanıp eklenir, vergi oranı `money.percent` ile yazılır ("Vergi · %20"). Toplam dönen rakamdır, ekran okuyucuya tek cümle okunur. **Kupon doğrulaması sunucuda yapılır:** `onApplyCoupon` kuponu ya da null döner; bileşen istemcide karar vermez, yalnız sonucu gösterir. **Bileşen gerçek ödeme almaz:** `onPay` ödemeyi başlatır (ya da barındırılan ödeme sayfasına yönlendirir); ekrandaki toplam gösterimdir ve sunucuda yeniden hesaplanmalıdır. Kart numarası, son kullanma ve CVC alanı bu blokta yoktur (eklenirse `giris-alanlari-standardi.md` ve ABACUS `mask` / `validate`). Çok ürünlü sepet için `cart-drawer`, adres ve kart toplayan çok adımlı ödeme kapsam dışıdır. "Hareketi azalt" açıkken sallanma ve yükselme yoktur, satırlar anında belirir. Arc Pro checkout-summary'den esinlenildi (tarif: docs/tarifler/checkout-summary.md). | `npx shadcn@latest add @snn-ui/checkout-summary` |
| `wallet-card` | Hesap kartı | Blok: küçük bir hesap görünümü. Üstte hesap değiştirici (Ana hesap / Yedek hesap) ve bakiyeyi gizle/göster düğmesi; büyük dönen bakiye, "bu ay" değişimi, dönem seçici (1 hafta, 1 ay, 1 yıl) ve bakiye geçmişi grafiği (fareyle gezince nokta okunur; dokunmatik ve klavyede grafik üzerindeki aralık girdisiyle oklar noktaları dolaşır). Eylem düğmeleri (Gönder, Yatır, Çevir, Al) birinin altında kendi panelini açar: ayraçlı tutar kutusu (virgül ondalık), doğrulama iletisi ("Tutar bakiyenizi aşıyor.", "Tutarı girin.") ve tutarı taşıyan onay düğmesi ("₺1.250,00 gönder"). Onaylanınca bakiye yeni değere sayarak gider, yeni hareket satırı yerinde açılır, odak eylem düğmesine döner. Son hareketler üç satırdır; arama alanı bellekte süzer, "Tümünü gör" hepsini açar. Gizliyken ekran okuyucu "Bakiye gizli" der. Boş geçmiş, sonuç yok, yükleniyor ve dar kap durumları vardır. Tutarlar TRY ve ABACUS biçimindedir ("₺128.450,50", işaretli "+₺12.300,00 bu ay"); tutar kutusu `money.formatGroupedInput` ile yazılırken biçimlenir ve `money.parseNumber` ile okunur, en çok iki ondalık; tutar kuruş tamsayısına (`money.toMinor`) çevrilip onay düğmesine yazılır. Doğrulama sıfırdan büyük, iki ondalık ve (gönder, çevir için) bakiyeyi aşmama kurallarıdır. Tarihler `date.format`, hareket araması `text.lower`. **Bileşen gerçek para hareketi yapmaz ve bakiyeyi kendisi değiştirmez:** onayda `onSubmit` hesap, işlem ve kuruş tutarıyla çağrılır; defteri uygulama tutar, güncellenmiş `accounts` gelince bakiye yeni değere sayar. İstemcideki doğrulama kolaylıktır; tutar ve bakiye sunucuda yeniden denetlenmelidir. IBAN ya da hesap numarası alanı yoktur (eklenirse ABACUS `mask` / `validate`). Kur çevirme, defter, fatura ve abonelik kapsam dışıdır; kart destesi için `wallet-stack`. "Hareketi azalt" açıkken yerleşim animasyonu ve bulanıklık yoktur. Arc Pro wallet-card'dan esinlenildi (tarif: docs/tarifler/wallet-card.md). | `npx shadcn@latest add @snn-ui/wallet-card` |
| `payment-flow` | Ödeme akışı şeması | Blok: kartlı bir ödemenin nasıl işlediğini hareketli bir şema olarak anlatır. Ödeme noktasından işlemciye, kart ağına ve karta veren bankaya giden tutar bir çip olarak yolda ilerler; her durak o an yaptığı işi yazar ("Risk denetleniyor", "Bankaya yönlendirildi", "Onaylandı"). Onay çipi geri döner; ikinci bir hatta takas oldu, işlemcinin komisyonu düşer (brüt tutardan net tutara geçer) ve net tutar satıcı bakiyesine ödenir, bakiye döngüden döngüye artar. Altta adım satırı vardır: yetkilendirme süresi sayar, takas aşaması dolar, takas zamanı yazılır. İlerleyen yol vurgu renginde yanar, onayla birlikte başarı rengine döner. Fareyi duraklara getirince açıklama çıkar ve hikâye yavaşlar; hız ve duraklatma yayla yumuşar. Ekran dışında ve sekme gizliyken durur. Geniş kapta yatay, 700 px altında dikey çizilir. Şema tek bir görsel olarak sesli anlatılır; "Hareketi azalt" açıkken komisyon düşüldükten hemen sonrasının tek durağan karesi gösterilir. Bu bir anlatım çizimidir: giriş alanı yoktur, gerçek ödeme almaz. Tutar, komisyon ve bakiye bileşende sabit değil, **uygulamadan** verilir; şemanın doğruyu söylemesi için uygulamanın gerçek fiyatlandırmasıyla eşleştirin. Tutarlar TRY ve ABACUS biçimindedir ("₺2.400,00"), net tutar = tutar − komisyon (`math.sub`), bakiye `math.add` ve `math.mul` ile büyür, yetkilendirme süresi iki ondalıkla "1,84 sn". Durak adları, açıklamaları ve takas zamanı (`settlement`) değiştirilebilir; işlemci ve ağ işaretleri yerine kendi markalarınızı koyun (şemadaki simgeler yer tutucudur). Çizim tek bir zaman fonksiyonudur: kare başına React yeniden çizilmez, yalnız değişen metin ve dönüşümler yazılır. **Kart numarası, son kullanma, CVC gibi giriş alanı yoktur ve bileşen gerçek ödeme yapmaz**; kart girişi gereken ekranda `giris-alanlari-standardi.md` ve ABACUS `mask` / `validate` kullanılır. Şema denetim değildir, durakları sekme sırasına girmez; açıklama yalnız fareyle görünür, tam anlatım sesli etikettedir. Gerçek ödeme formu ve olay yayılımı anlatımı kapsam dışıdır. Arc Pro payment-flow'dan esinlenildi (tarif: docs/tarifler/payment-flow.md). | `npx shadcn@latest add @snn-ui/payment-flow` |
| `hero-signup` | Karşılama ve e-posta kaydı | Blok: sayfanın ilk ekranını dolduran, tek e-posta alanı olan karşılama bölümü. Arka planda vurgu renginden türetilmiş yavaş akan bir renk geçişi, başlıkta kelime kelime yükselen yazı, ardından alt cümle, alan ve sosyal kanıt gelir. Alan yazılırken hata göstermez (boşluk atılır, harfler küçülür); alandan çıkınca ya da gönderince belirli iletiler çıkar ("Adreste @ işareti eksik.", "Alan adı tamamlanmamış"). Bilinen bir yazım hatası ("gmial.com") için "Şunu mu demek istediniz: …?" önerisi tek tıkla uygulanır. Enter ya da "Listeye katıl": düğme yerinde dönen halkaya geçer (boyutu değişmez, ikinci basış yok sayılır); başarıda form onaya dönüşür, "Listede 1.285. sıradasınız" yazar (sıra rakam rakam döner), odak onaya gider, "E-postayı değiştir" forma ve alana döner. Hata alt notta "Yerinizi kaydedemedik. Tekrar dene" der ve alan hafif sallanır. Altta en çok beş portre ve dönen "1.285 kişi listede" sayısı bulunur. Çok dar kapta düğme etiketi "Katıl" olur. Gönderiliyor, başarı ve hata kibar durum bölgesinde duyurulur. E-posta alanı `giris-alanlari-standardi.md` kuralıdır: yazarken boşluk atılır ve ABACUS `text.toAsciiLower` ile küçük harfe çevrilir (Türkçe büyük I küçük ı olmasın), kaydederken ABACUS `validate.email` çağrılır; ilk adres yazılırken hata gösterilmez. Alan `type="email"`, `inputMode="email"`, `autoComplete="email"` ve `enterKeyHint="send"` taşır, yazı 16 px altına inmez. Sıra ve kişi sayısı `money.fmtDecimalGrouped` ile yazılır ("1.285") ve dönen rakamdır. Kaydı saklayan servisi `onSubmit` bağlar (sırayı döndürür; reddederse hata gösterilir); bileşen kendi başına hiçbir şey kaydetmez. `onStatusChange` dört durumu bildirir (idle, sending, error, done). Parolalı kayıt, SSO, onay kutuları ve sayfa altı bülten kutusu kapsam dışıdır. Arka plan ekran dışında ve sekme gizliyken durur; "hareketi azalt" açıkken tek durağan kare, yükselme ve dönme yoktur, durumlar anında değişir. Portreler adlardan baş harfli avatarlardır. Arc Pro hero-signup'tan esinlenildi (tarif: docs/tarifler/hero-signup.md). | `npx shadcn@latest add @snn-ui/hero-signup` |
| `scroll-story` | Kaydırmalı ürün anlatısı | Blok: bir ürünü dört adım gibi kısa bir akışta anlatan tanıtım bölümü. Kendi içinde kayan, odaklanabilir ve etiketli bir metin alanında adım metinleri akar; yanda (dar kapta üstte) sabit duran ürün sahnesi kaydırdıkça adımdan adıma değişir. Üstteki adım sekmeleri ("Adım 2/4 · …") ilerleme gösterir: sekme, kaydırma o adıma yaklaştıkça dolar. Sekmeye basınca ya da sol/sağ (Home/End) ok tuşuna basınca ilgili adımın metnine kayar. Etkin adım işaretlenir; sahne durumu ("Gelen kutusunda yeni mesaj var") kibar canlı bölgede duyurulur. Son adımın altında isteğe bağlı "Bağlantıyı kopyala" ve "Kanala gönder" düğmeleri bulunur; sonuç ("Bağlantı kopyalandı", "Gönderildi") duyurulur. Sahneyi `renderStage` ile siz çizersiniz (adım konumu yayla yumuşayan bir hareket değeridir), kaydırma konumu doğrudan ilerleme değerini sürer. Dar kapta (700 px altı) sahne metnin üstünde sabit kalır. Sahnenin içeriği (örnek veri, listeler, çizgi grafik) uygulamaya özgüdür ve `renderStage` ile verilir; sahne ekran okuyucudan gizlidir, anlam adım başlığında, metninde ve `status` duyurusundadır. `renderStage` bağlamındaki `position` bir `MotionValue`dur: 0 ilk adım, 1 ikinci adım... (ondalık, adımlar arasını yumuşak geçer); `useTransform` ile sahne öğelerine bağlayın. Kaydırma okuması pasif dinleyiciyle ve çizim karesi başına en çok bir kez yapılır; hedef kaydırma sırasında değişirse yay hızı korur. Adım numaraları ABACUS biçimindedir ("Adım 2/4"); sahnedeki adet ve yüzdeyi `money.fmtDecimalGrouped` ve `money.percent` ile yazın. Kopyalama ve gönderme sonucu dışa bağlıdır (`actions`), bileşen kendisi hiçbir şeyi paylaşmaz. Tek paragraf kaydırma vurgusu, tek önce/sonra anahtarı ve statik özellik görseli kapsam dışıdır. "Hareketi azalt" açıkken adımlara yumuşak kayma yerine atlanır ve yaylar kapalıdır (sahne doğrudan değere gider). Arc Pro scroll-story'den esinlenildi (tarif: docs/tarifler/scroll-story.md). | `npx shadcn@latest add @snn-ui/scroll-story` |
| `spotlight-grid` | Özellik ızgarası | Blok: dört kadar özelliği kart ızgarasında gösteren tanıtım bölümü. Bölüm başlığı ve alt cümlesi altında kartlar durur; her kart canlı bir önizleme, başlık ve açıklama taşır, başlık tüm kartı kaplayan bir düğmedir. Fareyi kartlar üstünde gezdirince kenarlarda yumuşak bir ışık imleci yaylarla izler (yalnız fare) ve kartın önizlemesi oynar (ızgara ilk göründüğünde de bir kez oynar). Karta basınca (ya da Enter / Boşluk) kart yerinde büyüyerek çalışan bir ayrıntı görünümüne dönüşür: odak "Kapat" düğmesine gider, arkadaki ızgara etkileşime kapanır, Escape kapatır ve odağı açan karta geri verir. Kap boyutuna göre 1 / 2 / 3 sütun (geniş kart iki sütun kaplar). Ayrıntı içindeki seçici, anahtar ve onay düğmesini siz çizersiniz; sonuçlar kibar canlı bölgede duyurulur. Kartların önizlemesi (`preview`) ve ayrıntısı (`detail`) uygulamaya özgüdür, siz çizersiniz; önizleme `{ active, reduced }` alır (kart üzerine gelinmiş ya da odaklanmışsa, ya da ızgara ilk kez göründüğünde `active` true olur; "hareketi azalt" açıkken önizleme son halini gösterir) ve ekran okuyucudan gizlidir, anlam başlıkta ve açıklamadadır. Ayrıntıya `close` ve `announce` verilir. Ayrıntı içindeki sayıları ABACUS ile yazın (`money.fmtDecimalGrouped` adet, `money.percent` yüzde, gecikme için `AnimatedCounter`). **Dağıtım, anahtar ve onay gerçek sistemlere bağlanmaz, benzetimdir;** gerçek işlemi ayrıntının içinde uygulama bağlar. Kart düğmeleri `aria-expanded` ve `aria-controls` taşır, açık ayrıntı etiketli bölgedir ve arkası `inert`tir. Dokunmatikte ışık ve üzerine gelme önizlemeleri yoktur, kart dokununca açılır. Müşteri hikâyesi galerisi ve tek açılır kart kapsam dışıdır. "Hareketi azalt" açıkken yerleşim dönüşümü, imleç ışığı ve zamanlayıcılar kapalıdır; içerik solar. Arc Pro spotlight-grid'den esinlenildi (tarif: docs/tarifler/spotlight-grid.md). | `npx shadcn@latest add @snn-ui/spotlight-grid` |
| `product-gallery` | Ürün fotoğraf galerisi | Blok: ürün sayfası için fotoğraf galerisi. Büyük fotoğraf üstünde fareyle büyüteç merceği (yaylarla imleci izler, "Büyüteç" düğmesiyle kapanır), dokunmatikte parmağı bire bir izleyen kaydırma, nokta göstergesi ve büyüt simgesi; küçük resim şeridi (seçili halka kayarak değişir). Fotoğrafa basınca ya da Enter'a basınca tam ekran görüntüleyici fotoğrafın kendi yerinden büyür: sol/sağ ok, +/-/0, çift tıklama, iki parmak ve Ctrl+tekerlek yakınlaştırır, aşağı çekmek ya da Escape kapatır (Escape önce uzaklaştırır), odak ana fotoğrafa döner, "2 / 12" sayacı duyurulur. Renk seçici (örnekler ve seçili renk adı) değişince tüm fotoğraflar bulanıktan netleşerek yeni rengin fotoğraflarına geçer; seçili beden o renkte tükenmişse seçim kalkar ve dışarı bildirilir. Beden düğmelerinde tükenenler çizgili, seçilemez ve metinle belirtilir ("Orman için M tükendi"); oklar tükenenleri atlar. Beden seçilmediyse "Beden seçin" ipucu çıkar. Üst ve alt alan uygulamaya aittir. Dar kapta (680 px altı) üst üste dizilir. Her fotoğraf gerçek `width` ve `height` ile ve anlamlı bir `alt` ile verilir (görüntüleyici oranı ve uçuşu bunlardan hesaplar); `src` verilmezse kendi yer tutucusu çizilir. Küçük resim ve büyüteç kopyaları ekran okuyucu için süstür. Fotoğraf sırası "2 / 12" ve sayılar ABACUS biçimindedir (`money.fmtDecimalGrouped`); büyütme katı `magnification` ile ayarlanır (varsayılan 2,5). Fiyat, sepete ekleme ve yorumlar bu bloğun içinde değildir: `header` ve `footer` ile uygulama koyar (fiyat için TRY ve `money.formatMajor`). Kart ya da ödeme alanı yoktur. Renk örnekleri radyo grubu, küçük resim şeridi sekme listesi, beden radyo grubudur (gezen odak, Home/End); görüntüleyici kipli iletişim kutusudur (odak tuzağı, sayfa kaydırması kilidi). Dokunmatikte mercek yoktur. "Hareketi azalt" açıkken şerit, mercek ve yakınlaştırma anidir, görüntüleyici uçuş yerine solar. Seçeneksiz fotoğraf albümü için `lightbox-gallery`. Arc Pro product-gallery'den esinlenildi (tarif: docs/tarifler/product-gallery.md). | `npx shadcn@latest add @snn-ui/product-gallery` |
| `lightbox-gallery` | Fotoğraf duvarı | Blok: fotoğrafları oranlarını koruyarak sütunlu bir "duvar" (masonry) düzeninde gösterir. Sütun sayısı kabın genişliğinden hesaplanır (sütun en az 180 piksel, en az iki sütun); fotoğraflar o ana kadar en kısa sütuna dağıtılır. Bir fotoğrafa basınca (ya da Enter / Boşluk) fotoğraf kendi yerinden büyüyerek tam ekran görüntüleyiciye açılır: arka plan kararır, sol/sağ ok ve yana kaydırma önceki/sonraki fotoğrafa götürür, +/-/0, çift tıklama, iki parmak ya da Ctrl+tekerlek yakınlaştırır, yakın planda sürüklenir, aşağı çekmek (direnç hissiyle) ya da Escape kapatır. Görüntüleyicide başlık ve alt yazı, "2 / 12" sayacı, yakınlaştırma düğmesi ve küçük resim şeridi vardır; kapanınca fotoğraf o an gösterilen fotoğrafın yuvasına geri uçar ve odak duvardaki o fotoğrafa döner. Fotoğraf düğmeleri "Kıyıda sabah aç, 1 / 12 fotoğraf" diye okunur. Yükleniyor iskeleti ve dar kap durumları vardır. Her fotoğraf kaynak (`src`), gerçek `width` ve `height` ve anlamlı bir `alt` ile verilir: duvar oranı, uçuş ve yakınlaştırma bunlardan hesaplanır; `src` yoksa kendi yer tutucusu çizilir. İsteğe bağlı `title` ve `caption` görüntüleyicide iki satır alt yazıdır. Sayaç "2 / 12" ve "12 fotoğraf" `money.fmtDecimalGrouped` ile yazılır. Çok büyük koleksiyonlar sayfalanır, duvar sanallaştırılmaz. Görüntüleyici kipli iletişim kutusudur (odak tuzağı, sayfa kaydırması kilidi, odak kapat düğmesinde başlar); yalnız geçerli slayt ekran okuyucuya açıktır; 640 px altında yan oklar gizlenir, kaydırma ve küçük resim şeridiyle gezilir. Aynı boyda kare ızgara ve yoğunluk değiştirme (`photo-grid`), yatay döner şerit ve rastgele içerik kapsam dışıdır. "Hareketi azalt" açıkken uçuş ve yaylar yoktur, görüntüleyici solar, yakınlaştırma ve kaydırma anidir. Arc Pro lightbox-gallery'den esinlenildi (tarif: docs/tarifler/lightbox-gallery.md). | `npx shadcn@latest add @snn-ui/lightbox-gallery` |
| `photo-grid` | Fotoğraf ızgarası | Blok: bir albümü eş boyutlu kare hücrelerle gösterir. Üst çubukta albüm adı, dönen fotoğraf sayısı, dönen sütun sayısı ve yakınlaştır / uzaklaştır düğmeleri bulunur. İki parmakla sıkıştırınca (ya da Ctrl+tekerlek, düğmeler, `+` / `-`) sütun sayısı yoğun, orta, geniş arasında (beş, üç, iki) değişir: sıkıştırma sırasında ızgara canlı ölçeklenir, bırakınca en yakın seviyeye oturur ve parmakların altındaki fotoğraf ekranda yerinde kalır. Izgarada oklar odağı gezdirir (PageUp / PageDown üç satır, Home / End ilk-son). Bir hücreye basınca (ya da Enter / Boşluk) tam ekran görüntüleyici o hücreden büyür; görüntüleyicide başlık ve ayrıntı satırı, "2 / 30" sayacı, favori kalbi, önceki/sonraki, kapat ve alttaki küçük resim şeridi vardır; sol/sağ ok, Home/End, yana kaydırma gezdirir, aşağı çekmek ya da Escape kapatır. Kalbe basınca favori açılır/kapanır (hücrede küçük kalp belirir, adı ", favori" ile okunur) ve değişim dışarı bildirilir. Yükleniyor iskeleti ve dar kap durumları vardır. Her fotoğraf kaynak (`src`), gerçek `width` ve `height`, anlamlı `alt`, isteğe bağlı `title` ve `caption` (tarih gibi) ile verilir; `src` yoksa kendi yer tutucusu çizilir. Fotoğraf ve sütun sayısı `money.fmtDecimalGrouped` ve `AnimatedCounter` ile yazılır, sayaç "2 / 30" ABACUS biçimindedir. Sütun sayısı kırılım noktasından değil yakınlaştırma seviyelerinden gelir (varsayılan beş, üç, iki); kap en az 320 piksel ister. Favorilerin saklanması uygulamanın işidir (`onFavoriteChange`); kapalı albümde favori hücrenin adına ", favori" eklenir. Büyük kitaplıklar sayfalanır, ızgara sanallaştırılır değildir; küçük resimler hafif kaynakla verilmelidir. Oranı koruyan duvar için `lightbox-gallery`; kısa slayt ve önce/sonra karşılaştırma kapsam dışıdır. Yakınlaştırma düğmeleri uçlarda kapanır (tarifteki `aria-pressed` yerine). "Hareketi azalt" açıkken sıkıştırma önizlemesi ve yerleşim yolculuğu yoktur, solmalar kalır. Arc Pro photo-grid'den esinlenildi (tarif: docs/tarifler/photo-grid.md). | `npx shadcn@latest add @snn-ui/photo-grid` |
| `testimonial-stage` | Görüş sahnesi | Blok: birkaç kişinin görüşünü, kişinin portresi öne çıkacak biçimde gösterir. Bölüm başlığının altında kişi sekmeleri (küçük baş harf rozeti ve ad; seçili sekmenin altında kayan çizgi), altında seçili kişinin büyük portresi, alıntısı, adı, unvanı ve şirketi durur. Sekmeye basınca ya da sol/sağ ok tuşuna basınca (listenin sonunda başa sarar, Home/End ilk-son, odak yeni sekmeye gider) portre ve alıntı küçük yön kaymasıyla soluk geçişle değişir ve "Elif Aksoy görüşü gösteriliyor." kibar canlı bölgede duyurulur. Kendiliğinden dönmez; seçim `onSelect` ile dışarı bildirilir. Tek kişide sekme listesi gizlenir. Yükleniyor iskeleti ve dar kap (800 / 680 / 350 px) durumları vardır. Kişi başına ad, unvan, şirket, alıntı ve isteğe bağlı portre verilir; `portrait` yoksa baş harfli yer tutucu çizilir (baş harfler ABACUS `text.upper` ile, Türkçe "İ" kurallı). Portrelerin açıklaması kişi adı ve unvandır. Kişiler `tablist` / `tab` / `tabpanel` olarak çalışır (gezen odak); alıntı paneli yerinde değişir. **Gerçek sitede yalnız izin alınmış portre ve doğrulanmış alıntı kullanılmalıdır; bu uygulamanın sorumluluğudur.** Ekranda biçimlenecek sayı yoktur. Logo şeridi, çok yorumlu döner şerit, kendi ekibini tanıtma (`team-showcase`) ve otomatik oynatma kapsam dışıdır. "Hareketi azalt" açıkken kayma yoktur, geçişler anında olur. Arc Pro testimonial-stage'den esinlenildi (tarif: docs/tarifler/testimonial-stage.md). | `npx shadcn@latest add @snn-ui/testimonial-stage` |
| `team-showcase` | Ekip tanıtımı | Blok: ekibi portre ağırlıklı tanıtan "ekiple tanışın" bölümü. Dört yerleşimden biriyle çalışır: galeri (portre kartları ızgarası, profil altında), film şeridi (yatay yapışmalı portre şeridi), dizin (satır satır liste, satır açılınca profil içinde yükseklik animasyonuyla açılır) ve ön plan (büyük portre bir yanda, ad ve tanım öbür yanda, küçük seçici). Bir kişiye basınca profili yerinde soluk geçişle açılır: ad, unvan, şehir ve ülke, tanım ve kopyalanabilir e-posta ile telefon (her kopyala düğmesi kişinin adıyla etiketli: "Elif Aksoy e-postasını kopyala"; basınca kısa süre "Kopyalandı" ya da "Kopyalanamadı" yazar). Başlıkta "1 / 5 · Elif Aksoy" sayacı bulunur; profil değişimi kibar canlı bölgede duyurulur. İletişim bilgisi olmayan kişide satır gizlenir. Telefon isteğe bağlı olarak ekranda maskelenir. Dar kapta (440 px altı) galeri yatay kaydırıcıya, ön plan alt alta döner. Kişi başına ad, unvan, şehir, ülke, tanım, e-posta, telefon ve isteğe bağlı portre verilir; portre yoksa baş harfli yer tutucu çizilir (baş harfler ABACUS `text.upper`). **İletişim bilgisi kişi başına isteğe bağlıdır; herkese açık sayfada bilgi kasıtlı verilir, yalnız izin alınmış portre ve bilgi kullanılmalıdır (uygulamanın sorumluluğu).** `maskPhone` açıkken telefon ekranda ABACUS `mask.phone` ile maskelenir ("+90 5** *** ** 11"), kopyalanan değer gerçeğidir. Sıra sayacı "2 / 5" `money.fmtDecimalGrouped` ile yazılır. Yerleşim seçicisi (`layoutSwitcher`) yalnız tanıtım ortamı içindir; üretimde sabit bir yerleşim seçilir. Seçim düğmeleri `aria-pressed`, dizin satırları `aria-expanded` ve `aria-controls` taşır. İç aranabilir kişi listesi (`team-directory`), üye yönetimi (`team-members`) ve müşteri alıntıları (`testimonial-stage`) kapsam dışıdır. "Hareketi azalt" açıkken kayma ve yükseklik animasyonu yoktur, seçili kişi kaydırma anidir. Arc Pro team-showcase'den esinlenildi (tarif: docs/tarifler/team-showcase.md). | `npx shadcn@latest add @snn-ui/team-showcase` |

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

### Kullanım göstergesi (`usage-meter`)

```tsx
import { UsageMeter, UsageMeterSegment } from "@/components/snn/usage-meter/usage-meter";

<UsageMeter label="Çalışma alanı depolaması" unit="GB" limit={100} segments={[{ id: "belge", label: "Belgeler", value: 42.5 }, { id: "foto", label: "Fotoğraflar", value: 31 }]} />
```

### Eğim grafiği (`slope-chart`)

```tsx
import { SlopeChart, SlopeItem } from "@/components/snn/slope-chart/slope-chart";

<SlopeChart label="Kanala göre dönüşüm oranı" startLabel="1. çeyrek" endLabel="2. çeyrek" data={[{ key: "arama", label: "Arama", start: 3.2, end: 4.8 }]} highlightKey="arama" />
```

### Ağaç haritası (`treemap`)

```tsx
import { Treemap, TreemapNode } from "@/components/snn/treemap/treemap";

<Treemap label="Bölgeye göre ciro" data={{ id: "kok", label: "Toplam", children: [{ id: "marmara", label: "Marmara", children: [{ id: "ist", label: "İstanbul", value: 4200 }] }] }} />
```

### Kare ızgara grafiği (`waffle-chart`)

```tsx
import { WaffleChart, WaffleCategory } from "@/components/snn/waffle-chart/waffle-chart";

<WaffleChart label="Enerji üretimi, 2025" data={[{ key: "gunes", label: "Güneş", value: 18 }, { key: "ruzgar", label: "Rüzgâr", value: 12 }]} unit="TWh" />
```

### Fırça grafiği (`brush-chart`)

```tsx
import { BrushChart, BrushChartDatum, BrushChartAnnotation } from "@/components/snn/brush-chart/brush-chart";

<BrushChart label="Günlük etkin kullanıcı" data={data} annotations={[{ date: Date.UTC(2026, 8, 1), label: "v2 yayını" }]} />
```

### Etkinlik takvimi (`activity-heatmap`)

```tsx
import { ActivityHeatmap, ActivityDay } from "@/components/snn/activity-heatmap/activity-heatmap";

<ActivityHeatmap label="2025 katkıları" period="2025 yılında" days={days} unit={{ one: "teklif", other: "teklif" }} onSelectDate={openDay} />
```

### Akış grafiği (`streamgraph`)

```tsx
import { Streamgraph, StreamgraphDatum, StreamgraphSeries } from "@/components/snn/streamgraph/streamgraph";

<Streamgraph label="Konuya göre destek talebi" data={weeks} series={[{ key: "fatura", label: "Fatura" }, { key: "giris", label: "Giriş" }]} unit="talep" />
```

### Sırt çizgisi grafiği (`ridgeline`)

```tsx
import { Ridgeline, RidgelineSeries } from "@/components/snn/ridgeline/ridgeline";

<Ridgeline label="Ankara günlük en yüksek sıcaklık" unit="°C" series={[{ id: "ocak", label: "Ocak", values: temps }]} />
```

### Makaralı metin (`slot-text`)

```tsx
import { SlotText } from "@/components/snn/slot-text/slot-text";

<SlotText value={12480} className="fiyat" />
```

### Bölünmüş yüzde çubuğu (`split-bar`)

```tsx
import { SplitBar, SplitSlice } from "@/components/snn/split-bar/split-bar";

<SplitBar label="Gider dağılımı" data={[{ key: "personel", label: "Personel", value: 412000 }, { key: "kira", label: "Kira", value: 185000 }]} />
```

### Akış şeması (`sankey-flow`)

```tsx
import { SankeyFlow, SankeyNodeInput, SankeyLinkInput } from "@/components/snn/sankey-flow/sankey-flow";

<SankeyFlow label="Nakit akışı" kind="money" nodes={[{ id: "satis", label: "Satış" }, { id: "kasa", label: "Ana kasa" }]} links={[{ source: "satis", target: "kasa", value: 2400000 }]} />
```

### Huni grafiği (`funnel-chart`)

```tsx
import { FunnelChart, FunnelStep, FunnelPart } from "@/components/snn/funnel-chart/funnel-chart";

<FunnelChart label="Satış hunisi" steps={[{ key: "ziyaret", label: "Ziyaretçi", value: 48200 }, { key: "siparis", label: "Sipariş", value: 2480 }]} />
```

### Sıralama yarışı (`race-bar-chart`)

```tsx
import { RaceBarChart, RaceItem, RacePeriod } from "@/components/snn/race-bar-chart/race-bar-chart";

<RaceBarChart label="Müşteriye göre aylık ciro" periods={[{ key: "1", label: "Ocak 2026" }, { key: "2", label: "Şubat 2026" }]} items={[{ key: "a", label: "Aksoy İnşaat", values: [420000, 455000] }]} />
```

### Canlı akış grafiği (`realtime-stream`)

```tsx
import { RealtimeStream, StreamReading } from "@/components/snn/realtime-stream/realtime-stream";

<RealtimeStream label="Yanıt süresi" unit="ms" readings={readings} status={online ? "live" : "disconnected"} onRetry={reconnect} />
```

### Özet gösterge paneli (`metrics-dashboard`)

```tsx
import { MetricsDashboard, DashboardData, DashboardMetric, DashboardList } from "@/components/snn/metrics-dashboard/metrics-dashboard";

<MetricsDashboard title="Satış özeti" periods={periods} period={period} onPeriodChange={setPeriod} data={data} status="ready" />
```

### Gösterge ayrıntı paneli (`kpi-drilldown`)

```tsx
import { KpiDrilldown, DrillMetric, DrillBreakdown } from "@/components/snn/kpi-drilldown/kpi-drilldown";

<KpiDrilldown metrics={metrics} periods={periods} period={period} onPeriodChange={setPeriod} />
```

### Gösterge gezgini (`metric-explorer`)

```tsx
import { MetricExplorer, ExplorerMetric, ExplorerPoint } from "@/components/snn/metric-explorer/metric-explorer";

<MetricExplorer metrics={metrics} periods={periods} period={period} onPeriodChange={setPeriod} updatedText="Güncelleme: 18.10.2026 09:40" sourceText="Nakit yönetimi" />
```

### Gelir gezgini (`revenue-explorer`)

```tsx
import { RevenueExplorer, RevenueMonth } from "@/components/snn/revenue-explorer/revenue-explorer";

<RevenueExplorer months={[{ key: "2026-03", newMrr: 62000, expansion: 21000, churn: 14500, total: 905000 }]} initialLength={12} />
```

### Gelir şelalesi (`mrr-waterfall`)

```tsx
import { MrrWaterfall, WaterfallMovement, WaterfallAccount } from "@/components/snn/mrr-waterfall/mrr-waterfall";

<MrrWaterfall start={2210000} movements={[{ key: "yeni", label: "Yeni", direction: "up", role: "new", amount: 148000, accounts }, { key: "kayip", label: "Kayıp", direction: "down", role: "churn", amount: 41500, accounts }]} subtitle="Tüm planlar · Eylül 2026" asOf="30 Eylül itibarıyla" />
```

### Kohort elde tutma (`cohort-retention`)

```tsx
import { CohortRetention, Cohort } from "@/components/snn/cohort-retention/cohort-retention";

<CohortRetention cohorts={[{ key: "2026-01", size: 420, retention: [78.2, 61.5, 52.0, null] }]} segments={[{ value: "all", label: "Tümü" }]} segment="all" onSegmentChange={setSegment} />
```

### Kullanım tahmini (`usage-forecast`)

```tsx
import { UsageForecast, UsageMeasure } from "@/components/snn/usage-forecast/usage-forecast";

<UsageForecast used={cumulativeByDay} days={30} startDate="2026-09-01" budget={38000000} onBudgetChange={setBudget} unit="istek" overage={{ per: 1000, price: 0.45 }} />
```

### Bütçe sapması (`budget-variance`)

```tsx
import { BudgetVariance, VarianceDepartment, VarianceItem } from "@/components/snn/budget-variance/budget-variance";

<BudgetVariance departments={[{ key: "satis", name: "Satış ve pazarlama", owner: "Elif Aksoy", items: [{ key: "reklam", name: "Reklam", budget: 220000, actual: 250800 }] }]} periods={periods} period={period} onPeriodChange={setPeriod} subtitle="Eylül 2026" />
```

### Küçük çoklu grafikler (`small-multiples`)

```tsx
import { SmallMultiples, MultiSeries, MultiPeriod } from "@/components/snn/small-multiples/small-multiples";

<SmallMultiples title="Bölgeye göre ciro" periods={periods} series={[{ key: "marmara", label: "Marmara", values: monthlyRevenue }]} />
```

### Çizgi tekrarı (`line-replay`)

```tsx
import { LineReplay, ReplayPoint, ReplayEvent } from "@/components/snn/line-replay/line-replay";

<LineReplay title="Bülten günü ziyaretçi akışı" points={points} comparison={lastWeek} events={[{ t: bulletinAt, title: "Bülten gönderildi" }, { t: issueAt, kind: "issue", title: "Ödeme sayfası yavaşladı" }]} unit="kişi" />
```

### İşlem ekranı (`market-terminal`)

```tsx
import { MarketTerminal, MarketInstrument, Candle, MarketOrder, OrderRequest } from "@/components/snn/market-terminal/market-terminal";

<MarketTerminal instruments={instruments} periods={periods} live={live} onLiveChange={setLive} buyingPower={250000} positions={{ ANKA: 120 }} orders={orders} onSubmitOrder={placeOrder} onCancelOrder={cancel} />
```

### Yolculuk akışı (`journey-flow`)

```tsx
import { JourneyFlow, JourneyData, JourneyChannel } from "@/components/snn/journey-flow/journey-flow";

<JourneyFlow title="Ziyaretçi yolculuğu" channels={channels} channel={channel} onChannelChange={setChannel} data={{ stages: ["Ziyaret", "Hesap"], nodes: [{ id: "s0", label: "Ziyaret" }, { id: "s1", label: "Hesap" }, { id: "d0", label: "Ayrıldı", muted: true }], links: [{ source: "s0", target: "s1", value: 640 }, { source: "s0", target: "d0", value: 360 }] }} />
```

### Fatura ve teklif stüdyosu (`invoice-studio`)

```tsx
import { InvoiceStudio, InvoiceItem, InvoiceDraft } from "@/components/snn/invoice-studio/invoice-studio";

<InvoiceStudio kind="quote" sender={{ name: "Örnek Ltd." }} recipient={{ name: "Demo A.Ş." }} defaultItems={[{ id: "1", description: "Keşif", quantity: 2, unitPrice: 4500 }]} vatRate={20} onSave={saveDraft} />
```

### Fiyat hesaplayıcı (`pricing-calculator`)

```tsx
import { PricingCalculator, PricingPlan, PriceTier, PlanFeature, TrialSelection } from "@/components/snn/pricing-calculator/pricing-calculator";

<PricingCalculator plans={plans} stops={[1, 5, 10, 20, 50, 100]} defaultSeats={20} yearlyDiscount={20} onStartTrial={startTrial} />
```

### Kullanıma göre fiyat hesaplayıcı (`usage-pricing`)

```tsx
import { UsagePricing, UsagePlan, UsageSelection } from "@/components/snn/usage-pricing/usage-pricing";

<UsagePricing plans={plans} seatStops={[1, 5, 10, 50]} usageStops={[100000, 1000000, 15000000]} usageLabel="Aylık istek" yearlyDiscount={20} onStartTrial={startTrial} />
```

### Ürün listeleme sayfası (`product-listing`)

```tsx
import { ProductListing, Product, ProductPhoto, Filters, SortKey, SwatchOption } from "@/components/snn/product-listing/product-listing";

<ProductListing title="Sonbahar koleksiyonu" products={products} colors={[{ value: "siyah", label: "Siyah", color: "#222426" }]} cartCount={cartCount} onAddToCart={(product, size) => addToCart(product.id, size)} />
```

### Ürün sayfası (`product-detail`)

```tsx
import { ProductDetail, Finish, Size, Selection, DetailPhoto, Distribution } from "@/components/snn/product-detail/product-detail";

<ProductDetail name="Masa Sehpası" trail={[{ label: "Mağaza", href: "/" }, { label: "Masa Sehpası" }]} finishes={finishes} sizes={[{ value: "s", label: "Küçük", price: 2400 }]} reviews={[128, 41, 12, 4, 3]} onAddToCart={addToCart} />
```

### Sepet çekmecesi (`cart-drawer`)

```tsx
import { CartDrawer, CartProduct, CartLine, Coupon, ShippingRule, Totals } from "@/components/snn/cart-drawer/cart-drawer";

<CartDrawer products={products} shipping={{ fee: 49.9, freeFrom: 1000 }} onApplyCoupon={checkCoupon} onCheckout={placeOrder} />
```

### Sipariş özeti (`checkout-summary`)

```tsx
import { CheckoutSummary, CheckoutItem, PromoCode, AutoDiscount, Summary } from "@/components/snn/checkout-summary/checkout-summary";

<CheckoutSummary item={{ name: "Takım planı", price: 4780.8, periodNote: "yıllık" }} taxRate={20} onApplyCoupon={checkCoupon} onPay={startPayment} />
```

### Hesap kartı (`wallet-card`)

```tsx
import { WalletCard, WalletAccount, WalletTransaction, BalancePoint, WalletAction } from "@/components/snn/wallet-card/wallet-card";

<WalletCard accounts={accounts} periods={[{ value: "week", label: "1 hafta" }, { value: "month", label: "1 ay" }]} onSubmit={async order => { await postLedger(order); }} />
```

### Ödeme akışı şeması (`payment-flow`)

```tsx
import { PaymentFlow, Economics, StopInfo } from "@/components/snn/payment-flow/payment-flow";

<PaymentFlow amount={2400} commission={69.6} balance={18250} caption="Müşteri 2.400 ₺ öder; net tutar ertesi iş günü yatar." />
```

### Karşılama ve e-posta kaydı (`hero-signup`)

```tsx
import { HeroSignup, SignupStatus } from "@/components/snn/hero-signup/hero-signup";

<HeroSignup headline="Erken erişim listesine katılın" subline="Yeni sürümde ilk haberi siz alın." count={1284} people={["Elif Aksoy", "Barış Yıldız"]} onSubmit={async email => ({ position: await joinWaitlist(email) })} />
```

### Kaydırmalı ürün anlatısı (`scroll-story`)

```tsx
import { ScrollStory, StoryStep, StageContext } from "@/components/snn/scroll-story/scroll-story";

<ScrollStory label="Hafta özeti nasıl çalışır" steps={[{ id: "gelir", title: "Mesajlar gelir", text: "Mesajlar tek kutuda toplanır." }]} renderStage={({ position }) => <MyStage position={position} />} actions={{ onCopyLink: copyLink, onSend: sendToChannel }} />
```

### Özellik ızgarası (`spotlight-grid`)

```tsx
import { SpotlightGrid, SpotlightFeature, PreviewContext, DetailContext } from "@/components/snn/spotlight-grid/spotlight-grid";

<SpotlightGrid title="Neler yapabilirsiniz" features={[{ id: "gecikme", title: "Gecikmeyi izle", description: "Eğri canlı güncellenir.", wide: true, preview: ({ active }) => <Curve live={active} />, detail: ({ announce }) => <LatencyPanel announce={announce} /> }]} />
```

### Ürün fotoğraf galerisi (`product-gallery`)

```tsx
import { ProductGallery, GalleryColor, GallerySize, ViewerImage } from "@/components/snn/product-gallery/product-gallery";

<ProductGallery colors={[{ value: "kum", label: "Kum", color: "#d9cfba", photos }]} sizes={[{ value: "M", label: "M", soldOutIn: ["orman"] }]} header={<h2>Yağmurluk ceket</h2>} footer={<AddToCart />} onSelectionChange={saveSelection} />
```

### Fotoğraf duvarı (`lightbox-gallery`)

```tsx
import { LightboxGallery, ViewerImage } from "@/components/snn/lightbox-gallery/lightbox-gallery";

<LightboxGallery images={[{ id: "f1", alt: "Kıyıda gün batımı", src: "/foto/kiyi.jpg", width: 1200, height: 800, title: "Kıyıda sabah" }]} />
```

### Fotoğraf ızgarası (`photo-grid`)

```tsx
import { PhotoGrid, ViewerImage } from "@/components/snn/photo-grid/photo-grid";

<PhotoGrid title="Sonbahar albümü" images={[{ id: "a1", alt: "Kıyıda sabah", src: "/foto/a1.jpg", width: 1200, height: 800, title: "Kıyıda sabah" }]} defaultFavorites={["a1"]} onFavoriteChange={(id, favorite) => saveFavorite(id, favorite)} />
```

### Görüş sahnesi (`testimonial-stage`)

```tsx
import { TestimonialStage, Testimonial } from "@/components/snn/testimonial-stage/testimonial-stage";

<TestimonialStage title="Ekipler ne diyor" people={[{ id: "elif", name: "Elif Aksoy", role: "Finans müdürü", company: "Demo A.Ş.", quote: "Kapanış yarım güne indi." }]} onSelect={person => track(person.id)} />
```

### Ekip tanıtımı (`team-showcase`)

```tsx
import { TeamShowcase, TeamMember, ShowcaseLayout } from "@/components/snn/team-showcase/team-showcase";

<TeamShowcase title="Ekiple tanışın" layout="gallery" members={[{ id: "elif", name: "Elif Aksoy", title: "Kurucu ortak", city: "İzmir", country: "Türkiye", email: "elif@ornek.test" }]} onSelect={member => open(member.id)} />
```

## Bu rafta olmayanlar

| Ad | Neden | Ne zaman |
|---|---|---|
| `metric-card` | Arc'ta `animated-counter` ile gelir; o da `Intl.NumberFormat` ve varsayılan `en-US` biçimi kullanır (`1,234`). | 2. raf, ABACUS ile |
| `money-input`, `number-field`, `phone-input`, `date-picker`, `sortable-data-table`, grafikler | B sınıfı: yasak biçim çağrısı içerir. | 2. raf, ABACUS ile |

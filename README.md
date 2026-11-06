# Hapla 🐝 — SPK hap ezber kartları

SPK lisanslama sınavları için kaydırmalı ezber kartı uygulaması (iOS + Android, Expo / React Native).

- Sağa kaydır → ✅ **Biliyorum**, sola kaydır → 🔁 **Tekrar et**
- İki çalışma modu: 🧩 **Boşluk doldurma** ve 📖 **Düz okuma**
- Ders → Bölüm → Kart yapısı
- Seri, günlük hedef, istatistik ve başarımlar
- Hesap yok; tüm ilerleme yalnızca cihazda saklanır

## Telefonda denemek

1. Telefona **Expo Go** uygulamasını kurun (App Store / Google Play).
2. Bilgisayarda:

   ```bash
   npm install
   npx expo start
   ```

3. Terminalde çıkan QR kodu okutun (iPhone: Kamera, Android: Expo Go içinden).

Tarayıcıda görmek için: `npx expo start --web`

## Klasör yapısı

```
src/
  app/                 Ekranlar (Expo Router — her dosya bir ekran)
    (tabs)/            Alt sekmeler: Ana Sayfa, İstatistik, Başarımlar, Profil
    lesson/[lessonId]  Ders → bölüm listesi
    section/[sectionId] Bölüm detayı
    study/[sectionId]  Kart çalışma ekranı (components/study: deste, kart, özet)
  components/          Ortak bileşenler (ui/ altında temel parçalar)
  data/                İçerik: content.ts + content/*.json (ders, bölüm, kart)
  store/               Ayarlar, ilerleme (cihazda), içerik senkronu
admin/                 Admin paneli (Vite + React, bilgisayarda çalışır)
supabase/              Veritabanı şeması (schema.sql) ve ilk içerik (seed.sql)
  theme/               Renkler, yazı tipleri, açık/koyu tema
```

## Yol haritası

| Aşama | İçerik | Durum |
|---|---|---|
| 1 | Proje iskeleti, tema, gezinme, ekran taslakları | ✅ |
| 2 | PDF'teki 346 kartı veriye çevirme, ekranlara bağlama | ✅ |
| 3 | Ana sayfa, ders ve bölüm ekranlarını gerçek veriye bağlama | ✅ (2. aşamayla birlikte) |
| 4 | Kaydırmalı kart ekranı ve animasyonlar | ✅ |
| 5 | Cihazda kayıt (AsyncStorage), ilerleme, tekrar destesi, otomatik tekrar | ✅ |
| 6 | İstatistik, başarımlar, rozet kutlaması (konfeti) | ✅ |
| 7 | Supabase + admin paneli, içerik senkronu | ✅ (Supabase hesabı bağlanınca devreye girer) |
| 8 | Cilalama, ikon, mağaza derlemesi (EAS) | |

## PDF'ten kart üretmek

Hap ezber notu PDF'leri (her sayfa bir bölüm, numaralı notlar, kalın = anahtar bilgi)
tek komutla kart verisine çevrilir:

```bash
python3 scripts/pdf_to_cards.py <dosya.pdf> ticaret-hukuku 1010 "Ticaret Hukuku" src/data/content/ticaret-hukuku.json
```

PDF'teki **kalın** yazılar kartta `**...**` olarak işaretlenir; boşluk doldurma modunda bu kısımlar gizlenir.
Not: Betik bölüm emojilerini ve kimlikleri eklemez; `src/data/content/ticaret-hukuku.json` bu alanlarla
birlikte elle güncellendi. 7. aşamada bu iş admin paneline taşınacak.

## Kart durumları ve otomatik tekrar

| Durum | Ne zaman |
|---|---|
| Yeni | Kart hiç kaydırılmadı |
| Tekrar et | Sola kaydırıldı ya da 🔁 ile tekrar destesine gönderildi |
| Biliyorum | Sağa kaydırıldı |
| ⭐ Kalıcı ezber | Otomatik tekrarda da "Biliyorum" denildi |

Profil → Otomatik tekrar **1 gün** ya da **3 gün** seçiliyse, "Biliyorum" denilen kart o kadar gün sonra
ana sayfadaki **Bugünün tekrarları** destesine düşer. Orada da bilinirse kalıcı ezber olur, bilinmezse tekrar destesine döner.

## Admin paneli ve Supabase kurulumu

Kartlar admin panelinden eklenip düzenlenir; uygulama içeriği açılışta Supabase'den çekip
cihazda saklar (internet yoksa son kopyayla çalışır). Supabase ayarlanmadıysa uygulama
içindeki kartlarla çalışmaya devam eder. **Kullanıcı verisi (ilerleme, profil) Supabase'e gitmez.**

### Bir kerelik kurulum

1. **Proje aç:** supabase.com → *New project*. Bölge olarak *Frankfurt (eu-central-1)* seçilebilir.
2. **Tabloları kur:** Sol menü *SQL Editor* → *New query* → `supabase/schema.sql` dosyasının
   tamamını yapıştır → *Run*.
3. **Kartları yükle:** Yine *SQL Editor* → `supabase/seed.sql` dosyasının tamamını yapıştır → *Run*
   (Ticaret Hukuku: 14 bölüm, 346 kart). Bunu yalnızca ilk kurulumda yap; sonradan çalıştırırsan
   paneldeki değişikliklerin bu kartlar için ezilir.
4. **Admin hesabını aç:** *Authentication → Users → Add user → Create new user*.
   E-posta ve şifre yaz, *Auto Confirm User* işaretli olsun.
5. **Hesabı admin yap:** *SQL Editor*'da (adresi kendi e-postanla değiştir):
   ```sql
   insert into public.admins (email) values ('senin@epostan.com');
   ```
6. **(Önerilir) Yeni kayıtları kapat:** *Authentication → Sign In / Providers* →
   *Allow new users to sign up* kapalı.
7. **Anahtarları al:** *Project Settings → API Keys* (ya da üstteki *Connect* düğmesi):
   *Project URL* ve *anon public* (ya da *publishable*) anahtar.
8. **`.env` dosyası:** Proje klasöründe `.env.example` dosyasını `.env` adıyla kopyala ve
   iki değeri yaz. (Bu dosya GitHub'a gönderilmez.)

### Paneli açmak

```bash
npm run admin
```

Tarayıcıda `http://localhost:5199` açılır; 4. adımdaki e-posta ve şifreyle giriş yap.

- Kart metninde `**iki yıldız**` arasındaki kısım anahtar bilgidir (boşluk doldurmada gizlenir).
  Metni seçip **Kalın yap** (Ctrl+B) ile işaretleyebilirsin; önizleme anında görünür.
- Kartı silmeden geçici olarak gizlemek için **Açık/Pasif** kutusunu kullan.
- Yeni bir PDF'i `scripts/pdf_to_cards.py` ile JSON'a çevirip panelde **⬆ JSON** ile tek seferde yükleyebilirsin.

### Uygulamada görmek

`.env` dosyasını ekledikten sonra uygulamayı önbelleği temizleyerek başlat:

```bash
npx expo start -c
```

İçerik her açılışta ve uygulama öne geldiğinde tazelenir; *Profil → İçerik → Şimdi güncelle*
ile elle de çekilebilir.

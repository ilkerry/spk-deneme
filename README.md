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
  store/               Kullanıcı ayarları / ilerleme
  theme/               Renkler, yazı tipleri, açık/koyu tema
```

## Yol haritası

| Aşama | İçerik | Durum |
|---|---|---|
| 1 | Proje iskeleti, tema, gezinme, ekran taslakları | ✅ |
| 2 | PDF'teki 346 kartı veriye çevirme, ekranlara bağlama | ✅ |
| 3 | Ana sayfa, ders ve bölüm ekranlarını gerçek veriye bağlama | ✅ (2. aşamayla birlikte) |
| 4 | Kaydırmalı kart ekranı ve animasyonlar | ✅ |
| 5 | Cihazda veritabanı (SQLite), ilerleme kaydı, tekrar destesi, bölüm özeti | |
| 6 | Seri, günlük hedef, istatistik, başarımlar, profil kaydı | |
| 7 | Supabase + admin paneli, içerik senkronu | |
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

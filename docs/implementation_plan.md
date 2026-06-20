# Quvie Geliştirme Yol Haritası (Implementation Plan)

Bu plan, çoklu ses kanalı barındıran videoları düzenlemek, ses seviyelerini, modülasyonlarını ve zamanlamalarını ayarlayarak yeni bir video export etmek ve buna paralel bir `.srt` altyazı dosyası üretmek amacıyla tasarlanan **Quvie** uygulamasının mimarisini ve 5 aşamalı geliştirme yol haritasını içermektedir. 

Uygulama **TypeScript React (.tsx)** ile geliştirilecek, doğrudan timeline arayüzüyle açılacak, **SOLID prensiplerine** uygun modüler yapıda kurgulanacak ve **CitruSS UI (Glassque) / Liquid Glass** tasarım dilini kullanacaktır.

---

## SOLID Prensipleri ve Modüler Tasarım Mimarisi

Uygulamanın mimarisi, bakım kolaylığı, genişletilebilirlik ve test edilebilirliği sağlamak için SOLID prensiplerine göre yapılandırılacaktır:

1. **Single Responsibility Principle (SRP - Tek Sorumluluk):**
   - Her modül ve bileşenin yalnızca tek bir sorumluluğu olacaktır. Örneğin, ses dalga formu görselleştiricisi (`WaveformVisualizer.tsx`), dosya sürükle-bırak yöneticisi (`DragDropProvider.tsx`) ve FFmpeg filtre kurucusu (`FilterBuilder.ts`) tamamen bağımsız sınıflar/fonksiyonlar olarak kodlanacaktır.
   
2. **Open/Closed Principle (OCP - Açık/Kapalı):**
   - Sistem yeni ses modülasyonu efektleri (yankı, pitch, robotik vb.) eklenmesine açık, mevcut kodların değiştirilmesine kapalı olacaktır. Efektler birer `AudioEffectStrategy` arayüzünü (interface) uygulayacak ve sisteme bir strateji olarak kaydedilecektir.

3. **Liskov Substitution Principle (LSP - Liskov Yerine Geçme):**
   - Tüm ses ve video filtre arayüzleri tutarlı olacak; herhangi bir filtre veya efekt, kodun diğer kısımlarını bozmadan birbiri yerine ikame edilebilecektir.

4. **Interface Segregation Principle (ISP - Arayüz Ayrımı):**
   - Renderer ve Main süreçleri arasındaki IPC kanalları ve Zustand store yapıları parçalanmış, sadece ihtiyaç duyulan arayüzleri/özellikleri sunan minimalist yapılardan oluşacaktır (`IProjectStore`, `IAudioBlock`, `IVideoMetadata`).

5. **Dependency Inversion Principle (DIP - Bağımlılığın Tersine Çevrilmesi):**
   - Yüksek seviyeli kullanıcı arayüzü bileşenleri, doğrudan alt seviye Electron/Node API'lerine bağımlı olmak yerine, `IFileService` ve `IAudioService` gibi soyutlamalar (abstraction) üzerinden haberleşecektir.

---

## Proje Klasör Yapısı (SOLID & Modüler)

```text
Quvie/
├── docs/
│   └── implementation_plan.md      # Geliştirme yol haritası ve tasarım kararları
├── package.json                    # Bağımlılıklar, scriptler ve meta veriler
├── tsconfig.json                   # TypeScript yapılandırması
├── src/
│   ├── main/                       # Node.js (Electron Main Process)
│   │   ├── main.ts                 # Pencere yönetimi ve başlatıcı
│   │   ├── preload.ts              # IPC Köprüsü
│   │   ├── services/               # Main process iş mantığı servisleri (SRP)
│   │   │   ├── FfmpegService.ts    # Render motoru yönetimi
│   │   │   ├── SrtService.ts       # .srt format üreticisi
│   │   │   └── FileService.ts      # Dosya okuma/yazma servisleri
│   │   └── core/                   # Motor çekirdek yapıları
│   │       ├── FilterBuilder.ts    # FFmpeg filtre kompleks oluşturucusu
│   │       └── strategies/         # Modülasyon Stratejileri (OCP)
│   │           ├── AudioEffect.ts  # Temel efekt arayüzü
│   │           ├── PitchEffect.ts  # Pitch kaydırma filtresi
│   │           └── TempoEffect.ts  # Hız değiştirme filtresi
│   │
│   └── renderer/                   # React (Renderer Process)
│       ├── index.html              # HTML şablonu
│       ├── index.tsx               # React başlangıç noktası
│       ├── App.tsx                 # Ana uygulama bileşeni
│       ├── App.css                 # CitruSS UI Liquid Glass stilleri
│       │
│       ├── store/                  # Slices yöntemiyle bölünmüş Zustand Store (ISP)
│       │   ├── index.ts            # Ana store birleştirici
│       │   ├── projectSlice.ts     # Video ve proje ağacı yönetimi
│       │   └── timelineSlice.ts    # Ses blokları ve zoom yönetimi
│       │
│       └── components/             # Modüler UI Bileşenleri
│           ├── common/             # Genel cam kartlar, butonlar
│           │   ├── GlassCard.tsx
│           │   └── GlassButton.tsx
│           ├── timeline/           # Zaman çizelgesi bileşenleri
│           │   ├── Timeline.tsx
│           │   └── AudioBlock.tsx
│           ├── tree/               # Dosya ağacı bileşenleri
│           │   ├── ProjectTree.tsx
│           │   └── TreeItem.tsx
│           ├── preview/            # Önizleme bileşenleri
│           │   ├── PreviewPanel.tsx
│           │   └── Waveform.tsx
│           └── modulation/         # Modülasyon ayar bileşenleri
│               └── ModulationPanel.tsx
```

---

## User Review Required

> [!IMPORTANT]
> - **TypeScript Geçişi:** Renderer sürecindeki tüm bileşenler `.tsx` ve `.ts` formatlarında yazılacaktır.
> - **Ses Modülasyonu:** FFmpeg üzerinde uygulanacak ses modülasyonu filtreleri (pitch, tempo, yankı/echo veya ses tonu değişimleri) main process'teki export motoruna entegre edilecektir.
> - **Doğrudan Timeline:** Uygulama açılır açılmaz kullanıcıyı karşılayan ana ekran boş bir timeline ve dosya sürükleme alanı olacaktır.

---

## Open Questions

> [!NOTE]
> 1. **Modülasyon Seçenekleri:** Kullanıcıya sunulacak ses modülasyon modları neler olmalıdır? (Örn: Hızlı/Yavaş, Kalın/İnce Ses, Yankı, Robotik Ses vb.)
> 2. **Desteklenen Önizleme Formatları:** Önizleme ekranı hem video hem ses/müzik dosyalarının dalga formunu (waveform) veya doğrudan video oynatıcısını içerecek mi?

---

## Proposed Changes

Proje sıfırdan TypeScript ve SOLID prensipleriyle kurulacaktır.

### 1. Temel Mimari, TypeScript ve Kurulum (Aşama 1)

#### [NEW] [package.json](file:///d:/Works/2026/Quvie/package.json)
- Projenin bağımlılıkları (`electron`, `react`, `react-dom`, `zustand`, `fluent-ffmpeg`, `ffmpeg-static`).
- TypeScript ve React tip tanımlamaları (`typescript`, `@types/react`, `@types/react-dom`).

#### [NEW] [tsconfig.json](file:///d:/Works/2026/Quvie/tsconfig.json)
- TypeScript derleyici ayarları.

#### [NEW] [main.ts](file:///d:/Works/2026/Quvie/src/main/main.ts)
- Electron ana süreç kurulumu ve FFmpeg entegrasyonu.
- IPC kanalları ve dosya okuma işlemleri.

---

### 2. Arayüz Bileşenleri ve Proje Ağacı (Aşama 2)

#### [NEW] [store.ts](file:///d:/Works/2026/Quvie/src/renderer/store/index.ts)
- Zustand ile TypeScript tip güvenli global state (Slices tabanlı ISP yaklaşımı).

#### [NEW] [ProjectTree.tsx](file:///d:/Works/2026/Quvie/src/renderer/components/tree/ProjectTree.tsx)
- Projeye dahil edilen video, ses ve müzik dosyalarını hiyerarşik bir ağaç yapısında gösteren bileşen.

#### [NEW] [Timeline.tsx](file:///d:/Works/2026/Quvie/src/renderer/components/timeline/Timeline.tsx)
- Uygulama açıldığında doğrudan ekrana gelen ana düzenleme alanı.

---

### 3. Önizleme Ekranı ve Ses Modülasyonu (Aşama 3)

#### [NEW] [PreviewPanel.tsx](file:///d:/Works/2026/Quvie/src/renderer/components/preview/PreviewPanel.tsx)
- Seçilen ses bloğunun veya videonun oynatılıp önizlenebildiği panel.

#### [NEW] [ModulationPanel.tsx](file:///d:/Works/2026/Quvie/src/renderer/components/modulation/ModulationPanel.tsx)
- Seçili ses bloğuna modülasyon efektleri uygulayan kontrol paneli.

---

### 4. FFmpeg Export ve SRT Üretimi (Aşama 4)

#### [NEW] [ffmpegEngine.ts](file:///d:/Works/2026/Quvie/src/main/core/FilterBuilder.ts)
- Gecikme (`adelay`), Ses Seviyesi (`volume`) ve Modülasyon filtrelerini birleştiren modüler filtre motoru.

#### [NEW] [srtGenerator.ts](file:///d:/Works/2026/Quvie/src/main/services/SrtService.ts)
- Timeline'daki ses bloklarından zaman damgalı `.srt` altyazısı oluşturma servisi (SRP).

---

### 5. CitruSS UI Liquid Glass Tasarımı (Aşama 5)

#### [NEW] [App.css](file:///d:/Works/2026/Quvie/src/renderer/App.css)
- **CitruSS UI (Glassque)** ve **Liquid Glass** tasarımı:
  - Frosted Glassmorphism efektleri ve arka plan parıltıları.

---

## Verification Plan

### Automated Tests
- Zamanlama, ses seviyesi ve modülasyon parametrelerinin doğru filtre dizelerine dönüştürülmesini test eden birim testler.

### Manual Verification
- Timeline'a sürüklenen ses dosyalarının önizleme oynatıcısında dinlenmesi.
- Modülasyon uygulandığında sesteki değişimin önizlenmesi.
- Çıktı videonun altyazı (.srt) dosyasıyla uyumunun VLC'de doğrulanması.

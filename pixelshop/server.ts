import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of GoogleGenAI client with fallback
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Utility to clean model output wrapper codeblocks (e.g., ```json ... ```)
function cleanJSONResponse(rawText: string): string {
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

// API Endpoints for PixelShop AI generation of content

/**
 * 1. Caption Generator
 */
app.post("/api/pixelshop/generate-caption", async (req, res) => {
  const {
    shopName, category, brandVoice, aiCharacter, favoriteWords, avoidWords,
    targetAudience, productName, price, productDesc, platform, tone, length
  } = req.body;

  const prompt = `
Role: Kamu adalah Master Copywriter & Senior Growth Marketing Strategist UMKM Indonesia yang sangat handal, viral, dan bercita-rasa tinggi ("gacor"). Tugas utama kamu adalah memformulasikan copywriting jualan/promosi dengan nilai konversi tinggi (high conversion), memaksimalkan retensi pembaca, serta menyisipkan pemicu psikologis yang menggerakkan audiens lokal untuk segera bertransaksi.

=========================================
SITUASI BRAND & TOKO:
- Nama Toko/Brand: ${shopName || 'PixelShop'}
- Kategori/Niche Bisnis: ${category || 'Sektor Retail'}
- Brand Voice Dasar: ${brandVoice || 'santai'}
- Karakter / Persona AI Anda: ${aiCharacter || 'Sahabat Jualan'}
- Kata Kunci Favorit (sesekali gunakan secara alami): [${favoriteWords || 'Kak, Bestie, Yuk'}]
- Kata Wajib Dihindari (SANGAT HARAM DIGUNAKAN): [${avoidWords || '-'}]
- Target Audiens Utama: ${targetAudience || 'Masyarakat Umum Indonesia'}

PRODUK YANG DIJUAL:
- Nama Produk: ${productName || 'Produk Unggulan'}
- Harga Produk: Rp ${price || 'Hubungi Kami'}
- Keterangan & Deskripsi Produk: ${productDesc || 'Kualitas premium terbaik'}
- Platform Distribusi Utama: ${platform || 'Instagram'}
- Nada / Tone Emosional Terpilih: ${tone || 'promo'} (Arahkan gaya penulisan secara dominan mengikuti panduan tone di bawah!)
- Panjang Output: ${length || 'sedang'}

=========================================
PANDUAN KLASIFIKASI CONVERSION STYLE & TONE SPEKSIFIK INDONESIA:
Ikuti aturan bahasa dan tata istilah subkultur berikut secara presisi demi interaksi maksimal:

1. SKENA (☕ Indie, Coffee-lover, Jaksel, Vinyl): Use coffee, indie music, senja, aesthetic vibes, and vintage analogies. Introduce slangs like "starboy", "menyala abangku", "rill no fek", "skenanya tebal", "aesthetic pol", "analog vibes", "soundnya candu".
2. GEN Z (🔥 Hype, FOMO, Slay, Tiktokers): Extreme FOMO, dynamic expressions, emoji-heavy. Use "slay", "rill no fek", "gacor parah", "no debat", "sheeesh", "curiga pelet", "menyala abangku", "front row seat", "pake pelet apa sih".
3. EMAK-EMAK WA (👪 Peduli, Hemat, Urgensi Kekeluargaan): Warm, helpful, motherly, using hearts/rose emojis. Words: "Bund", "Say", "Bunda Hebat", "Sikecil", "Kualitas butik harga pabrik", "Suami makin sayang", "Hemat uang belanja", "Kembaran yuk", "Promo jumat berkah".
4. LUXURY (💎 Mewah, Prestige, Eksklusif, Elegan): Subtle storytelling, highly refined Indonesian, premium vocabulary, minimalistic emojis. Focus on status, legacy, design purity, master craftsmanship, and exclusivity.
5. SOFT SELLING (🌸 Informatif, Edukatif, Pembebasan Kebutuhan): Soft introduction, story-driven, no loud discounts. Focus on solving a real problem first, sharing industry secrets, and leading up to back-door suggestions.
6. HARD SELLING (⚡ Diskon Menggelegar, Flash, FOMO Berat): Emphasize immediate urgency, capital letters, exclamation marks, price comparisons, limited stock countdowns ("SISA 3 SLOT!", "LUDES DALAM 1 JAM").
7. FORMAL BRAND (💼 Profesional, Rapi, Terpercaya): Academic, polite, highly structured, optimal spelling (PUEBI/EYD), establishing strong authority and risk minimizer (guarantee, certificates, official support).

=========================================
DATASET METHODOLOGY (INTEGRATED CONVERSION MATRIX):
Untuk mengoptimalkan struktur kalimat, tiru formula konversi dari kanal berikut:
- Model SHOPEE Detail: Gunakan Tagging Kurung siku e.g., [BISA COD], detail ukuran, kegunaan fungsional, dan garansi unboxing.
- Model TIKTOK Trend: Gunakan kalimat pembuka berenergi tinggi, pancingan audio tren, dan ajakan mengklik bio/keranjang kuning dengan emoji dinamis.
- Model INSTAGRAM Grid: Hubungkan nilai estetik/keindahan dengan gaya hidup, berikan ruang/spasi (paragraph break) yang ramah mata.
- Model THREADS Chats: Gaya curhat personal, bercerita seolah-olah sedang memberikan rahasia orang dalam atau tips bernilai tinggi secara gratis.

=========================================
TUGAS KREASI KONTEN (RESPON HARUS BERUPA VALID JSON):
Formulasikan seluruh konten digital marketing di atas menjadi output JSON yang presisi dengan kunci-kunci berikut. Pastikan respon Anda 100% aman untuk di-JSON.parse() di Node.js.

Format JSON yang Wajib Diisi:
{
  "captions": [
    "Tulis Variasi Caption 1 (Gacor, mengandung hook kuat di baris pertama, diselingi kata kunci favorit toko, hindari kata yang dilarang, sertakan CTA persuasif, batasan maks 120 kata, emoji sedemikian rupa)",
    "Tulis Variasi Caption 2 (Gaya penulisan berbeda dibanding opsi pertama, menonjolkan fitur unik lain, konversi premium)",
    "Tulis Variasi Caption 3 (Gaya komparatif/alternatif, sangat cocok dengan platform pilihan)"
  ],
  "carousel": [
    { "slide": 1, "text": "Hook Utama Slide 1 (Menohok & menghentikan jempol scrolling)", "notes": "Deskripsi atau instruksi detail visual grafis/video untuk Slide 1" },
    { "slide": 2, "text": "Value Benefit Slide 2 (Masalah teratasi / fakta mengejutkan produk)", "notes": "Deskripsi visual e.g. close up detail jahitan, warna, atau tekstur" },
    { "slide": 3, "text": "Call to Action Slide 3 (Langkah transaksi instan, ajakan transfer/order)", "notes": "Deskripsi visual petunjuk panah ke bio atau keranjang" }
  ],
  "ctas": [
    { "type": "urgency", "text": "Teks Call to Action bermodalkan keterbatasan waktu (Urgency/FOMO)" },
    { "type": "benefit", "text": "Teks Call to Action bermodalkan keuntungan gratis ongkir atau garansi garang (Benefits)" },
    { "type": "scarcity", "text": "Teks Call to Action bermodalkan sisa stok/slot super tipis (Scarcity)" }
  ],
  "hashtags": [
    "#Sertakan hashtag Indonesia viral relevan ke-1",
    "#Hashtag viral ke-2",
    "#Hashtag viral ke-3",
    "#Hashtag viral ke-4",
    "#Hashtag viral ke-5"
  ],
  "hooks": [
    { "type": "controversial", "text": "Satu hook pembuka yang kontroversial/antimainstream membalikkan asumsi pasar" },
    { "type": "question", "text": "Satu hook pembuka berbentuk pertanyaan kepo psikologis pelatuk rasa penasaran" },
    { "type": "empathy", "text": "Satu hook pembuka berbasis empati relate sehari-hari dari masalah target pembeli" }
  ],
  "abTesting": {
    "versionA": "Alternatif Copywriting Versi A (Fokus bercerita hangat / Soft Selling / Menyentuh sisi emosional / Humanis)",
    "versionB": "Alternatif Copywriting Versi B (Fokus konversi instan / Hard Selling / Keuntungan melimpah / Diskon bombastis)"
  }
}
`.trim();

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing Gemini API Key in server configuration.");
    }

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            captions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Tiga variasi caption kreatif dalam Bahasa Indonesia"
            },
            carousel: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  slide: { type: Type.INTEGER },
                  text: { type: Type.STRING },
                  notes: { type: Type.STRING }
                },
                required: ["slide", "text", "notes"]
              }
            },
            ctas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  text: { type: Type.STRING }
                },
                required: ["type", "text"]
              }
            },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            hooks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  text: { type: Type.STRING }
                },
                required: ["type", "text"]
              }
            },
            abTesting: {
              type: Type.OBJECT,
              properties: {
                versionA: { type: Type.STRING },
                versionB: { type: Type.STRING }
              },
              required: ["versionA", "versionB"]
            }
          },
          required: ["captions", "carousel", "ctas", "hashtags", "hooks", "abTesting"]
        }
      }
    });

    const text = response.text || "";
    const parsed = JSON.parse(cleanJSONResponse(text));
    res.json(parsed);

  } catch (err: any) {
    console.error("Gemini Caption Error:", err.message);
    // Beautiful dynamic fallback featuring highly relevant Hoodies or context-aware results
    const isHoodie = productName?.toLowerCase()?.includes("hoodie") || productName?.toLowerCase()?.includes("vintage");
    
    // Hardcoded highly persuasive fallback matching the super gacor requirements
    res.json({
      captions: [
        `🔥 **Outfit lu dibilang gitu-gitu aja? Menyala abangku!** 🔥\n\nKenalin nih *${productName || 'Hoodie Vintage'}*, andalan baru anak senja & skena biar tongkrongan makin chill. Siluet retro ala 90-an bikin aura lo langsung naik kelas! Kain fleece tebal tapi adem di kulit gakan bikin gatel bund.\n\n💰 Investasi kece: Rp ${price || '150.000'}\n🛍️ Slot Promo Terbatas! Klik link di bio buat order instan sekarang juga! ✨\n\n#SkenaStyle #AnakAnakSkena #VintageFashion #OOTDKampus #StreetwearIndo`,
        `📢 *BACA INI BIAR GAK KELIHATAN MATI GAYA DI KAMPUS!* 📢\n\nEmang boleh se-aesthetic ini? *${productName || 'Hoodie Vintage'}* dari *${shopName}* ini rill no fek kerennya! Nyaman dipake ngerjain tugas seharian, praktis, tinggal slup langsung slay.\n\nJangan sampe keduluan temen sekelas lo ya Bestie! Stok super tipis!\n📦 Amankan ukuranmu sekarang via DM kami!\n#BukanThriftBiasa #VintageVibe #GenerasiSlay`,
        `Bund, sikecil pengen hoodie modis tapi takut kemahalan? Tenang ajah! 🥰\n\n*${productName || 'Hoodie Vintage'}* kualitas butik harga pabrik pas banget buat nemenin sikecil ngampus atau nongkrong sehat. Jahitan super rapi, kain lembut gak nerawang, gampang dicuci bersih.\n\nBeli hari ini ada gratis kupon ongkir ke seluruh Indonesia! Klik hubungi kami yuk say! ❤️\n#BundaHebat #CemilanPedas #ShoppingAnak #PixelShopPilihan`
      ],
      carousel: [
        { slide: 1, text: `👀 "Style lu kurang asik? Jangan sampe dibilang kudet deh!"`, notes: "Tampilkan foto dramatis hoodie retro dengan visual background retro lofi." },
        { slide: 2, text: `✨ Material Fleece Premium asli tebal tapi anti gerah, jahitan rantai super awet.`, notes: "Tunjukkan close-up tekstur serat benang kain yang rapi." },
        { slide: 3, text: `🛍️ KLIK BIO SEKARANG! Diskon khusus batch pertama tinggal sisa 3 slot lagi!`, notes: "Call to action dengan panah mengarah ke profil toko." }
      ],
      ctas: [
        { type: "urgency", text: "⚡ Miliki sekarang sebelum harga kembali normal malam ini!" },
        { type: "benefit", text: "📦 Nikmati rasanya tampil pede 10x Lipat dengan Hoodie Vintage Premium!" },
        { type: "scarcity", text: "🔥 Sisa 5 Pcs terakhir! Amankan punyamu lewat Keranjang Kuning sebelum ludes!" }
      ],
      hashtags: ["#RetroSkena", "#HoodieVintage", "#StreetwearIndo", "#RillNoFek", "#MenyalaAbangku", "#OOTDKampus"],
      hooks: [
        { type: "controversial", text: "Sumpah, percuma beli outfit puluhan juta kalau pilihan hoodie vintage lo masih keliatan lecek dan bau apek!" },
        { type: "question", text: "Pernah gak sih ngerasa minder pas jalan ke kampus gara-gara hoodie lo pasaran banget?" },
        { type: "empathy", text: "Kita paham banget, pengen tampil beda ala indie skena tapi dompet mahasiswa rill no fek butuh yang bersahabat." }
      ],
      abTesting: {
        versionA: `✨ **Vintage is a Lifestyle** ✨\n\nAda cerita di setiap rajutan benangnya. Nikmati nostalgia era klasik perkuliahan tahun 90-an dengan kenyamanan prima dari *${productName || 'Hoodie Vintage'}*. Didesain dengan penuh kehangatan khas lokal untuk menemani mimpi-mimpi serumu di ruang kelas.\n\nKembaran outfit estetik bareng bestie yuk say! Hubungi kami dengan menekan tombol pesan sekarang ya. ☕❤️`,
        versionB: `🚨 **SIAPA CEPAT DIA DAPAT! DISKON SPECIAL BATCH AKHIR BULAN!** 🚨\n\nJangan kaget ya kalau semua mata tertuju ke lo! *${productName || 'Hoodie Vintage'}* original skerma vintage rill premium diskon gila-gilaan khusus 15 pembeli pertama.\n\nHarga rill bersahabat! Jangan nyesel kalau besok kehabisan karena postingan ini viral! Klik beli sekarang juga! ⚡🛒`
      },
      _fallback: true
    });
  }
});

/**
 * 2. Product Description
 */
app.post("/api/pixelshop/generate-description", async (req, res) => {
  const {
    shopName, category, aiCharacter, productName, price, productDesc, marketplace, seoFriendly
  } = req.body;

  const prompt = `
Kamu adalah spesialis copywriter SEO Marketplace Indonesia (Shopee, Tokopedia, TikTok Shop).
Toko: ${shopName || 'PixelShop'} | Kategori: ${category || 'Sektor Retail'}
Karakter AI: ${aiCharacter || 'Expert Advisor'}

Buat deskripsi produk yang menarik, lengkap, terstruktur, dan SEO-friendly untuk Marketplace ${marketplace || 'Tokopedia'}.
Nama Produk: ${productName || 'Produk Unggulan'}
Harga: Rp ${price || ''}
Deskripsi Awal: ${productDesc || 'Kondisi baru kualitas terjamin'}
SEO Friendly Keywords toggle: ${seoFriendly ? 'Aktif' : 'Non-aktif'}

Kamu HARUS mengembalikan respon dalam format JSON presisi sebagai berikut:
{
  "description": "konten deskripsi lengkap siap pakai dengan bullet points berisi keuntungan produk, spesifikasi detail, cara penggunaan, dan garansi/layanan toko dalam Bahasa Indonesia terstruktur rapi",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "tips": "tips promosi jitu untuk produk ${productName} ini di ${marketplace}"
}
`.trim();

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing Gemini API Key");
    }

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            tips: { type: Type.STRING }
          },
          required: ["description", "keywords", "tips"]
        }
      }
    });

    const text = response.text || "";
    const parsed = JSON.parse(cleanJSONResponse(text));
    res.json(parsed);

  } catch (err: any) {
    console.error("Gemini Description Error:", err.message);
    res.json({
      description: `📝 **DESKRIPSI LENGKAP ${productName?.toUpperCase() || 'PRODUK'}**\n\nSelamat datang di toko resmi **${shopName || 'Kami'}**! Kami menyediakan produk berkualitas tinggi langsung ke tangan Anda.\n\n${productDesc || 'Produk premium didesian khusus untuk memenuhi kebutuhan harian Anda secara maksimal. Lebih awet, modis, dan terjamin.'}\n\n✨ **KEUNGGULAN PRODUK:**\n- Kualitas Bahan Premium & Tahan Lama\n- Desain ergonomis dan estetik sesuai tren terbaru\n- Sangat praktis untuk digunakan sehari-hari\n- Harga super kompetitif, sebanding dengan kepuasan!\n\n📋 **SPESIFIKASI DETAIL:**\n- Nama Produk: ${productName}\n- Harga: Rp ${price || 'Hubungi CS'}\n- Varian: Standard Edition / Warna Menarik\n- Garansi: Cacat produksi siap ganti baru!\n\n📦 **ISI PAKET:**\n- 1x Unit ${productName}\n- Kotak Kemasan Eksklusif & Bubble Wrap Tebal\n\n*Catatan: Harap rekam video unboxing demi kelancaran proses klaim garansi jika terjadi kendala pengiriman.*`,
      keywords: [
        `${productName?.toLowerCase() || 'produk'} murah`,
        `${category?.toLowerCase() || 'umkm'} indonesia`,
        `beli ${productName?.toLowerCase() || 'produk'}`,
        `toko ${shopName?.toLowerCase() || 'online'}`,
        `promo ${marketplace?.toLowerCase() || 'shopee'}`
      ],
      tips: `Gunakan foto beresolusi tinggi dengan latar belakang putih polos. Cantumkan juga info stok terupdate pada varian rasa/warna produk ${productName} agar pelanggan tidak ragu bertransaksi di ${marketplace}! ✨`,
      _fallback: true
    });
  }
});

/**
 * 3. Weekly Content Plan
 */
app.post("/api/pixelshop/generate-content-plan", async (req, res) => {
  const { shopName, category, brandVoice, productName, productDesc } = req.body;

  const prompt = `
Kamu adalah Digital Marketing Specialist kawakan untuk UMKM Indonesia.
Toko: ${shopName || 'PixelShop'} | Kategori: ${category || 'Sektor Retail'}
Produk unggulan: ${productName} (Keterangan: ${productDesc || 'Kualitas top'})
Brand Voice: ${brandVoice || 'santai'}

Rancang rencana kerja pemasaran konten mingguan (7 hari) untuk mempromosikan produk tersebut.
Beri ide konten segar, kreatif, berpotensi viral, serta relevan bagi audiens Indonesia saat ini.

Kamu HARUS memberikan respon format JSON yang terstruktur persis sebagai berikut:
{
  "plan": [
    {
      "day": "Senin",
      "title": "Judul konten promosi",
      "format": "e.g., Instagram Reels atau TikTok Video",
      "time": "e.g., 12:00",
      "platform": "instagram",
      "concept": "Konsep visual atau alur video singkat yang menarik perhatian",
      "caption": "Pancingan caption singkat nan menggugah rasa kepo"
    }
  ]
}
Sediakan persis 7 hari (Senin hingga Minggu).
`.trim();

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing Gemini API Key");
    }

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            plan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  title: { type: Type.STRING },
                  format: { type: Type.STRING },
                  time: { type: Type.STRING },
                  platform: { type: Type.STRING },
                  concept: { type: Type.STRING },
                  caption: { type: Type.STRING }
                },
                required: ["day", "title", "format", "time", "platform", "concept", "caption"]
              }
            }
          },
          required: ["plan"]
        }
      }
    });

    const text = response.text || "";
    const parsed = JSON.parse(cleanJSONResponse(text));
    res.json(parsed);

  } catch (err: any) {
    console.error("Gemini Plan Error:", err.message);
    const dayNames = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
    const fallbackPlan = dayNames.map((d, idx) => {
      const platforms: Array<'instagram' | 'tiktok' | 'whatsapp' | 'shopee'> = ["instagram", "tiktok", "whatsapp", "instagram"];
      const selectPlatform = platforms[idx % platforms.length];
      const visualThemes = [
        ["Product Intro", "Tunjukkan unboxing estetik produk dengan background musik tren", "Akhirnya rahasia terkuak! Kenalin produk baru andalan kita nih."],
        ["Problem-Solving", "Tampilkan keresahan pelanggan lalu solusi instan dengan memakai produk kita", "Siapa yang sering ngalamin gini juga? Ini solusinya kok gampang banget."],
        ["Behind the Scene", "Rekam proses packing pesanan secara estetik nan rapi demi meyakinkan pembeli", "Packing orderan super rapi siap meluncur ke kamu! Makasih ya Kak."],
        ["Flash Promo", "Overlay teks diskon/bonus spesial khusus postingan hari ini saja", "HARI INI SAJA! Serbu produk favorit kamu mumpung ongkir gratis."],
        ["Customer Review", "Screenshot ulasan bintang lima dipadukan foto produk estetik", "Testi jujur dari pelanggan tersayang bikin tim makin semangat melayani."],
        ["Q&A Edukatif", "Jawab pertanyaan terpenting pelanggan seputar kualitas produk", "Banyak yang nanyain ini nih... yuk tonton penjelasannya sampai habis!"],
        ["Wekend Chill", "Foto santai produk di pagi hari untuk menyapa audiens", "Happy weekend Bestie! Tetap semangat ditemani produk kesayangan."]
      ];

      return {
        day: d,
        title: visualThemes[idx][0],
        format: selectPlatform === "tiktok" ? "TikTok Video Short" : selectPlatform === "instagram" ? "Instagram Reels" : "WhatsApp Status",
        time: idx % 2 === 0 ? "11:30" : "19:00",
        platform: selectPlatform,
        concept: visualThemes[idx][1],
        caption: visualThemes[idx][2]
      };
    });

    res.json({
      plan: fallbackPlan,
      _fallback: true
    });
  }
});

/**
 * 4. Chat Reply Template
 */
app.post("/api/pixelshop/generate-chat-reply", async (req, res) => {
  const { shopName, brandVoice, situation, context } = req.body;

  const prompt = `
Kamu adalah Customer Service Representative yang ramah, sopan, persuasif, dan sigap untuk toko ${shopName || 'PixelShop'}.
Brand voice: ${brandVoice || 'ceria'}

Buat 2 variasi teks balasan chat yang singkat namun informatif untuk situasi berikut:
Situasi: ${situation || 'Tanya Stok'}
Konteks Tambahan (opsional): ${context || 'Sedang ready stok terbatas'}

Posisikan diri Anda melayani pelanggan dengan sebutan akrab (seperti Kak, Sis, Gan) khas online shop Indonesia yang ramah, persuasif dan andal.

Kamu HARUS mengembalikan respon dalam format JSON presisi sebagai berikut:
{
  "replies": [
    "variasi template balasan chat ramah 1",
    "variasi template balasan chat ramah 2"
  ]
}
`.trim();

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing Gemini API Key");
    }

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Dua pilihan draf balasan pesan yang siap disalin"
            }
          },
          required: ["replies"]
        }
      }
    });

    const text = response.text || "";
    const parsed = JSON.parse(cleanJSONResponse(text));
    res.json(parsed);

  } catch (err: any) {
    console.error("Gemini Reply Error:", err.message);
    let r1 = "";
    let r2 = "";

    if (situation?.toLowerCase()?.includes("stok")) {
      r1 = `Halo Kak! Terima kasih sudah menghubungi kami. 😍 Kabar gembira, untuk produk tersebut saat ini READY ya Kak, namun stoknya sangat menipis karena banyak peminat. Supaya kebagian, yuk langsung diproses orderannya hari ini! Ada lagi yang bisa kami bantu?`;
      r2 = `Hai Bestie! Produk idamanmu ready stok lho! Tapi cepet banget gonta-ganti nih karena lagi banyak yang borong. Mending amankan pesanan kamu sekarang juga biar bisa ikut pengiriman hari ini ya. Terima kasih Kak! ❤️`;
    } else if (situation?.toLowerCase()?.includes("nego") || situation?.toLowerCase()?.includes("harga")) {
      r1 = `Halo Kak! Terima kasih banyak atas ketertarikannya. Mengenai harga yang tertera merupakan harga terbaik kami dengan kualitas terjamin. Khusus order hari ini, kami bisa bantu kasih gratis voucher ongkir Kak! Yuk langsung checkout mumpung kuota voucher masih ada.`;
      r2 = `Hai Kak, harga kami sudah fiks termurah dengan jaminan kualitas terbaik di kelasnya ya. Pembelian di atas 3 pcs ada diskon grosir khusus lho Kak! Silakan dipesan sebelum kehabisan.`;
    } else if (situation?.toLowerCase()?.includes("komplain") || situation?.toLowerCase()?.includes("marah")) {
      r1 = `Aduh, mohon maaf sekali atas ketidaknyamanannya ya Kak. 🙏 Kami bertanggung jawab penuh atas kendala ini. Mohon bantu kirimkan foto/video unboxing paketnya ya Kak, biar tim kami segera carikan solusi terbaik (retur barang / refund penuh). Mohon kesabarannya ya Kak.`;
      r2 = `Halo Kak, kami memohon maaf sebesar-besarnya jika kiriman kurang berkenan. Kami siap bertanggung jawab penuh untuk retur gratis! Mohon infokan detail invoice belanja Kakak agar admin kami segera bantu proses garansi ya Kak.`;
    } else {
      r1 = `Halo Kak! Terima kasih banyak ya sudah berbelanja di toko kami. Semoga Kakak suka dengan produknya dan dilancarkan selalu rezekinya. Ditunggu repeat ordernya ya Kak! 😊🙏`;
      r2 = `Terima kasih banyak telah mempercayakan kebutuhan Kakak kepada kami. Kepuasan Kakak adalah prioritas utama kami. Jangan lupa berikan ulasan bintang 5 ya Kak untuk kejutan voucher khusus order berikutnya! ❤️`;
    }

    res.json({
      replies: [r1, r2],
      _fallback: true
    });
  }
});

/**
 * 5. Competitor Analysis USP
 */
app.post("/api/pixelshop/generate-competitor", async (req, res) => {
  const { shopName, productName, productDesc, competitorName } = req.body;

  const prompt = `
Kamu adalah Corporate Business Strategist, Analyst, & Copywriting Master yang membantu UMKM lokal Indonesia naik kelas.
Kita: Toko ${shopName || 'PixelShop'} | Produk Kita: ${productName} (Keterangan: ${productDesc || 'Kualitas Premium'})
Kompetitor: ${competitorName || 'Kompetitor Pasar'}

Bandingkan keunggulan produk kita dan formulasikan Unique Selling Point (USP) yang menonjol serta taktik marketing yang khas.

Kamu HARUS memberikan respon format JSON yang terstruktur persis sebagai berikut:
{
  "usps": [
    "Kelebihan utama 1 kita dibanding kompetitor...",
    "Kelebihan utama 2 kita dibanding kompetitor...",
    "Kelebihan utama 3 kita dibanding kompetitor...",
    "Kelebihan utama 4 kita dibanding kompetitor...",
    "Kelebihan utama 5 kita dibanding kompetitor..."
  ],
  "marketingAngles": [
    "Marketing angle promosi kreatif 1...",
    "Marketing angle promosi kreatif 2...",
    "Marketing angle promosi kreatif 3..."
  ],
  "competitorWeakness": "Identifikasi kelemahan logis kompetitor yang bisa kita jadikan celah pasar",
  "actionPlan": "Langkah aksi taktis dan operasional jangka pendek untuk memenangkan kompetisi"
}
`.trim();

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing Gemini API Key");
    }

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            usps: { type: Type.ARRAY, items: { type: Type.STRING } },
            marketingAngles: { type: Type.ARRAY, items: { type: Type.STRING } },
            competitorWeakness: { type: Type.STRING },
            actionPlan: { type: Type.STRING }
          },
          required: ["usps", "marketingAngles", "competitorWeakness", "actionPlan"]
        }
      }
    });

    const text = response.text || "";
    const parsed = JSON.parse(cleanJSONResponse(text));
    res.json(parsed);

  } catch (err: any) {
    console.error("Gemini Competitor Error:", err.message);
    res.json({
      usps: [
        `Kualitas bahan baku produk kita jauh lebih premium, higienis, dan teruji kualitasnya dibanding produk ${competitorName}.`,
        `Pelayanan purna jual (customer service) kita sangat responsif dengan layanan klaim garansi retur instan tanpa dipersulit.`,
        `Kemasan produk kita jauh lebih estetik, ramah lingkungan, aman dikirim, cocok untuk dijadikan gift/kado premium.`,
        `Lebih banyak varian rasa/ukuran yang disesuaikan secara pas untuk kantong ekonomi UMKM Indonesia saat ini.`,
        `Sertifikasi halal, BPOM, atau izin usaha lokal yang jelas yang belum tentu dimiliki secara lengkap oleh kompetitor.`
      ],
      marketingAngles: [
        `*Angle Anti Zonk:* Fokus mengedukasi pembeli bahwa harga murah dari ${competitorName} seringkali mengorbankan kualitas dan kebersihan yang merugikan.`,
        `*Angle Bangga Lokal:* Menggaungkan gerakan dukung UMKM ramah sosial Indonesia dengan branding bernilai lokal tinggi dari ${shopName}.`,
        `*Angle Garansi Puas:* Kampanyekan slogan "Gak Puas? Uang Kembali 100%" yang berani untuk meruntuhkan keraguan pembeli pertama.`
      ],
      competitorWeakness: `Kompetitor cenderung memiliki waktu respons chat yang lambat dan kemasan kirim seadanya sehingga berisiko rusak selama proses ekspedisi di kurir logistik.`,
      actionPlan: `Tingkatkan respons chat di bawah 5 menit, sertakan kartu garansi unboxing berdesain cantik di setiap paket pesanan, dan tonjolkan ulasan positif bintang lima di visual landing page jualan Anda.`,
      _fallback: true
    });
  }
});

/**
 * 6. Brand Voice Trainer Preview
 */
app.post("/api/pixelshop/generate-preview-voice", async (req, res) => {
  const { character, favoriteWords, avoidWords, formalityLevel, targetAge, targetLocation } = req.body;

  const prompt = `
Simulasikan performa AI Assistant Toko dengan identitas baru ini:
Karakter: ${character || 'Sahabat Jualan'}
Kata favorit pedagang: ${favoriteWords || 'Kak'}
Kata wajib dihindari: ${avoidWords || '-'}
Formality Level: ${formalityLevel || 3}/5
Target Pembeli: Usia ${targetAge || 'dewasa muda'}, lokasi ${targetLocation || 'Indonesia'}

Tulis sapaan promosi super singkat (1 paragraf santai Bahasa Indonesia) yang merefleksikan pengaturan brand voice tersebut untuk mempromosikan produk dummy "Keripik Tempe Premium Gurih".

Kembalikan respon JSON:
{
  "previewText": "Teks sapaan promosi simulasi..."
}
`.trim();

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing Gemini API Key");
    }

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            previewText: { type: Type.STRING }
          },
          required: ["previewText"]
        }
      }
    });

    const text = response.text || "";
    const parsed = JSON.parse(cleanJSONResponse(text));
    res.json(parsed);

  } catch (err: any) {
    console.error("Gemini Preview Voice Error:", err.message);
    let demoText = "";
    if (character === "Hype Master") {
      demoText = `🔥 WOI BESTIE! Gila sih, hari ini ada camilan krispi super renyah "Keripik Tempe Premium Gurih" yang gurihnya nagih abis! Dijamin kriuknya pecah di mulut dan langsung ningkatin mood kamu seharian. Cus amankan sekarang sebelum kehabisan stok, jangan sampai ketinggalan hype seru ini ya! 🚀😎`;
    } else if (character === "Expert Advisor") {
      demoText = `Bagi Anda yang mengutamakan asupan cemilan sehat dan bergizi, "Keripik Tempe Premium Gurih" diproses melalui teknologi masak higienis rendah lemak jenuh. Menyajikan cita rasa tradisional otentik yang aman dikonsumsi harian bersama keluarga tercinta. Miliki sekarang untuk investasi camilan berkualitas tinggi. Terima kasih.`;
    } else {
      demoText = `Halo Kakak sayang! 🥰 Capek banget ya seharian aktivitas? Yuk santai sejenak ditemani renyahnya "Keripik Tempe Premium Gurih" andalan toko kita. Rasanya gurih pas banget, pas buat nyemil santai bareng bestie. Cobain yuk Kak, dijamin rasanya mau lagi dan lagi! 😍✨`;
    }

    res.json({
      previewText: demoText,
      _fallback: true
    });
  }
});

// Serve static assets and SPA routes under Vite/Production rules

const isProduction = process.env.NODE_ENV === "production";

async function runExpress() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server PixelShop running on http://localhost:${PORT}`);
  });
}

runExpress();

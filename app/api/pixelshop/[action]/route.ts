import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { prisma } from "@/src/lib/prisma";

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

function getDummyProducts(category: string) {
  const norm = (category || "").toLowerCase();
  if (norm.includes("kuliner") || norm.includes("cemilan") || norm.includes("makanan")) {
    return [
      { name: "Keripik Basreng Gurih Pedas Daun Jeruk", price: 18500, description: "Bakso goreng renyah diiris tipis dengan bumbu cabai asli premium dicampur daun jeruk segar.", category },
      { name: "Keripik Tempe Premium Gurih", price: 12000, description: "Keripik tempe tipis gurih renyah tanpa bahan pengawet dengan resep bumbu warisan keluarga.", category }
    ];
  }
  if (norm.includes("fashion") || norm.includes("muslim") || norm.includes("fesyen") || norm.includes("baju")) {
    return [
      { name: "Hijab Bella Square Syari Premium", price: 35000, description: "Hijab Bella Square kualitas teratas, bahan double hycon premium. Tebal, dingin, tidak menerawang.", category },
      { name: "Gamis Linen Premium Elegant", price: 185000, description: "Gamis bahan linen premium bertekstur lembut, adem, dan menyerap keringat. Potongan A-line mewah.", category }
    ];
  }
  if (norm.includes("kecantikan") || norm.includes("skincare") || norm.includes("kosmetik")) {
    return [
      { name: "Minyak Kemiri Bakar Penumbuh Rambut", price: 49000, description: "Minyak kemiri asli yang diolah secara dibakar tradisional untuk menstimulasi folikel rambut rusak.", category },
      { name: "Serum Glow & Radiant Niacinamide", price: 85000, description: "Serum pencerah kulit wajah dengan kandungan Niacinamide 10% dan ekstrak Centella Asiatica.", category }
    ];
  }
  if (norm.includes("kerajinan") || norm.includes("craft") || norm.includes("tangan") || norm.includes("seni")) {
    return [
      { name: "Patung Kayu Deformasi Bali Handmade", price: 125000, description: "Patung hiasan kayu jati berkualitas tinggi yang diukir secara manual oleh pengrajin lokal Bali.", category },
      { name: "Tas Anyaman Rotan Estetik", price: 95000, description: "Tas rotan selempang bundar etnik khas Indonesia Timur dengan tali kulit sapi asli.", category }
    ];
  }
  if (norm.includes("minuman") || norm.includes("kopi") || norm.includes("susu") || norm.includes("teh")) {
    return [
      { name: "Kopi Susu Premium Gula Aren 1L", price: 65000, description: "Espresso blend Arabica-Robusta racikan barista dicampur susu segar New Zealand dan sirup gula aren asli.", category },
      { name: "Matcha Latte Creamy Milenial", price: 22000, description: "Bubuk teh hijau matcha Jepang asli premium dicampur susu oat gurih manis pas.", category }
    ];
  }
  // Default fallback for custom categories
  return [
    { name: `Kerajinan Khas ${category}`, price: 45000, description: `Produk kerajinan unggulan kategori ${category} buatan lokal berkualitas tinggi.`, category },
    { name: `Aksesoris Eksklusif ${category}`, price: 25000, description: `Aksesoris premium pelengkap gaya hidup buatan lokal yang sangat elegan.`, category }
  ];
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const resolvedParams = await params;
  const action = resolvedParams.action;
  const body = await req.json();

  // ─── DATABASE CRUD OPERATIONS FOR PIXELSHOP ───
  if (action === "get-db-state") {
    try {
      const email = body.email || "default@pixelshop.com";
      let shop = await prisma.shop.findUnique({
        where: { userId: email },
        include: {
          products: true,
          contents: true,
          calendarEvents: true,
          achievements: true,
          aiSettings: true,
        }
      });

      if (!shop) {
        return NextResponse.json({ new_user: true });
      }

      return NextResponse.json({
        new_user: false,
        shopInfo: {
          shopName: shop.name,
          category: shop.category,
          description: shop.description || "",
          platforms: shop.platforms,
          brandVoice: shop.brandVoice,
          xp: shop.xp,
          level: shop.level,
          streak: shop.streak,
        },
        products: shop.products.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          description: p.description || "",
          category: p.category || "",
          imageUrl: p.imageUrl || ""
        })),
        contents: shop.contents.map((c: any) => ({
          id: c.id,
          toolType: c.toolType,
          content: c.content,
          platform: c.platform || "",
          tone: c.tone || "",
          isSaved: c.isSaved,
          timestamp: c.createdAt.toISOString()
        })),
        events: shop.calendarEvents.map((e: any) => ({
          id: e.id,
          title: e.title,
          date: e.scheduledDate.toISOString().split('T')[0],
          time: e.scheduledDate.toISOString().split('T')[1]?.substring(0, 5) || "12:00",
          platform: e.platform,
          status: e.status.toLowerCase()
        })),
        achievements: shop.achievements.map((a: any) => ({
          id: a.achievementKey,
          key: a.achievementKey,
          unlocked: true,
          unlockedAt: a.unlockedAt.toISOString()
        })),
        aiTrainer: shop.aiSettings ? {
          character: shop.aiSettings.aiCharacter === "expert" ? "Expert Advisor" : shop.aiSettings.aiCharacter === "hype" ? "Hype Master" : "Sahabat Jualan",
          favoriteWords: shop.aiSettings.favoriteWords.join(', '),
          avoidWords: shop.aiSettings.avoidWords.join(', '),
          formalityLevel: shop.aiSettings.formalityLevel,
          targetAge: shop.aiSettings.targetAge,
          targetLocation: shop.aiSettings.targetLocation,
          toneWarna: shop.aiSettings.toneWarna,
          sampleCaptions: shop.aiSettings.exampleCaptions
        } : null
      });
    } catch (e: any) {
      console.error("Error get-db-state (using graceful local fallback):", e);
      return NextResponse.json({ new_user: true, db_offline: true, error: e.message });
    }
  }

  if (action === "save-onboarding") {
    try {
      const email = body.email || "default@pixelshop.com";
      const { shopName, category, description, platforms, brandVoice, firstProduct } = body;

      const shop = await prisma.shop.upsert({
        where: { userId: email },
        update: {
          name: shopName,
          category,
          description,
          platforms,
          brandVoice,
          xp: 50,
          level: 1,
          streak: 1
        },
        create: {
          userId: email,
          name: shopName,
          category,
          description,
          platforms,
          brandVoice,
          xp: 50,
          level: 1,
          streak: 1
        }
      });

      // Clear existing products to prevent seeding duplicates
      await prisma.product.deleteMany({ where: { shopId: shop.id } });

      // Add user's first product if provided
      let createdProduct = null;
      if (firstProduct && firstProduct.name) {
        createdProduct = await prisma.product.create({
          data: {
            shopId: shop.id,
            name: firstProduct.name,
            price: Number(firstProduct.price) || 25000,
            description: "Produk pertama yang dikonfigurasi saat onboarding.",
            category: category
          }
        });
      }

      // Seeding tailored dummy products
      const dummyProducts = getDummyProducts(category);
      // If we added firstProduct, we only add one dummy product. Otherwise, we add both!
      const dummiesToCreate = firstProduct && firstProduct.name ? dummyProducts.slice(0, 1) : dummyProducts;

      for (const p of dummiesToCreate) {
        await prisma.product.create({
          data: {
            shopId: shop.id,
            name: p.name,
            price: p.price,
            description: p.description,
            category: p.category
          }
        });
      }

      // Initialize default AiSettings
      await prisma.aiSettings.upsert({
        where: { shopId: shop.id },
        update: {},
        create: {
          shopId: shop.id,
          aiCharacter: "sahabat",
          favoriteWords: ["Kak", "Bestie"],
          avoidWords: ["haram"],
          formalityLevel: 2,
          targetAge: "semua",
          targetLocation: "Indonesia",
          exampleCaptions: []
        }
      });

      return NextResponse.json({ success: true, shopId: shop.id, product: createdProduct });
    } catch (e: any) {
      console.error("Error save-onboarding:", e);
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  if (action === "save-trainer") {
    try {
      const email = body.email || "default@pixelshop.com";
      const { aiCharacter, favoriteWords, avoidWords, formalityLevel, targetAge, targetLocation, toneWarna, exampleCaptions } = body;

      const shop = await prisma.shop.findUnique({ where: { userId: email } });
      if (!shop) throw new Error("Shop not found");

      const dbCharacter = aiCharacter === "Expert Advisor" ? "expert" : aiCharacter === "Hype Master" ? "hype" : "sahabat";
      const favArray = typeof favoriteWords === "string" ? favoriteWords.split(',').map((w: string) => w.trim()).filter(Boolean) : [];
      const avoidArray = typeof avoidWords === "string" ? avoidWords.split(',').map((w: string) => w.trim()).filter(Boolean) : [];

      const trainer = await prisma.aiSettings.upsert({
        where: { shopId: shop.id },
        update: {
          aiCharacter: dbCharacter,
          favoriteWords: favArray,
          avoidWords: avoidArray,
          formalityLevel: Number(formalityLevel) || 2,
          targetAge,
          targetLocation,
          toneWarna: toneWarna || "emosional-hangat",
          exampleCaptions
        },
        create: {
          shopId: shop.id,
          aiCharacter: dbCharacter,
          favoriteWords: favArray,
          avoidWords: avoidArray,
          formalityLevel: Number(formalityLevel) || 2,
          targetAge,
          targetLocation,
          toneWarna: toneWarna || "emosional-hangat",
          exampleCaptions
        }
      });

      return NextResponse.json({ success: true, trainer });
    } catch (e: any) {
      console.error("Error save-trainer:", e);
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  if (action === "create-product") {
    try {
      const email = body.email || "default@pixelshop.com";
      const { name, price, description, category, imageUrl } = body;

      const shop = await prisma.shop.findUnique({ where: { userId: email } });
      if (!shop) throw new Error("Shop not found");

      const product = await prisma.product.create({
        data: {
          shopId: shop.id,
          name,
          price: Number(price),
          description,
          category,
          imageUrl
        }
      });

      return NextResponse.json({ success: true, product });
    } catch (e: any) {
      console.error("Error create-product:", e);
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  if (action === "update-product") {
    try {
      const { id, name, price, description, category, imageUrl } = body;

      const product = await prisma.product.update({
        where: { id },
        data: {
          name,
          price: Number(price),
          description,
          category,
          imageUrl
        }
      });

      return NextResponse.json({ success: true, product });
    } catch (e: any) {
      console.error("Error update-product:", e);
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  if (action === "delete-product") {
    try {
      const { id } = body;

      await prisma.product.delete({ where: { id } });

      return NextResponse.json({ success: true });
    } catch (e: any) {
      console.error("Error delete-product:", e);
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  if (action === "save-xp") {
    try {
      const email = body.email || "default@pixelshop.com";
      const { xp, level, streak } = body;

      await prisma.shop.update({
        where: { userId: email },
        data: { xp, level, streak }
      });

      return NextResponse.json({ success: true });
    } catch (e: any) {
      console.error("Error save-xp:", e);
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  if (action === "save-generated-content") {
    try {
      const email = body.email || "default@pixelshop.com";
      const { toolType, content, platform, tone, isSaved } = body;

      const shop = await prisma.shop.findUnique({ where: { userId: email } });
      if (!shop) throw new Error("Shop not found");

      const savedContent = await prisma.generatedContent.create({
        data: {
          shopId: shop.id,
          toolType,
          content,
          platform,
          tone,
          isSaved: isSaved || false
        }
      });

      return NextResponse.json({ success: true, content: savedContent });
    } catch (e: any) {
      console.error("Error save-generated-content:", e);
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  if (action === "delete-generated-content") {
    try {
      const { id } = body;
      await prisma.generatedContent.delete({ where: { id } });
      return NextResponse.json({ success: true });
    } catch (e: any) {
      console.error("Error delete-generated-content:", e);
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing Gemini API Key");

    const ai = getAI();
    let prompt = "";
    let schema: any = {};

    switch (action) {
      case "generate-caption":
        prompt = `TUGAS UTAMA: Kamu adalah Asisten Pembuat Caption Jualan profesional untuk platform Indonesia.
Dari 1 input produk, hasilkan 3 variasi caption dengan emosi berbeda untuk platform yang dipilih.

SITUASI BRAND & TOKO:
- Nama Toko/Brand: ${body.shopName || 'PixelShop'}
- Kategori/Niche Bisnis: ${body.category || 'Sektor Retail'}
- Brand Voice Dasar: ${body.brandVoice || 'santai'}
- Karakter / Persona AI Anda: ${body.aiCharacter || 'Sahabat Jualan'}
- Kata Kunci Favorit (sesekali gunakan secara alami): [${body.favoriteWords || 'Kak, Bestie, Yuk'}]
- Kata Wajib Dihindari (SANGAT HARAM DIGUNAKAN): [${body.avoidWords || '-'}]
- Target Audiens Utama: ${body.targetAudience || 'Masyarakat Umum Indonesia'}

PRODUK YANG DIJUAL:
- Nama Produk: ${body.productName || 'Produk Unggulan'}
- Harga Produk: Rp ${body.price || 'Hubungi Kami'}
- Keterangan & Deskripsi Produk: ${body.productDesc || 'Kualitas premium terbaik'}
- Platform Distribusi Utama: ${body.platform || 'Instagram'}
- Nada / Tone Emosional Terpilih: ${body.tone || 'promo'} (Arahkan gaya penulisan secara dominan mengikuti panduan tone di bawah!)

PLATFORM YANG DIDUKUNG:
Instagram / TikTok / WhatsApp / Shopee

9 PILIHAN EMOSI YANG DIDUKUNG:
1. Skena → estetik, puitis, FOMO-driven
2. Gen Z → slang kekinian, singkat, no-filter
3. Emak-Emak WA → hangat, trust-building, solusi harian
4. Luxury → eksklusif, aspirasional, premium feel
5. Storytelling → narasi mini, hook kuat, emotional arc
6. Hype Drop → limited urgency, countdown vibes
7. Edukatif → fakta + manfaat, konten bernilai
8. Relatable Meme → humor ringan, self-aware
9. Hard Selling → CTA langsung, promo frontal

ATURAN DAN FORMAT:
- Selalu sertakan minimal 1 CTA konversi (DM, klik link, order sekarang, dll.)
- Sesuaikan panjang dengan platform (TikTok lebih pendek, IG bisa lebih panjang)
- Gunakan hook 3 detik di baris pertama untuk TikTok
- Caption 1 harus bernada Soft Selling (bangun desire dulu).
- Caption 2 harus bernada Hard Selling (CTA langsung di atas).
- Carousel slide text harus memandu audiens dengan visual script per slide.

Format JSON yang Wajib Diisi:
{
  "captions": [ "Versi A (Soft Selling): ...", "Versi B (Hard Selling): ...", "Versi C (Alternatif Kreatif): ..." ],
  "carousel": [ { "slide": 1, "text": "...", "notes": "..." }, { "slide": 2, "text": "...", "notes": "..." }, { "slide": 3, "text": "...", "notes": "..." } ],
  "ctas": [ { "type": "urgency", "text": "..." }, { "type": "benefit", "text": "..." }, { "type": "scarcity", "text": "..." } ],
  "hashtags": [ "#Hashtag1", "#Hashtag2", "#Hashtag3", "#Hashtag4", "#Hashtag5" ],
  "hooks": [ { "type": "controversial", "text": "..." }, { "type": "question", "text": "..." }, { "type": "empathy", "text": "..." } ],
  "abTesting": { "versionA": "...", "versionB": "..." }
}`;
        schema = {
          type: Type.OBJECT,
          properties: {
            captions: { type: Type.ARRAY, items: { type: Type.STRING } },
            carousel: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { slide: { type: Type.INTEGER }, text: { type: Type.STRING }, notes: { type: Type.STRING } }, required: ["slide", "text", "notes"] } },
            ctas: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, text: { type: Type.STRING } }, required: ["type", "text"] } },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            hooks: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, text: { type: Type.STRING } }, required: ["type", "text"] } },
            abTesting: { type: Type.OBJECT, properties: { versionA: { type: Type.STRING }, versionB: { type: Type.STRING } }, required: ["versionA", "versionB"] }
          },
          required: ["captions", "carousel", "ctas", "hashtags", "hooks", "abTesting"]
        };
        break;

      case "generate-description":
        prompt = `TUGAS UTAMA: Kamu adalah Spesialis SEO Marketplace Indonesia yang paham algoritma pencarian Shopee, Tokopedia, dan TikTok Shop.
Buat deskripsi produk teroptimasi SEO lengkap dengan keyword research.

SITUASI BRAND & TOKO:
- Nama Toko/Brand: ${body.shopName || 'PixelShop'}
- Kategori/Niche Bisnis: ${body.category || 'Sektor Retail'}
- Target Platform Marketplace: ${body.marketplace || 'Tokopedia'}

PRODUK YANG DIJUAL:
- Nama Produk: ${body.productName || 'Produk Unggulan'}
- Harga Produk: Rp ${body.price || ''}
- Deskripsi Awal: ${body.productDesc || 'Kondisi baru kualitas terjamin'}

ATURAN SEO MARKETPLACE:
- JUDUL PRODUK (maks. 100 karakter) — format: [Keyword Utama] + [Benefit] + [Spesifikasi Singkat]
- DESKRIPSI UTAMA (300-500 kata):
   - Paragraf 1: Hook + manfaat utama (masukkan keyword utama di 50 kata pertama)
   - Paragraf 2-3: Fitur + keunggulan detail (hindari keyword stuffing, maks. 3x per keyword per 100 kata)
   - Paragraf 4: Social proof / cara penggunaan (gunakan kata tanya "cara, tips, manfaat, rekomendasi" untuk long-tail)
   - Paragraf 5: CTA + garansi/layanan
- BULLET POINT SPESIFIKASI (5-10 poin)
- KEYWORD LIST:
   - 5 keyword utama (volume tinggi)
   - 10 keyword panjang/long-tail (konversi tinggi)
   - 5 keyword kompetitor yang bisa disiasati
- TIPS PROMOSI PLATFORM-SPESIFIK (Shopee: prioritaskan pencarian lokal; TikTok Shop: bahasa percakapan/trending phrase; Tokopedia: reputasi & ulasan).

Format JSON yang Wajib Diisi:
{
  "description": "Tulis judul produk tebal di paling atas, diikuti deskripsi 300-500 kata yang terbagi rapi ke dalam 5 paragraf, lalu bullet point spesifikasi...",
  "keywords": [ "List 5 keyword utama", "List 10 long-tail keywords", "List 5 competitor keywords" ],
  "tips": "Tulis tips promosi platform-spesifik jitu..."
}`;
        schema = {
          type: Type.OBJECT,
          properties: { description: { type: Type.STRING }, keywords: { type: Type.ARRAY, items: { type: Type.STRING } }, tips: { type: Type.STRING } },
          required: ["description", "keywords", "tips"]
        };
        break;

      case "generate-content-plan":
        prompt = `TUGAS UTAMA: Kamu adalah Content Strategist E-Commerce yang ahli merancang konten mingguan dengan pendekatan funnel TOFU-MOFU-BOFU.
Buat 7 hari rencana konten kreatif yang seimbang antara edukatif, entertaining, dan selling untuk mempromosikan produk.

SITUASI BRAND & TOKO:
- Nama Toko/Brand: ${body.shopName || 'PixelShop'}
- Kategori/Niche Bisnis: ${body.category || 'Sektor Retail'}
- Brand Voice Dasar: ${body.brandVoice || 'santai'}

PRODUK YANG DIJUAL:
- Nama Produk: ${body.productName}
- Keterangan Produk: ${body.productDesc || 'Kualitas top'}

PRINSIP DISTRIBUSI KONTEN 7 HARI:
- Senin: Motivasi / edukatif (awareness)
- Selasa: Behind the scene / produk
- Rabu: Testimoni / social proof
- Kamis: Tutorial / tips penggunaan
- Jumat: Flash sale / promo (konversi)
- Sabtu: Hiburan / relatable content
- Minggu: Cerita brand / storytelling

JAM POSTING PEAK INDONESIA:
- Pagi: 07.00-09.00 (scroll pagi)
- Siang: 12.00-13.00 (istirahat kerja)
- Malam: 19.00-21.00 (prime time)

Format JSON yang Wajib Diisi:
{
  "plan": [
    {
      "day": "Senin",
      "title": "Judul Konten (hook kuat)",
      "format": "Format (e.g., Reels, Carousel, Live)",
      "time": "e.g., 07.30 WIB",
      "platform": "instagram",
      "concept": "Konsep Visual (deskripsi shot/desain)",
      "caption": "Caption Singkat (3-5 kalimat)"
    },
    ... (ulangi untuk Selasa s/d Minggu)
  ]
}`;
        schema = {
          type: Type.OBJECT,
          properties: {
            plan: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { day: { type: Type.STRING }, title: { type: Type.STRING }, format: { type: Type.STRING }, time: { type: Type.STRING }, platform: { type: Type.STRING }, concept: { type: Type.STRING }, caption: { type: Type.STRING } }, required: ["day", "title", "format", "time", "platform", "concept", "caption"] } }
          },
          required: ["plan"]
        };
        break;

      case "generate-chat-reply":
        prompt = `TUGAS UTAMA: Kamu adalah Asisten CS (Customer Service) E-Commerce Indonesia yang ramah, profesional, dan berorientasi solusi.

SITUASI BRAND & TOKO:
- Nama Toko/Brand: ${body.shopName || 'PixelShop'}
- Brand Voice: ${body.brandVoice || 'ceria'}

INPUT CHAT:
- Situasi/Konteks: ${body.situation || 'Tanya Stok'}
- Pesan/Konteks Tambahan: ${body.context || 'Ready stok terbatas'}

ATURAN GAYA BAHASA CS:
- Sapaan hangat + validasi perasaan pelanggan.
- Panggil pelanggan dengan "Kak" (netral, ramah).
- Gunakan kalimat aktif dan positif. Hindari "tidak bisa", "tidak mungkin" -> ganti dengan alternatif solusi.
- Maksimum 5 kalimat per balasan agar tidak membosankan di chat.
- Sertakan versi singkat/Quick Reply.

Format JSON yang Wajib Diisi:
{
  "replies": [
    "Balasan CS Lengkap: Pembuka ramah + solusi konkret + penutup CTA lembut + emoji natural",
    "VERSI SINGKAT (Quick Reply): Balasan super cepat..."
  ]
}`;
        schema = {
          type: Type.OBJECT,
          properties: { replies: { type: Type.ARRAY, items: { type: Type.STRING } } },
          required: ["replies"]
        };
        break;

      case "generate-competitor":
        prompt = `TUGAS UTAMA: Kamu adalah Business Analyst E-Commerce yang ahli dalam analisis kompetitif marketplace Indonesia.
Lakukan analisis kompetitor mendalam dan rumuskan strategi diferensiasi produk.

SITUASI BRAND & TOKO:
- Toko Kita: ${body.shopName || 'PixelShop'}
- Produk Kita: ${body.productName} (Keterangan: ${body.productDesc || 'Kualitas Premium'})
- Nama Kompetitor: ${body.competitorName || 'Kompetitor Pasar'}

OUTPUT ANALISIS:
- 5 UNIQUE SELLING POINT (USP) PRODUK KITA: format: [USP] + [Alasan Kompetitor Tidak Bisa Menandingi] + [Cara Komunikasikan ke Pelanggan]
- 3 celah utama kompetitor yang bisa dieksploitasi
- Segmen pelanggan yang belum dilayani kompetitor
- LANGKAH AKSI TAKTIS (30-60-90 hari): 30 hari quick wins, 60 hari content & review, 90 hari loyalty.

Format JSON yang Wajib Diisi:
{
  "usps": [
    "USP #1: Customisasi nama laser 24 jam. Kompetitor tidak bisa: Brand A mass-market tidak ada custom. Cara komunikasikan: 'Tumbler-mu, nama-mu — ready dalam 1 hari'",
    "USP #2: ...",
    "USP #3: ...",
    "USP #4: ...",
    "USP #5: ..."
  ],
  "marketingAngles": [
    "Celah Kompetitor #1: ...",
    "Celah Kompetitor #2: ...",
    "Celah Kompetitor #3: ..."
  ],
  "competitorWeakness": "Segmen pelanggan belum dilayani kompetitor: ...",
  "actionPlan": "AKSI TAKTIS:\\n- 30 Hari: ...\\n- 60 Hari: ...\\n- 90 Hari: ..."
}`;
        schema = {
          type: Type.OBJECT,
          properties: { usps: { type: Type.ARRAY, items: { type: Type.STRING } }, marketingAngles: { type: Type.ARRAY, items: { type: Type.STRING } }, competitorWeakness: { type: Type.STRING }, actionPlan: { type: Type.STRING } },
          required: ["usps", "marketingAngles", "competitorWeakness", "actionPlan"]
        };
        break;

      case "generate-preview-voice":
        prompt = `TUGAS UTAMA: Kamu adalah AI Brand Voice Trainer yang bertugas menguji dan mensimulasikan kepribadian unik toko dari data latih pemiliknya.

PROFIL IDENTITAS AI TOKO:
- Persona AI: ${body.character || 'Sahabat Jualan'}
- Kata Emas Toko (Wajib Muncul): [${body.favoriteWords || 'Kak'}]
- Kata Tabu (SANGAT HARAM DIGUNAKAN): [${body.avoidWords || '-'}]
- Level Formalitas (1-5): Level ${body.formalityLevel || 3}
- Tone Reaksi AI: ${body.toneWarna || 'emosional-hangat'} (emosional-hangat / rasional-informatif / hype-energetik)
- Target Audiens: Usia ${body.targetAge || 'dewasa muda'}, lokasi ${body.targetLocation || 'Indonesia'}

Tulis 1 paragraf sapaan promosi promosi jualan yang sangat representatif untuk memperkenalkan produk "Keripik Tempe Premium Gurih" dengan menerapkan secara penuh persona, nada bicara, kata emas, menghindari kata tabu, serta menyesuaikan level formalitas di atas.

Format JSON yang Wajib Diisi:
{
  "previewText": "..."
}`;
        schema = {
          type: Type.OBJECT,
          properties: { previewText: { type: Type.STRING } },
          required: ["previewText"]
        };
        break;
        
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const text = response.text || "";
    const parsed = JSON.parse(cleanJSONResponse(text));
    return NextResponse.json(parsed);

  } catch (err: any) {
    console.error("Gemini API Error for", action, ":", err.message);
    
    // Fallbacks if API key is missing or invalid
    if (action === "generate-caption") {
      return NextResponse.json({
        captions: [
          `🔥 **Outfit lu dibilang gitu-gitu aja? Menyala abangku!** 🔥\n\nKenalin nih *${body.productName || 'Hoodie Vintage'}*, andalan baru anak senja & skena biar tongkrongan makin chill. Siluet retro ala 90-an bikin aura lo langsung naik kelas! Kain fleece tebal tapi adem di kulit gakan bikin gatel bund.\n\n💰 Investasi kece: Rp ${body.price || '150.000'}\n🛍️ Slot Promo Terbatas! Klik link di bio buat order instan sekarang juga! ✨\n\n#SkenaStyle #AnakAnakSkena #VintageFashion #OOTDKampus #StreetwearIndo`,
          `📢 *BACA INI BIAR GAK KELIHATAN MATI GAYA DI KAMPUS!* 📢\n\nEmang boleh se-aesthetic ini? *${body.productName || 'Hoodie Vintage'}* dari *${body.shopName}* ini rill no fek kerennya! Nyaman dipake ngerjain tugas seharian, praktis, tinggal slup langsung slay.\n\nJangan sampe keduluan temen sekelas lo ya Bestie! Stok super tipis!\n📦 Amankan ukuranmu sekarang via DM kami!\n#BukanThriftBiasa #VintageVibe #GenerasiSlay`,
          `Bund, sikecil pengen hoodie modis tapi takut kemahalan? Tenang ajah! 🥰\n\n*${body.productName || 'Hoodie Vintage'}* kualitas butik harga pabrik pas banget buat nemenin sikecil ngampus atau nongkrong sehat. Jahitan super rapi, kain lembut gak nerawang, gampang dicuci bersih.\n\nBeli hari ini ada gratis kupon ongkir ke seluruh Indonesia! Klik hubungi kami yuk say! ❤️\n#BundaHebat #CemilanPedas #ShoppingAnak #PixelShopPilihan`
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
          versionA: `✨ **Vintage is a Lifestyle** ✨\n\nAda cerita di setiap rajutan benangnya. Nikmati nostalgia era klasik perkuliahan tahun 90-an dengan kenyamanan prima dari *${body.productName || 'Hoodie Vintage'}*. Didesain dengan penuh kehangatan khas lokal untuk menemani mimpi-mimpi serumu di ruang kelas.\n\nKembaran outfit estetik bareng bestie yuk say! Hubungi kami dengan menekan tombol pesan sekarang ya. ☕❤️`,
          versionB: `🚨 **SIAPA CEPAT DIA DAPAT! DISKON SPECIAL BATCH AKHIR BULAN!** 🚨\n\nJangan kaget ya kalau semua mata tertuju ke lo! *${body.productName || 'Hoodie Vintage'}* original skerma vintage rill premium diskon gila-gilaan khusus 15 pembeli pertama.\n\nHarga rill bersahabat! Jangan nyesel kalau besok kehabisan karena postingan ini viral! Klik beli sekarang juga! ⚡🛒`
        },
        _fallback: true
      });
    } else if (action === "generate-description") {
      return NextResponse.json({
        description: `📝 **DESKRIPSI LENGKAP ${body.productName?.toUpperCase() || 'PRODUK'}**\n\nSelamat datang di toko resmi **${body.shopName || 'Kami'}**! Kami menyediakan produk berkualitas tinggi langsung ke tangan Anda.\n\n${body.productDesc || 'Produk premium didesian khusus untuk memenuhi kebutuhan harian Anda secara maksimal. Lebih awet, modis, dan terjamin.'}\n\n✨ **KEUNGGULAN PRODUK:**\n- Kualitas Bahan Premium & Tahan Lama\n- Desain ergonomis dan estetik sesuai tren terbaru\n- Sangat praktis untuk digunakan sehari-hari\n- Harga super kompetitif, sebanding dengan kepuasan!\n\n📋 **SPESIFIKASI DETAIL:**\n- Nama Produk: ${body.productName}\n- Harga: Rp ${body.price || 'Hubungi CS'}\n- Varian: Standard Edition / Warna Menarik\n- Garansi: Cacat produksi siap ganti baru!\n\n📦 **ISI PAKET:**\n- 1x Unit ${body.productName}\n- Kotak Kemasan Eksklusif & Bubble Wrap Tebal\n\n*Catatan: Harap rekam video unboxing demi kelancaran proses klaim garansi jika terjadi kendala pengiriman.*`,
        keywords: [ `${body.productName?.toLowerCase() || 'produk'} murah`, `${body.category?.toLowerCase() || 'umkm'} indonesia`, `beli ${body.productName?.toLowerCase() || 'produk'}` ],
        tips: `Gunakan foto beresolusi tinggi dengan latar belakang putih polos. Cantumkan juga info stok terupdate pada varian rasa/warna produk ${body.productName} agar pelanggan tidak ragu bertransaksi di ${body.marketplace}! ✨`,
        _fallback: true
      });
    } else if (action === "generate-content-plan") {
      return NextResponse.json({
        plan: [
          { day: "Senin", title: "Product Intro", format: "Instagram Reels", time: "11:30", platform: "instagram", concept: "Tunjukkan unboxing estetik produk dengan background musik tren", caption: "Akhirnya rahasia terkuak! Kenalin produk baru andalan kita nih." },
          { day: "Selasa", title: "Problem-Solving", format: "TikTok Video Short", time: "19:00", platform: "tiktok", concept: "Tampilkan keresahan pelanggan lalu solusi instan dengan memakai produk kita", caption: "Siapa yang sering ngalamin gini juga? Ini solusinya kok gampang banget." }
        ],
        _fallback: true
      });
    } else if (action === "generate-chat-reply") {
      return NextResponse.json({
        replies: [
          `Halo Kak! Terima kasih sudah menghubungi kami. 😍 Kabar gembira, untuk produk tersebut saat ini READY ya Kak, namun stoknya sangat menipis karena banyak peminat. Supaya kebagian, yuk langsung diproses orderannya hari ini! Ada lagi yang bisa kami bantu?`,
          `Hai Bestie! Produk idamanmu ready stok lho! Tapi cepet banget gonta-ganti nih karena lagi banyak yang borong. Mending amankan pesanan kamu sekarang juga biar bisa ikut pengiriman hari ini ya. Terima kasih Kak! ❤️`
        ],
        _fallback: true
      });
    } else if (action === "generate-competitor") {
      return NextResponse.json({
        usps: [
          `Kualitas bahan baku produk kita jauh lebih premium, higienis, dan teruji kualitasnya dibanding produk ${body.competitorName}.`,
          `Pelayanan purna jual (customer service) kita sangat responsif dengan layanan klaim garansi retur instan tanpa dipersulit.`
        ],
        marketingAngles: [
          `*Angle Anti Zonk:* Fokus mengedukasi pembeli bahwa harga murah dari ${body.competitorName} seringkali mengorbankan kualitas dan kebersihan yang merugikan.`
        ],
        competitorWeakness: `Kompetitor cenderung memiliki waktu respons chat yang lambat dan kemasan kirim seadanya sehingga berisiko rusak selama proses ekspedisi di kurir logistik.`,
        actionPlan: `Tingkatkan respons chat di bawah 5 menit, sertakan kartu garansi unboxing berdesain cantik di setiap paket pesanan, dan tonjolkan ulasan positif bintang lima di visual landing page jualan Anda.`,
        _fallback: true
      });
    } else if (action === "generate-preview-voice") {
      return NextResponse.json({
        previewText: `Halo Kakak sayang! 🥰 Capek banget ya seharian aktivitas? Yuk santai sejenak ditemani renyahnya "Keripik Tempe Premium Gurih" andalan toko kita. Rasanya gurih pas banget, pas buat nyemil santai bareng bestie. Cobain yuk Kak, dijamin rasanya mau lagi dan lagi! 😍✨`,
        _fallback: true
      });
    }

    return NextResponse.json({ error: "Fallback failed" }, { status: 500 });
  }
}

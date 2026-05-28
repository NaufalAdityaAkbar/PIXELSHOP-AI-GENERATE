import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

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

export async function POST(req: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const resolvedParams = await params;
  const action = resolvedParams.action;
  const body = await req.json();

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing Gemini API Key");

    const ai = getAI();
    let prompt = "";
    let schema: any = {};

    switch (action) {
      case "generate-caption":
        prompt = `Role: Kamu adalah Master Copywriter & Senior Growth Marketing Strategist UMKM Indonesia yang sangat handal, viral, dan bercita-rasa tinggi ("gacor"). Tugas utama kamu adalah memformulasikan copywriting jualan/promosi dengan nilai konversi tinggi (high conversion), memaksimalkan retensi pembaca, serta menyisipkan pemicu psikologis yang menggerakkan audiens lokal untuk segera bertransaksi.
=========================================
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
- Panjang Output: ${body.length || 'sedang'}
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
  "captions": [ "Tulis Variasi Caption 1...", "Tulis Variasi Caption 2...", "Tulis Variasi Caption 3..." ],
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
        prompt = `Kamu adalah spesialis copywriter SEO Marketplace Indonesia. Toko: ${body.shopName || 'PixelShop'} | Kategori: ${body.category || 'Sektor Retail'}\nKarakter AI: ${body.aiCharacter || 'Expert Advisor'}\nBuat deskripsi produk yang menarik, lengkap, terstruktur, dan SEO-friendly untuk Marketplace ${body.marketplace || 'Tokopedia'}.\nNama Produk: ${body.productName || 'Produk Unggulan'}\nHarga: Rp ${body.price || ''}\nDeskripsi Awal: ${body.productDesc || 'Kondisi baru kualitas terjamin'}\nSEO Friendly Keywords toggle: ${body.seoFriendly ? 'Aktif' : 'Non-aktif'}\nKamu HARUS mengembalikan respon dalam format JSON presisi sebagai berikut:\n{\n  "description": "konten deskripsi lengkap...",\n  "keywords": ["keyword1", "keyword2", "keyword3"],\n  "tips": "tips promosi jitu..."\n}`;
        schema = {
          type: Type.OBJECT,
          properties: { description: { type: Type.STRING }, keywords: { type: Type.ARRAY, items: { type: Type.STRING } }, tips: { type: Type.STRING } },
          required: ["description", "keywords", "tips"]
        };
        break;

      case "generate-content-plan":
        prompt = `Kamu adalah Digital Marketing Specialist kawakan untuk UMKM Indonesia.\nToko: ${body.shopName || 'PixelShop'} | Kategori: ${body.category || 'Sektor Retail'}\nProduk unggulan: ${body.productName} (Keterangan: ${body.productDesc || 'Kualitas top'})\nBrand Voice: ${body.brandVoice || 'santai'}\nRancang rencana kerja pemasaran konten mingguan (7 hari) untuk mempromosikan produk tersebut.\nKamu HARUS memberikan respon format JSON yang terstruktur persis sebagai berikut:\n{\n  "plan": [\n    { "day": "Senin", "title": "...", "format": "...", "time": "...", "platform": "...", "concept": "...", "caption": "..." }\n  ]\n}`;
        schema = {
          type: Type.OBJECT,
          properties: {
            plan: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { day: { type: Type.STRING }, title: { type: Type.STRING }, format: { type: Type.STRING }, time: { type: Type.STRING }, platform: { type: Type.STRING }, concept: { type: Type.STRING }, caption: { type: Type.STRING } }, required: ["day", "title", "format", "time", "platform", "concept", "caption"] } }
          },
          required: ["plan"]
        };
        break;

      case "generate-chat-reply":
        prompt = `Kamu adalah Customer Service Representative yang ramah, sopan, persuasif, dan sigap untuk toko ${body.shopName || 'PixelShop'}.\nBrand voice: ${body.brandVoice || 'ceria'}\nBuat 2 variasi teks balasan chat yang singkat namun informatif untuk situasi berikut:\nSituasi: ${body.situation || 'Tanya Stok'}\nKonteks Tambahan (opsional): ${body.context || 'Sedang ready stok terbatas'}\nKamu HARUS mengembalikan respon dalam format JSON presisi sebagai berikut:\n{\n  "replies": ["variasi 1", "variasi 2"]\n}`;
        schema = {
          type: Type.OBJECT,
          properties: { replies: { type: Type.ARRAY, items: { type: Type.STRING } } },
          required: ["replies"]
        };
        break;

      case "generate-competitor":
        prompt = `Kamu adalah Corporate Business Strategist, Analyst, & Copywriting Master yang membantu UMKM lokal Indonesia naik kelas.\nKita: Toko ${body.shopName || 'PixelShop'} | Produk Kita: ${body.productName} (Keterangan: ${body.productDesc || 'Kualitas Premium'})\nKompetitor: ${body.competitorName || 'Kompetitor Pasar'}\nBandingkan keunggulan produk kita dan formulasikan Unique Selling Point (USP) yang menonjol serta taktik marketing yang khas.\nKamu HARUS memberikan respon format JSON yang terstruktur persis sebagai berikut:\n{\n  "usps": ["1...", "2...", "3...", "4...", "5..."],\n  "marketingAngles": ["1...", "2...", "3..."],\n  "competitorWeakness": "...",\n  "actionPlan": "..."\n}`;
        schema = {
          type: Type.OBJECT,
          properties: { usps: { type: Type.ARRAY, items: { type: Type.STRING } }, marketingAngles: { type: Type.ARRAY, items: { type: Type.STRING } }, competitorWeakness: { type: Type.STRING }, actionPlan: { type: Type.STRING } },
          required: ["usps", "marketingAngles", "competitorWeakness", "actionPlan"]
        };
        break;

      case "generate-preview-voice":
        prompt = `Simulasikan performa AI Assistant Toko dengan identitas baru ini:\nKarakter: ${body.character || 'Sahabat Jualan'}\nKata favorit pedagang: ${body.favoriteWords || 'Kak'}\nKata wajib dihindari: ${body.avoidWords || '-'}\nFormality Level: ${body.formalityLevel || 3}/5\nTarget Pembeli: Usia ${body.targetAge || 'dewasa muda'}, lokasi ${body.targetLocation || 'Indonesia'}\nTulis sapaan promosi super singkat (1 paragraf santai Bahasa Indonesia) yang merefleksikan pengaturan brand voice tersebut untuk mempromosikan produk dummy "Keripik Tempe Premium Gurih".\nKembalikan respon JSON:\n{\n  "previewText": "..."\n}`;
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

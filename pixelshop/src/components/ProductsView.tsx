/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Edit,
  Trash2,
  Sparkles,
  ShoppingBag,
  Filter,
  DollarSign,
  Briefcase,
  HelpCircle,
  Tag,
  CheckCircle,
  X,
  Upload,
  FileText,
  AlertCircle,
  Download,
  Info
} from 'lucide-react';
import { Product, PageId } from '../types';
import { formatPriceIDR } from '../utils';

interface ProductsViewProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onSelectProductForTool: (product: Product, targetTool: PageId) => void;
}

// Custom resilient CSV parser
function parseCSV(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(current.trim());
      current = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(current.trim());
      if (row.length > 0 && !(row.length === 1 && row[0] === '')) {
        result.push(row);
      }
      row = [];
      current = '';
    } else {
      current += char;
    }
  }
  
  if (current || row.length > 0) {
    row.push(current.trim());
    result.push(row);
  }
  return result;
}

interface ParsedProductPreview {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestedName?: string;
  suggestedPrice?: number;
  suggestedCategory?: string;
}

export default function ProductsView({
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onSelectProductForTool
}: ProductsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Kuliner & Cemilan');
  const [description, setDescription] = useState('');

  // CSV Import States
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [importPreview, setImportPreview] = useState<ParsedProductPreview[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Categories list extracted dynamically
  const categories = ['Semua', ...Array.from(new Set(products.map((p) => p.category)))];

  const handleCSVProcess = (text: string) => {
    try {
      setImportError(null);
      setImportSuccess(null);
      const rows = parseCSV(text);
      if (rows.length < 2) {
        setImportError('File CSV kosong atau tidak memiliki data yang cukup (header + minimal 1 baris).');
        return;
      }

      // Read first row header fields lowercased
      const headers = rows[0].map((h) => h.toLowerCase().trim());

      // Find indices based on headers
      let nameIdx = headers.findIndex((h) => h.includes('nama') || h.includes('name') || h.includes('produk') || h.includes('barang'));
      let priceIdx = headers.findIndex((h) => h.includes('harga') || h.includes('price') || h.includes('jual') || h.includes('rp'));
      let categoryIdx = headers.findIndex((h) => h.includes('kategori') || h.includes('category') || h.includes('jenis'));
      let descIdx = headers.findIndex((h) => h.includes('deskripsi') || h.includes('description') || h.includes('ket') || h.includes('detail') || h.includes('spesifikasi'));

      // Sensible defaults if index is not mapped to header text name
      if (nameIdx === -1) nameIdx = 0;
      if (priceIdx === -1) priceIdx = 1 < headers.length ? 1 : -1;
      if (categoryIdx === -1) categoryIdx = 2 < headers.length ? 2 : -1;
      if (descIdx === -1) descIdx = 3 < headers.length ? 3 : -1;

      const previews: ParsedProductPreview[] = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length === 0 || (row.length === 1 && row[0] === '')) continue;

        // Clean values safely
        const rawName = nameIdx !== -1 && nameIdx < row.length ? row[nameIdx] : '';
        const rawPrice = priceIdx !== -1 && priceIdx < row.length ? row[priceIdx] : '';
        const rawCategory = categoryIdx !== -1 && categoryIdx < row.length ? row[categoryIdx] : '';
        const rawDesc = descIdx !== -1 && descIdx < row.length ? row[descIdx] : '';

        const nameValue = rawName.trim();
        const priceCleaned = rawPrice.replace(/[^0-9.-]/g, '');
        const hasDigits = /[0-9]/.test(priceCleaned);
        const priceValue = hasDigits ? parseFloat(priceCleaned) : NaN;
        let categoryValue = rawCategory.trim();
        const descValue = rawDesc.trim();

        const errors: string[] = [];
        const warnings: string[] = [];
        let isValid = true;
        let suggestedName = '';
        let suggestedPrice = 10000; // default Rp10k
        let suggestedCategory = 'Kuliner & Cemilan';

        // Check 1: Name validation
        if (!nameValue) {
          isValid = false;
          errors.push('Nama produk tidak terdefinisi (kolom kosong).');
          suggestedName = `Produk Baru (Baris ${i})`;
        }

        // Check 2: Price validation and parser assistance
        if (Number.isNaN(priceValue)) {
          isValid = false;
          errors.push('Format harga salah atau tidak bernilai angka.');
          suggestedPrice = 15000; // suggest a sensible micro-industry average fallback 15k IDR
        } else if (priceValue < 0) {
          warnings.push('Harga bernilai negatif. Disarankan dibulatkan ke Rp 0.');
          suggestedPrice = 0;
        }

        // Check 3: Check categories alignment
        const validCategories = [
          'Kuliner & Cemilan',
          'Fashion Muslim',
          'Kecantikan & Skincare',
          'Kerajinan & Craft',
          'Minuman Kekinian',
          'Lainnya'
        ];

        let matchedCat = validCategories.find(
          (vc) => vc.toLowerCase() === categoryValue.toLowerCase()
        );

        if (!matchedCat && categoryValue) {
          matchedCat = validCategories.find(
            (vc) => categoryValue.toLowerCase().includes(vc.toLowerCase()) || vc.toLowerCase().includes(categoryValue.toLowerCase())
          );
        }

        if (matchedCat) {
          categoryValue = matchedCat;
        } else {
          categoryValue = 'Kuliner & Cemilan';
          if (rawCategory.trim()) {
            warnings.push(`Kategori "${rawCategory}" tidak akurat / tidak terdaftar.`);
            suggestedCategory = 'Lainnya';
          }
        }

        previews.push({
          id: `preview-${i}-${Math.random().toString(36).substring(2, 7)}`,
          name: nameValue,
          price: Number.isNaN(priceValue) ? 0 : priceValue,
          category: categoryValue,
          description: descValue || 'Produk diimpor aman melalui CSV.',
          isValid,
          errors,
          warnings,
          suggestedName: suggestedName || undefined,
          suggestedPrice: Number.isNaN(priceValue) ? suggestedPrice : (priceValue < 0 ? suggestedPrice : undefined),
          suggestedCategory: !matchedCat && rawCategory.trim() ? suggestedCategory : undefined
        });
      }

      if (previews.length === 0) {
        setImportError('Tidak ada produk valid yang ditemukan dalam CSV. Pastikan kolom Nama terisi.');
      } else {
        setImportPreview(previews);
      }
    } catch (err: any) {
      setImportError(`Sistem gagal membaca CSV: ${err.message || 'Format tidak dikenal'}`);
    }
  };

  const updatePreviewRow = (id: string, field: keyof ParsedProductPreview, value: any) => {
    setImportPreview((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        const updated = { ...row, [field]: value };
        
        // Recalculate errors & validation state for this edited row
        const newErrors: string[] = [];
        const newWarnings: string[] = [];
        let rowIsValid = true;

        if (!updated.name.trim()) {
          rowIsValid = false;
          newErrors.push('Nama produk tidak terdefinisi (kolom kosong).');
        }

        const parsedPrice = parseFloat(String(updated.price));
        if (Number.isNaN(parsedPrice)) {
          rowIsValid = false;
          newErrors.push('Format harga salah atau tidak bernilai angka.');
        } else if (parsedPrice < 0) {
          newWarnings.push('Harga bernilai negatif.');
        }

        return {
          ...updated,
          price: Number.isNaN(parsedPrice) ? 0 : Math.max(0, parsedPrice),
          isValid: rowIsValid,
          errors: newErrors,
          warnings: newWarnings
        };
      })
    );
  };

  const autoFixRow = (id: string) => {
    setImportPreview((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        const fixedName = row.name.trim() || row.suggestedName || 'Produk Baru';
        const fixedPrice = typeof row.suggestedPrice === 'number' ? row.suggestedPrice : row.price;
        const fixedCategory = row.suggestedCategory || row.category;

        return {
          ...row,
          name: fixedName,
          price: fixedPrice,
          category: fixedCategory,
          isValid: true,
          errors: [],
          warnings: [],
          suggestedName: undefined,
          suggestedPrice: undefined,
          suggestedCategory: undefined
        };
      })
    );
  };

  const deletePreviewRow = (id: string) => {
    setImportPreview((prev) => prev.filter((row) => row.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setImportError('Tolong upload file dengan format .csv saja.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          handleCSVProcess(event.target.result);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setImportError('Tolong upload file dengan format .csv saja.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          handleCSVProcess(event.target.result);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleImportConfirm = () => {
    const validOnes = importPreview.filter((p) => p.isValid);
    if (validOnes.length === 0) {
      setImportError('Tidak ada produk valid untuk diimpor.');
      return;
    }

    validOnes.forEach((p) => {
      onAddProduct({
        name: p.name,
        price: p.price,
        category: p.category,
        description: p.description
      });
    });

    setImportSuccess(`Berhasil mengimpor ${validOnes.length} produk ke dalam katalog jualan Anda! 🎉`);
    setImportPreview([]);
    setIsImportOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerDownloadTemplate = () => {
    const csvContent = "Nama Produk,Harga,Kategori,Deskripsi\n" +
      "Basreng Jeruk Pedas,15000,Kuliner & Cemilan,Basreng krispi renyah melimpah bumbu daun jeruk pedas nampol.\n" +
      "Gamis Silk Premium,185000,Fashion Muslim,Gamis sutra elegan jahitan butik adem dipakai seharian.\n" +
      "Lulur Brightening Sakura,35000,Kecantikan & Skincare,Lulur pencerah ekstrak bunga sakura alami wangi semerbak.\n";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "template_katalog_pixelshop.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setCategory('Kuliner & Cemilan');
    setDescription('');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setPrice(String(p.price));
    setCategory(p.category);
    setDescription(p.description);
    setIsAddOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Tolong isi nama produk.');
      return;
    }
    const parsedPrice = Number(price) || 0;

    if (editingId) {
      onEditProduct({
        id: editingId,
        name,
        price: parsedPrice,
        category,
        description
      });
    } else {
      onAddProduct({
        name,
        price: parsedPrice,
        category,
        description
      });
    }
    setIsAddOpen(false);
  };

  const filteredProducts =
    selectedCategory === 'Semua'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Success or Instant notification toasts */}
      {importSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="p-4 rounded-xl border border-[#8AC98A]/30 bg-[#122212]/90 text-[#8AC98A] text-xs flex items-center gap-2.5 shadow-md"
        >
          <CheckCircle className="w-5 h-5 shrink-0 text-[#8AC98A]" />
          <span>{importSuccess}</span>
          <button onClick={() => setImportSuccess(null)} className="ml-auto text-[#8AC98A]/70 hover:text-[#8AC98A]">
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex flex-col space-y-0.5">
            <span className="font-script text-3xl text-brand-accent block select-none rotate-[-1deg] origin-left">Katalog Mandiri</span>
            <h1 className="text-2xl md:text-3xl font-serif font-medium text-brand-text tracking-tight flex items-center gap-2.5">
              <ShoppingBag className="text-brand-accent w-7 h-7" strokeWidth={1.5} /> Katalog Produk UMKM
            </h1>
          </div>
          <p className="text-xs text-brand-muted mt-1">
            Daftarkan produk Anda di bawah ini untuk memudahkan integrasi penulisan konten AI.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto self-stretch md:self-auto shrink-0">
          <button
            onClick={() => {
              setIsImportOpen(!isImportOpen);
              setImportError(null);
              setImportPreview([]);
            }}
            className={`px-5 py-3 rounded-lg flex items-center justify-center gap-2 border text-xs font-bold transition-all cursor-pointer ${
              isImportOpen
                ? 'bg-brand-accent/20 border-brand-accent text-brand-accent'
                : 'border-brand-border/40 hover:border-brand-accent/30 text-brand-muted bg-[#1c1410]/50'
            }`}
          >
            <Upload className="w-4 h-4" /> Bulk Import CSV
          </button>

          <button
            onClick={handleOpenAdd}
            className="btn-accent px-5 py-3 rounded-lg flex items-center gap-2 shadow-lg justify-center transition"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" /> Daftarkan Produk Baru
          </button>
        </div>
      </div>

      {/* COLLAPSIBLE BULK IMPORT WORKSPACE PANEL */}
      <AnimatePresence>
        {isImportOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-5 sm:p-6 border border-brand-accent/30 bg-[#211610]/40 rounded-2xl md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-brand-border/20 pb-4">
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-lg text-brand-text flex items-center gap-2">
                    <FileText className="text-brand-accent w-5 h-5" /> Import Produk Bulk (CSV)
                  </h3>
                  <p className="text-xs text-brand-muted">
                    Unggah file daftar stok Anda dalam format CSV untuk melipatgandakan katalog jualan seketika.
                  </p>
                </div>

                <button
                  onClick={triggerDownloadTemplate}
                  className="flex items-center gap-1 text-[11px] font-mono font-bold text-brand-accent hover:underline cursor-pointer bg-brand-accent/10 border border-brand-accent/25 px-3 py-1.5 rounded-lg"
                >
                  <Download className="w-3.5 h-3.5" /> Unduh Contoh CSV
                </button>
              </div>

              {/* Drag and Drop Zone Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 py-10 text-center cursor-pointer transition-all duration-150 relative ${
                  isDragging
                    ? 'border-brand-accent bg-brand-accent/10 scale-[1.01]'
                    : 'border-brand-border/50 hover:border-brand-accent/40 bg-[#1c1410]/40'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".csv"
                  onChange={handleFileChange}
                />
                <div className="space-y-3">
                  <div className="mx-auto w-12 h-12 bg-brand-accent/10 text-brand-accent rounded-full flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-text">
                      Seret & taruh file CSV Anda di sini, atau <span className="text-brand-accent">Pilih Berkas</span>
                    </p>
                    <p className="text-[11px] text-brand-muted mt-1">
                      Maksimal ukuran file 5MB. Kolom standar: Nama Produk, Harga, Kategori, Deskripsi
                    </p>
                  </div>
                </div>
              </div>

              {/* Error warning state text */}
              {importError && (
                <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{importError}</span>
                  <button onClick={() => setImportError(null)} className="ml-auto text-red-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Live matching preview Table Grid */}
              {importPreview.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-brand-accent uppercase tracking-widest font-bold flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" /> Hasil Pratinjau Pemetaan ({importPreview.length} Baris Produk)
                    </span>
                    <button
                      onClick={() => setImportPreview([])}
                      className="text-xs text-brand-muted hover:text-brand-text underline"
                    >
                      Bersihkan
                    </button>
                  </div>

                  <div className="border border-brand-border/40 rounded-xl overflow-hidden overflow-x-auto scrollbar-thin">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#1c1410] border-b border-brand-border/40 font-mono text-brand-muted uppercase text-[10px]">
                          <th className="p-3 w-1/4">Nama Produk</th>
                          <th className="p-3 w-1/6">Harga (Rp)</th>
                          <th className="p-3 w-1/5">Kategori</th>
                          <th className="p-3 w-1/4">Deskripsi/Detail</th>
                          <th className="p-3 text-center">Tindakan & Status Validasi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.map((item, idx) => {
                          const hasErrors = item.errors.length > 0;
                          const hasWarnings = item.warnings.length > 0;
                          
                          return (
                            <tr
                              key={item.id}
                              className={`border-b border-brand-border/20 transition-colors ${
                                hasErrors
                                  ? 'bg-red-500/10 hover:bg-red-500/15'
                                  : hasWarnings
                                  ? 'bg-amber-500/5 hover:bg-amber-500/10'
                                  : 'hover:bg-[#1c1410]/20'
                              }`}
                            >
                              {/* Name column with inline edit and recommendation helper */}
                              <td className="p-2.5">
                                <div className="space-y-1.5">
                                  <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => updatePreviewRow(item.id, 'name', e.target.value)}
                                    placeholder={item.suggestedName || 'Nama produk'}
                                    className={`w-full bg-[#1c1410]/80 border rounded-lg px-2.5 py-1.5 text-xs text-brand-text focus:outline-none ${
                                      hasErrors && !item.name.trim()
                                        ? 'border-red-500 focus:border-red-500 shadow-[0_0_4px_rgba(239,68,68,0.3)]'
                                        : 'border-brand-border/50 focus:border-brand-accent'
                                    }`}
                                  />
                                  {item.suggestedName && !item.name.trim() && (
                                    <button
                                      type="button"
                                      onClick={() => autoFixRow(item.id)}
                                      className="text-[10px] bg-brand-accent/10 border border-brand-accent/20 hover:bg-brand-accent/20 text-brand-accent rounded-md px-1.5 py-0.5 inline-flex items-center gap-1 font-sans font-bold transition"
                                    >
                                      💡 Saran: Gunakan "{item.suggestedName}"
                                    </button>
                                  )}
                                </div>
                              </td>

                              {/* Price column with inline input */}
                              <td className="p-2.5">
                                <div className="space-y-1.5">
                                  <input
                                    type="number"
                                    value={item.price || ''}
                                    onChange={(e) => updatePreviewRow(item.id, 'price', e.target.value)}
                                    placeholder="0"
                                    className="w-full bg-[#1c1410]/80 border border-brand-border/50 focus:border-brand-accent rounded-lg px-2.5 py-1.5 text-xs text-brand-text font-mono focus:outline-none"
                                  />
                                  {typeof item.suggestedPrice === 'number' && (hasErrors || hasWarnings) && (
                                    <button
                                      type="button"
                                      onClick={() => autoFixRow(item.id)}
                                      className="text-[10px] bg-brand-accent/10 border border-brand-accent/20 hover:bg-brand-accent/20 text-brand-accent rounded-md px-1.5 py-0.5 inline-flex items-center gap-1 font-sans font-bold transition"
                                    >
                                      💡 Perbaiki: Rp {item.suggestedPrice.toLocaleString('id-ID')}
                                    </button>
                                  )}
                                </div>
                              </td>

                              {/* Category selection selector */}
                              <td className="p-2.5">
                                <select
                                  value={item.category}
                                  onChange={(e) => updatePreviewRow(item.id, 'category', e.target.value)}
                                  className="w-full bg-[#1c1410]/80 border border-brand-border/50 focus:border-brand-accent rounded-lg px-2 py-1.5 text-xs text-brand-text focus:outline-none cursor-pointer"
                                >
                                  <option value="Kuliner & Cemilan">Kuliner & Cemilan</option>
                                  <option value="Fashion Muslim">Fashion Muslim</option>
                                  <option value="Kecantikan & Skincare">Kecantikan & Skincare</option>
                                  <option value="Kerajinan & Craft">Kerajinan & Craft</option>
                                  <option value="Minuman Kekinian">Minuman Kekinian</option>
                                  <option value="Lainnya">Lainnya</option>
                                </select>
                              </td>

                              {/* Description inline text edit */}
                              <td className="p-2.5">
                                <input
                                  type="text"
                                  value={item.description}
                                  onChange={(e) => updatePreviewRow(item.id, 'description', e.target.value)}
                                  className="w-full bg-[#1c1410]/80 border border-brand-border/50 focus:border-brand-accent rounded-lg px-2.5 py-1.5 text-xs text-brand-muted focus:outline-none"
                                />
                              </td>

                              {/* Errors, Warnings and Actions Column */}
                              <td className="p-2.5 text-center">
                                <div className="flex flex-col items-center justify-center gap-1.5">
                                  {/* Error list display labels */}
                                  {item.errors.map((errText, errIdx) => (
                                    <span key={errIdx} className="inline-flex items-center gap-1 text-[10px] text-red-400 font-mono bg-red-950/40 border border-red-900/40 px-2 py-0.5 rounded">
                                      ❌ {errText}
                                    </span>
                                  ))}

                                  {/* Warning list display labels */}
                                  {item.warnings.map((warnText, warnIdx) => (
                                    <span key={warnIdx} className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-mono bg-amber-950/40 border border-amber-900/30 px-2 py-0.5 rounded">
                                      ⚠️ {warnText}
                                    </span>
                                  ))}

                                  {/* Valid row confirmation stamp */}
                                  {!hasErrors && !hasWarnings && (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono bg-emerald-950/30 border border-emerald-900/30 px-2.5 py-0.5 rounded-full">
                                      <CheckCircle className="w-3 h-3 text-emerald-400" /> Siap diimpor
                                    </span>
                                  )}

                                  {/* Interactive Operations (Correction Trigger & Drop Action) */}
                                  <div className="flex items-center justify-center gap-2 mt-1">
                                    {(hasErrors || hasWarnings) && (
                                      <button
                                        type="button"
                                        onClick={() => autoFixRow(item.id)}
                                        className="text-[10px] text-brand-bg bg-brand-accent font-bold px-2 py-1 rounded hover:bg-brand-accent/90 transition cursor-pointer"
                                        title="Terapkan perbaikan otomatis yang disarankan"
                                      >
                                        Auto-Fix
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => deletePreviewRow(item.id)}
                                      className="text-[10px] text-red-400 border border-red-500/25 px-2 py-1 rounded hover:bg-red-500/10 transition cursor-pointer"
                                      title="Keluarkan produk dari daftar impor"
                                    >
                                      Hapus
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Submission Row */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-end items-stretch sm:items-center pt-4 border-t border-brand-border/20">
                    <button
                      onClick={() => setImportPreview([])}
                      className="px-4 py-2 bg-[#332518] hover:bg-brand-surface border border-brand-border/40 rounded-lg text-xs text-brand-muted"
                    >
                      Batalkan
                    </button>
                    <button
                      onClick={handleImportConfirm}
                      className="btn-accent px-6 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> Impor {importPreview.filter(p => p.isValid).length} Produk Sekarang
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full font-medium text-xs whitespace-nowrap transition cursor-pointer ${
              selectedCategory === cat
                ? 'bg-brand-accent text-brand-bg font-bold shadow-md'
                : 'border border-brand-border/40 text-brand-muted hover:border-brand-accent/30'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="glass-card p-12 text-center text-brand-muted space-y-3">
          <div className="text-5xl">🛍️</div>
          <h3 className="font-bold text-base text-brand-text">Belum ada produk terdaftar</h3>
          <p className="text-xs max-w-sm mx-auto">
            Daftarkan produk pertama jualan Anda agar langsung dapat dinikmati fitur caption & deskripsi otomatis.
          </p>
          <button
            onClick={handleOpenAdd}
            className="btn-accent px-4 py-2 rounded text-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Daftarkan Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="glass-card p-6 flex flex-col justify-between neumorph relative overflow-hidden group hover:border-brand-accent/40 transition duration-150"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-[10px] font-mono tracking-wide uppercase">
                    <Tag className="w-3 h-3" /> {p.category}
                  </span>

                  {/* Actions Button Panel */}
                  <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition duration-150">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 hover:bg-[#332518] hover:text-brand-accent rounded text-brand-muted transition cursor-pointer"
                      title="Edit Produk"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteProduct(p.id)}
                      className="p-1.5 hover:bg-red-500/10 hover:text-red-400 rounded text-brand-muted transition cursor-pointer"
                      title="Hapus Produk"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-brand-text group-hover:text-brand-accent transition duration-150">
                    {p.name}
                  </h3>
                  <div className="text-base font-black text-[#8AC98A] font-mono">
                    {formatPriceIDR(p.price)}
                  </div>
                </div>

                <p className="text-xs text-brand-muted leading-relaxed line-clamp-3">
                  {p.description || 'Tidak ada spesifikasi produk.'}
                </p>
              </div>

              {/* Instant Deep Link Tools Trigger */}
              <div className="mt-6 pt-4 border-t border-brand-border/30 flex flex-col sm:flex-row gap-3 sm:gap-2 justify-between items-stretch sm:items-center bg-[#1c1410]/20 -mx-6 -mb-6 p-4">
                <span className="text-[10px] font-mono text-brand-muted uppercase tracking-wider font-semibold">INTEGRASI AI:</span>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => onSelectProductForTool(p, 'caption_tool')}
                    className="flex-1 sm:flex-none px-3 py-1.5 bg-brand-accent/15 border border-brand-accent/30 hover:bg-brand-accent rounded text-[10px] text-brand-accent hover:text-brand-bg font-extrabold flex items-center justify-center gap-1 transition-all duration-150 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" /> Bikin Caption
                  </button>
                  <button
                    onClick={() => onSelectProductForTool(p, 'description_tool')}
                    className="flex-1 sm:flex-none px-3 py-1.5 bg-[#332518] border border-brand-border/40 hover:bg-brand-accent rounded text-[10px] text-brand-text hover:text-brand-bg font-extrabold flex items-center justify-center gap-1 transition-all duration-150 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" /> Deskripsi SEO
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Form Modal Dialog */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="glass-card neumorph p-5 sm:p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto relative z-10 border border-brand-accent/40 scrollbar-thin"
            >
              <div className="flex justify-between items-center border-b border-brand-border/30 pb-4 mb-6">
                <h3 className="font-serif font-medium text-lg text-brand-text flex items-center gap-2">
                  <ShoppingBag className="text-brand-accent w-5 h-5" />
                  {editingId ? 'Edit Produk' : 'Daftarkan Produk Baru'}
                </h3>
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="p-1 hover:bg-[#332518] rounded-full text-brand-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono tracking-widest text-[#B4753A] uppercase font-bold mb-1">
                    NAMA PRODUK / BARANG
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[#1c1410] border border-brand-border rounded px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-accent"
                    placeholder="Contoh: Basreng Krispi Daun Jeruk 250g"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono tracking-widest text-[#B4753A] uppercase font-bold mb-1">
                      HARGA JUAL (RP)
                    </label>
                    <input
                      type="number"
                      required
                      className="w-full bg-[#1c1410] border border-brand-border rounded px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-accent"
                      placeholder="Contoh: 15000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono tracking-widest text-[#B4753A] uppercase font-bold mb-1">
                      KATEGORI
                    </label>
                    <select
                      className="w-full bg-[#1c1410] border border-brand-border rounded px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-accent"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="Kuliner & Cemilan">Kuliner & Cemilan</option>
                      <option value="Fashion Muslim">Fashion Muslim</option>
                      <option value="Kecantikan & Skincare">Kecantikan & Skincare</option>
                      <option value="Kerajinan & Craft">Kerajinan & Craft</option>
                      <option value="Minuman Kekinian">Minuman Kekinian</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono tracking-widest text-[#B4753A] uppercase font-bold mb-1">
                    DESKRIPSI PRODUK / BAHAN / KHASIAT
                  </label>
                  <textarea
                    rows={4}
                    className="w-full bg-[#1c1410] border border-brand-border rounded px-3 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-accent"
                    placeholder="Tuliskan spesifikasi produk, keunggulan, rasa, bahan baku dan instruksi khusus..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-brand-border/20">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2 bg-[#332518] hover:bg-brand-surface border border-brand-border/40 rounded text-xs text-brand-muted"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn-accent px-5 py-2 rounded text-xs font-bold"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

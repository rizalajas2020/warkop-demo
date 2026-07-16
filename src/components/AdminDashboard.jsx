import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';
import { 
  ClipboardList, 
  QrCode, 
  TrendingUp, 
  ShoppingBag, 
  CheckCircle, 
  Clock, 
  Trash2, 
  Check, 
  X, 
  DollarSign, 
  Plus, 
  FileText,
  Eye,
  Download,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboard({ onBackToCustomer }) {
  // Tabs: 'orders', 'finance', 'qr-gen', 'menu-manage'
  const [activeTab, setActiveTab] = useState('orders');
  const [orderFilter, setOrderFilter] = useState('semua');
  
  // Custom Toast State
  const [toasts, setToasts] = useState([]);
  
  // State for orders (loaded from LocalStorage)
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('warkop_orders');
    return saved ? JSON.parse(saved) : [];
  });
  
  // State for menu (loaded from LocalStorage or menu.js fallback)
  const [menuItems, setMenuItems] = useState(() => {
    const saved = localStorage.getItem('warkop_menu');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((item) => ({
        ...item,
        stock: Number.isFinite(Number(item.stock)) ? Number(item.stock) : 50
      }));
    }
    return [];
  });

  // State for QR Generator
  const [qrTableInput, setQrTableInput] = useState('');
  const [generatedTables, setGeneratedTables] = useState(() => {
    const saved = localStorage.getItem('warkop_generated_tables');
    return saved ? JSON.parse(saved) : ['01', '02', '03', '05', '12'];
  });

  // State for Add Menu Item Form
  const [newMenu, setNewMenu] = useState({
    name: '',
    price: '',
    category: 'coffee',
    description: '',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=500&q=80',
    tag: '',
    rating: 4.8,
    stock: '50'
  });

  // State for financial entries
  const [financialEntries, setFinancialEntries] = useState(() => {
    const saved = localStorage.getItem('warkop_financial_entries');
    return saved ? JSON.parse(saved) : [];
  });

  const [newFinancialEntry, setNewFinancialEntry] = useState({
    type: 'income',
    title: '',
    amount: '',
    category: 'penjualan',
    note: ''
  });

  const [financePeriod, setFinancePeriod] = useState('bulanan');

  // Refs for tracking changes
  const ordersRef = useRef(orders);
  ordersRef.current = orders;

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Play chime synthesizer sound (Bell sound) using Web Audio API
  const playChimeSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Node 1
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gain1.gain.setValueAtTime(0, audioCtx.currentTime);
      gain1.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc1.start(audioCtx.currentTime);
      osc1.stop(audioCtx.currentTime + 0.5);

      // Node 2 (slightly higher, delayed)
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.12); // A5
      gain2.gain.setValueAtTime(0, audioCtx.currentTime + 0.12);
      gain2.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.17);
      gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.72);
      osc2.start(audioCtx.currentTime + 0.12);
      osc2.stop(audioCtx.currentTime + 0.72);
    } catch (e) {
      console.warn("AudioContext block by browser or failed to execute chime", e);
    }
  };

  // Real-time Order synchronization & polling
  useEffect(() => {
    // 1. Sync via storage event (between tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'warkop_orders') {
        const nextOrders = JSON.parse(e.newValue || '[]');
        if (nextOrders.length > ordersRef.current.length) {
          playChimeSound();
          showToast("Pesanan Baru Masuk!", "success");
        }
        setOrders(nextOrders);
      }
      if (e.key === 'warkop_menu') {
        setMenuItems(JSON.parse(e.newValue || '[]'));
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 2. Local Fallback Polling (updates every 2 seconds)
    const interval = setInterval(() => {
      const savedOrders = localStorage.getItem('warkop_orders');
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        if (parsed.length > ordersRef.current.length) {
          // Play sound if not the initial empty mount
          if (ordersRef.current.length > 0) {
            playChimeSound();
            showToast("Pesanan Baru Masuk!", "success");
          }
        }
        setOrders(parsed);
      }
      const savedMenu = localStorage.getItem('warkop_menu');
      if (savedMenu) {
        setMenuItems(JSON.parse(savedMenu));
      }
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Update lists in LocalStorage
  const updateOrdersInStorage = (nextOrders) => {
    setOrders(nextOrders);
    localStorage.setItem('warkop_orders', JSON.stringify(nextOrders));
  };

  // Order Action handlers
  const handleUpdateStatus = (orderId, newStatus) => {
    const nextOrders = orders.map((order) => {
      if (order.id === orderId) {
        showToast(`Pesanan ${orderId} diubah ke status: ${newStatus}`, 'success');
        return { ...order, status: newStatus };
      }
      return order;
    });
    updateOrdersInStorage(nextOrders);
  };

  const handleTogglePayment = (orderId) => {
    const nextOrders = orders.map((order) => {
      if (order.id === orderId) {
        const nextPayment = order.paymentStatus === 'Lunas' ? 'Belum Bayar' : 'Lunas';
        showToast(`Pesanan ${orderId} ditandai ${nextPayment}`, 'success');
        return { ...order, paymentStatus: nextPayment };
      }
      return order;
    });
    updateOrdersInStorage(nextOrders);
  };

  const handleDeleteOrder = (orderId) => {
    if (window.confirm(`Hapus data pesanan ${orderId}?`)) {
      const nextOrders = orders.filter((order) => order.id !== orderId);
      updateOrdersInStorage(nextOrders);
      showToast(`Pesanan ${orderId} dihapus dari data dashboard.`, 'warning');
    }
  };

  // QR Generator handlers
  const handleGenerateQR = (e) => {
    e.preventDefault();
    const tableNum = qrTableInput.trim();
    if (!tableNum) return;
    
    if (generatedTables.includes(tableNum)) {
      showToast(`QR Code untuk Meja ${tableNum} sudah ada.`, 'info');
      setQrTableInput('');
      return;
    }

    const nextTables = [...generatedTables, tableNum].sort((a, b) => parseInt(a) - parseInt(b));
    setGeneratedTables(nextTables);
    localStorage.setItem('warkop_generated_tables', JSON.stringify(nextTables));
    showToast(`QR Code Meja ${tableNum} berhasil dibuat!`, 'success');
    setQrTableInput('');
  };

  const handleDeleteTableQR = (tableNum) => {
    if (window.confirm(`Hapus QR Code Meja ${tableNum}?`)) {
      const nextTables = generatedTables.filter((t) => t !== tableNum);
      setGeneratedTables(nextTables);
      localStorage.setItem('warkop_generated_tables', JSON.stringify(nextTables));
      showToast(`QR Code Meja ${tableNum} dihapus.`, 'warning');
    }
  };

  const handleDownloadPNG = (tableNum) => {
    const svgEl = document.getElementById(`qr-svg-${tableNum}`);
    if (!svgEl) return;
    try {
      const svgString = new XMLSerializer().serializeToString(svgEl);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 500;
        canvas.height = 500;
        const ctx = canvas.getContext('2d');
        
        // 1. Draw themed dark background
        ctx.fillStyle = '#0f0f11'; // Dark warkop background color
        ctx.fillRect(0, 0, 500, 500);

        // 2. Draw border
        ctx.strokeStyle = '#d97706'; // Amber-600 border
        ctx.lineWidth = 8;
        ctx.strokeRect(15, 15, 470, 470);
        
        // 3. Draw header branding text
        ctx.fillStyle = '#d97706'; // Amber text
        ctx.font = 'bold 22px "Outfit", "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('WARKOP DIGITAL', 250, 55);
        
        // Subtitle text
        ctx.fillStyle = '#9ca3af'; // Gray-400
        ctx.font = '12px sans-serif';
        ctx.fillText('Pindai untuk Memesan Langsung dari Meja', 250, 80);
        
        // 4. Draw white QR container square for reliable scanning contrast
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(110, 110, 280, 280);
        
        // 5. Draw QR code image inside the white container
        ctx.drawImage(img, 125, 125, 250, 250);
        
        // 6. Draw Table Number text at the bottom
        ctx.fillStyle = '#d97706'; // Amber accent
        ctx.font = 'bold 32px "Outfit", "Inter", sans-serif';
        ctx.fillText('MEJA ' + tableNum, 250, 445);
        
        // Convert to PNG data URL
        const pngUrl = canvas.toDataURL('image/png');
        
        // Trigger download
        const dlLink = document.createElement('a');
        dlLink.href = pngUrl;
        dlLink.download = `qrcode_meja_${tableNum}.png`;
        document.body.appendChild(dlLink);
        dlLink.click();
        document.body.removeChild(dlLink);
        
        // Clean up memory
        URL.revokeObjectURL(blobURL);
        showToast(`QR Code Meja ${tableNum} berhasil diunduh (PNG 500px).`, 'success');
      };
      
      img.onerror = () => {
        showToast("Gagal mengonversi QR Code ke PNG", "warning");
      };

      img.src = blobURL;
    } catch (e) {
      showToast("Gagal mengunduh QR Code", "warning");
    }
  };

  // Menu management handlers
  const handleAddMenu = (e) => {
    e.preventDefault();
    if (!newMenu.name || !newMenu.price) {
      showToast("Nama dan harga menu wajib diisi!", "warning");
      return;
    }

    const priceNum = parseInt(newMenu.price);
    if (isNaN(priceNum)) {
      showToast("Harga menu harus berupa angka!", "warning");
      return;
    }

    const stockNum = parseInt(newMenu.stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      showToast("Stok menu harus berupa angka 0 atau lebih!", "warning");
      return;
    }

    const newMenuItem = {
      id: Date.now(),
      name: newMenu.name,
      price: priceNum,
      category: newMenu.category,
      description: newMenu.description || 'Tidak ada deskripsi.',
      image: newMenu.image,
      tag: newMenu.tag || undefined,
      rating: parseFloat(newMenu.rating) || 4.5,
      stock: stockNum
    };

    const nextMenu = [...menuItems, newMenuItem];
    setMenuItems(nextMenu);
    localStorage.setItem('warkop_menu', JSON.stringify(nextMenu));
    showToast(`Menu "${newMenuItem.name}" berhasil ditambahkan!`, 'success');
    
    // Reset Form
    setNewMenu({
      name: '',
      price: '',
      category: 'coffee',
      description: '',
      image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=500&q=80',
      tag: '',
      rating: 4.8,
      stock: '50'
    });
  };

  const handleUpdateMenuStock = (menuId, menuName) => {
    const targetItem = menuItems.find((item) => item.id === menuId);
    if (!targetItem) return;

    const nextStock = Number(targetItem.stock ?? 0);
    if (Number.isNaN(nextStock) || nextStock < 0) {
      showToast(`Stok untuk "${menuName}" tidak valid.`, 'warning');
      return;
    }

    const nextMenu = menuItems.map((item) =>
      item.id === menuId ? { ...item, stock: nextStock } : item
    );
    setMenuItems(nextMenu);
    localStorage.setItem('warkop_menu', JSON.stringify(nextMenu));
    showToast(`Stok "${menuName}" diperbarui menjadi ${nextStock}.`, 'success');
  };

  const handleDeleteMenu = (menuId, menuName) => {
    if (window.confirm(`Hapus menu "${menuName}"? Pelanggan tidak akan bisa memesan item ini lagi.`)) {
      const nextMenu = menuItems.filter((item) => item.id !== menuId);
      setMenuItems(nextMenu);
      localStorage.setItem('warkop_menu', JSON.stringify(nextMenu));
      showToast(`Menu "${menuName}" telah dihapus.`, 'warning');
    }
  };

  const handleAddFinancialEntry = (e) => {
    e.preventDefault();
    if (!newFinancialEntry.title || !newFinancialEntry.amount) {
      showToast('Judul dan nominal keuangan wajib diisi!', 'warning');
      return;
    }

    const amountNum = parseFloat(newFinancialEntry.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast('Nominal harus berupa angka lebih dari nol.', 'warning');
      return;
    }

    const entryDate = new Date();
    const entry = {
      id: Date.now(),
      type: newFinancialEntry.type,
      title: newFinancialEntry.title.trim(),
      amount: amountNum,
      category: newFinancialEntry.category,
      note: newFinancialEntry.note.trim(),
      date: entryDate.toISOString(),
      displayDate: entryDate.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    };

    const nextEntries = [entry, ...financialEntries];
    setFinancialEntries(nextEntries);
    localStorage.setItem('warkop_financial_entries', JSON.stringify(nextEntries));
    showToast(
      newFinancialEntry.type === 'income'
        ? `Pemasukan "${entry.title}" berhasil dicatat.`
        : `Pengeluaran "${entry.title}" berhasil dicatat.`,
      'success'
    );

    setNewFinancialEntry({
      type: 'income',
      title: '',
      amount: '',
      category: 'penjualan',
      note: ''
    });
  };

  const handleDeleteFinancialEntry = (entryId) => {
    if (window.confirm('Hapus catatan keuangan ini?')) {
      const nextEntries = financialEntries.filter((entry) => entry.id !== entryId);
      setFinancialEntries(nextEntries);
      localStorage.setItem('warkop_financial_entries', JSON.stringify(nextEntries));
      showToast('Catatan keuangan berhasil dihapus.', 'warning');
    }
  };

  // Statistics calculation
  const totalRevenue = orders
    .filter(o => o.status === 'Selesai' || o.paymentStatus === 'Lunas')
    .reduce((sum, o) => sum + o.total, 0);

  const getDateKey = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString().slice(0, 10);
  };

  const getPeriodLabel = (entryDate) => {
    const date = new Date(entryDate);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const week = Math.ceil(day / 7);

    if (financePeriod === 'harian') return `${day}/${month}/${year}`;
    if (financePeriod === 'mingguan') return `Minggu ${week} ${new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString('id-ID', { month: 'short' })}`;
    if (financePeriod === 'tahunan') return `${year}`;
    return `${month}/${year}`;
  };

  const filterEntriesByPeriod = (entry) => {
    if (!entry.date) return true;
    const entryDate = new Date(entry.date);
    if (Number.isNaN(entryDate.getTime())) return true;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();

    if (financePeriod === 'harian') {
      return entryDate.toDateString() === now.toDateString();
    }
    if (financePeriod === 'mingguan') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(today - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      return entryDate >= startOfWeek && entryDate <= endOfWeek;
    }
    if (financePeriod === 'tahunan') {
      return entryDate.getFullYear() === year;
    }
    return entryDate.getMonth() === month && entryDate.getFullYear() === year;
  };

  const filteredFinancialEntries = financialEntries.filter(filterEntriesByPeriod);

  const incomeFromEntries = filteredFinancialEntries
    .filter((entry) => entry.type === 'income')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const expensesFromEntries = filteredFinancialEntries
    .filter((entry) => entry.type === 'expense')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalIncome = totalRevenue + incomeFromEntries;
  const netBalance = totalIncome - expensesFromEntries;

  const financeCategories = ['penjualan', 'bahan', 'gaji', 'operasional', 'lainnya'];
  const financeCategoryLabels = {
    penjualan: 'Penjualan',
    bahan: 'Bahan',
    gaji: 'Gaji',
    operasional: 'Operasional',
    lainnya: 'Lainnya'
  };

  const financeChartData = financeCategories.map((category) => {
    const incomeEntries = filteredFinancialEntries.filter((entry) => entry.type === 'income' && entry.category === category);
    const expenseEntries = filteredFinancialEntries.filter((entry) => entry.type === 'expense' && entry.category === category);
    const incomeAmount = category === 'penjualan'
      ? totalRevenue + incomeEntries.reduce((sum, entry) => sum + entry.amount, 0)
      : incomeEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const expenseAmount = expenseEntries.reduce((sum, entry) => sum + entry.amount, 0);

    return {
      category,
      label: financeCategoryLabels[category],
      income: incomeAmount,
      expense: expenseAmount
    };
  });

  const chartMax = Math.max(
    ...financeChartData.map((item) => Math.max(item.income, item.expense, 1)),
    1
  );

  const activeOrders = orders.filter(o => o.status !== 'Selesai');
  const completedOrdersCount = orders.filter(o => o.status === 'Selesai').length;
  const activeTablesCount = [...new Set(orders.filter(o => o.status !== 'Selesai').map(o => o.table))].length;

  // Filtered orders list
  const filteredOrders = orders.filter((order) => {
    // Inject default payment status if missing
    if (!order.hasOwnProperty('paymentStatus')) {
      order.paymentStatus = order.payment === 'qris' ? 'Lunas' : 'Belum Bayar';
    }
    
    if (orderFilter === 'semua') return true;
    if (orderFilter === 'diproses') return order.status === 'Diproses';
    if (orderFilter === 'disiapkan') return order.status === 'Disiapkan';
    if (orderFilter === 'selesai') return order.status === 'Selesai';
    return true;
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-[#0f0f11] text-gray-100 flex flex-col font-sans select-none antialiased">
      
      {/* Toast Notification Container */}
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-xs md:max-w-sm pointer-events-none px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-xl shadow-xl flex items-center justify-between border text-sm font-semibold pointer-events-auto animate-fade-in-down ${
              t.type === 'success' ? 'bg-[#10b981]/10 text-emerald-400 border-emerald-500/20' :
              t.type === 'warning' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
              'bg-[#16171d] text-gray-200 border-gray-800'
            }`}
          >
            <span>{t.message}</span>
            <button 
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              className="ml-3 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#0f0f11]/90 backdrop-blur-md border-b border-gray-800/80 px-4 py-3.5 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent m-0 select-none">
                Admin Warkop
              </h1>
              <p className="text-[10px] text-gray-500 m-0">Live Order Panel & QR Controller</p>
            </div>
          </div>

          <button
            onClick={onBackToCustomer}
            className="px-4 py-2 rounded-xl border border-gray-800 bg-[#16171d] text-gray-300 hover:text-amber-500 hover:border-amber-500/30 transition text-xs font-bold cursor-pointer"
          >
            Kembali ke Menu Pelanggan
          </button>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-8">
        
        {/* Statistics Panels */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue */}
          <div className="bg-[#16171d] border border-gray-800/80 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">Total Omset</span>
              <span className="text-base md:text-lg font-extrabold text-white">{formatPrice(totalRevenue)}</span>
            </div>
          </div>

          {/* Active Orders */}
          <div className="bg-[#16171d] border border-gray-800/80 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">Antrean Aktif</span>
              <span className="text-base md:text-lg font-extrabold text-white">{activeOrders.length} Pesanan</span>
            </div>
          </div>

          {/* Completed Orders */}
          <div className="bg-[#16171d] border border-gray-800/80 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">Pesanan Selesai</span>
              <span className="text-base md:text-lg font-extrabold text-white">{completedOrdersCount} Saji</span>
            </div>
          </div>

          {/* Active Tables */}
          <div className="bg-[#16171d] border border-gray-800/80 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">Meja Terlayani</span>
              <span className="text-base md:text-lg font-extrabold text-white">{activeTablesCount} Meja</span>
            </div>
          </div>
        </section>

        {/* Tab Selector */}
        <div className="border-b border-gray-800 flex items-center gap-4 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 font-bold text-sm border-b-2 px-1 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-amber-500 text-amber-500 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            Live Orders Feed ({activeOrders.length})
          </button>
          
          <button
            onClick={() => setActiveTab('finance')}
            className={`pb-3 font-bold text-sm border-b-2 px-1 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'finance'
                ? 'border-amber-500 text-amber-500 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            Laporan Keuangan
          </button>

          <button
            onClick={() => setActiveTab('qr-gen')}
            className={`pb-3 font-bold text-sm border-b-2 px-1 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'qr-gen'
                ? 'border-amber-500 text-amber-500 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            QR Code Meja
          </button>

          <button
            onClick={() => setActiveTab('menu-manage')}
            className={`pb-3 font-bold text-sm border-b-2 px-1 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'menu-manage'
                ? 'border-amber-500 text-amber-500 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            Kelola Daftar Menu
          </button>
        </div>

        {/* --- TAB CONTENT: LIVE ORDERS --- */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            
            {/* Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {[
                { id: 'semua', label: 'Semua Pesanan' },
                { id: 'diproses', label: 'Diproses' },
                { id: 'disiapkan', label: 'Disiapkan' },
                { id: 'selesai', label: 'Selesai' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setOrderFilter(f.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                    orderFilter === f.id
                      ? 'bg-amber-600 border-amber-600 text-white font-bold'
                      : 'bg-transparent border-gray-800 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Orders Feed */}
            {filteredOrders.length === 0 ? (
              <div className="text-center py-20 bg-[#16171d]/20 border border-gray-800/40 rounded-3xl">
                <AlertCircle className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-semibold">Tidak ada pesanan masuk dalam kategori ini.</p>
                <p className="text-gray-600 text-xs mt-1">Lakukan pemesanan di menu pelanggan untuk melihat data live!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...filteredOrders].reverse().map((order) => (
                  <div 
                    key={order.id}
                    className="bg-[#16171d] rounded-2xl border border-gray-800 p-4 space-y-4 hover:border-gray-700 transition flex flex-col justify-between"
                  >
                    
                    {/* Header: ID, Table, Status */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] text-gray-500 block uppercase font-black tracking-wider">Order ID</span>
                          <span className="text-sm font-extrabold text-gray-200">{order.id}</span>
                        </div>
                        
                        <div className="text-right">
                          <span className="text-[10px] text-gray-500 block uppercase font-black tracking-wider">Meja</span>
                          <span className="text-sm font-black text-amber-500">Meja {order.table}</span>
                        </div>
                      </div>

                      {/* Info Bar */}
                      <div className="flex items-center justify-between text-[11px] text-gray-500 bg-gray-950/40 rounded-lg px-2.5 py-1.5 border border-gray-800/30">
                        <span>Waktu: <strong className="text-gray-300">{order.timestamp}</strong></span>
                        <span className="uppercase">Metode: <strong className="text-gray-300">{order.payment}</strong></span>
                      </div>
                    </div>

                    {/* Ordered Items list */}
                    <div className="bg-[#0f0f11] rounded-xl p-3 space-y-2 border border-gray-850">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-xs flex justify-between items-start">
                          <div className="truncate pr-4 flex-1">
                            <span className="font-extrabold text-amber-500 mr-2">{item.quantity}x</span>
                            <span className="text-gray-200">{item.name}</span>
                            {item.note && (
                              <span className="block text-[10px] text-gray-500 italic mt-0.5 ml-6">
                                Catatan: "{item.note}"
                              </span>
                            )}
                          </div>
                          <span className="text-gray-400 font-bold">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                      
                      <div className="pt-2 border-t border-gray-800/60 flex justify-between items-center text-xs font-bold text-gray-200">
                        <span>Total Tagihan</span>
                        <span className="text-amber-500 font-extrabold text-sm">{formatPrice(order.total)}</span>
                      </div>
                    </div>

                    {/* Payment & Action Controls */}
                    <div className="space-y-3 pt-2 border-t border-gray-800/40">
                      
                      {/* Payment Status Switcher */}
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Status Pembayaran:</span>
                        <button
                          onClick={() => handleTogglePayment(order.id)}
                          className={`px-2.5 py-0.5 rounded font-black uppercase text-[10px] border cursor-pointer ${
                            order.paymentStatus === 'Lunas'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}
                        >
                          {order.paymentStatus || 'Belum Lunas'}
                        </button>
                      </div>

                      {/* Status Progress State */}
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Status Proses:</span>
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] border ${
                          order.status === 'Diproses' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          order.status === 'Disiapkan' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                          'bg-green-500/10 text-green-500 border-green-500/20'
                        }`}>
                          {order.status || 'Diproses'}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 pt-1">
                        {order.status === 'Diproses' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'Disiapkan')}
                            className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-xl text-xs transition cursor-pointer text-center"
                          >
                            Siapkan Pesanan
                          </button>
                        )}
                        {order.status === 'Disiapkan' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'Selesai')}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs transition cursor-pointer text-center"
                          >
                            Sajikan Ke Meja
                          </button>
                        )}
                        {order.status === 'Selesai' && (
                          <div className="flex-1 bg-gray-900 border border-gray-800 text-gray-500 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Selesai Disajikan
                          </div>
                        )}
                        
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-2 border border-gray-800 hover:border-red-500/30 hover:bg-red-500/5 text-gray-500 hover:text-red-400 rounded-xl transition cursor-pointer"
                          title="Hapus / Batalkan Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* --- TAB CONTENT: FINANCE REPORT --- */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#16171d] border border-gray-800/80 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500">Total Pemasukan</p>
                    <p className="text-lg font-extrabold text-white">{formatPrice(totalIncome)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#16171d] border border-gray-800/80 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500">Total Pengeluaran</p>
                    <p className="text-lg font-extrabold text-white">{formatPrice(expensesFromEntries)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#16171d] border border-gray-800/80 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500">Saldo Bersih</p>
                    <p className="text-lg font-extrabold text-white">{formatPrice(netBalance)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 space-y-6">
                <div className="bg-[#16171d] rounded-2xl border border-gray-800 p-6">
                  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
                    <div>
                      <h3 className="text-base font-bold text-gray-100 mb-1">Grafik Pendapatan & Pengeluaran</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Perbandingan arus kas berdasarkan kategori agar admin bisa melihat hasilnya dengan cepat.
                      </p>
                    </div>
                    <div className="text-[11px] text-gray-500">
                      <p>Omset aktif: <span className="text-emerald-500 font-bold">{formatPrice(totalRevenue)}</span></p>
                      <p>Catatan manual: <span className="text-amber-500 font-bold">{formatPrice(incomeFromEntries)}</span></p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {['harian', 'mingguan', 'bulanan', 'tahunan'].map((period) => (
                      <button
                        key={period}
                        onClick={() => setFinancePeriod(period)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                          financePeriod === period
                            ? 'bg-amber-600 border-amber-600 text-white'
                            : 'bg-transparent border-gray-800 text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        {period === 'harian' ? 'Harian' : period === 'mingguan' ? 'Mingguan' : period === 'bulanan' ? 'Bulanan' : 'Tahunan'}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.9fr] gap-4">
                    <div className="rounded-2xl bg-[#0f0f11] border border-gray-800 p-4">
                      <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-gray-500 mb-4">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Pemasukan</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Pengeluaran</span>
                      </div>

                      <div className="space-y-4">
                        {financeChartData.map((item) => (
                          <div key={item.category} className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-gray-400">
                              <span>{item.label}</span>
                              <span>{formatPrice(item.income + item.expense)}</span>
                            </div>
                            <div className="flex items-end gap-2 h-20">
                              <div className="flex-1 rounded-t-xl bg-emerald-500/20 relative" style={{ height: `${Math.max(12, (item.income / chartMax) * 100)}%` }}>
                                <div className="absolute inset-x-0 bottom-0 rounded-t-xl bg-emerald-500/70" style={{ height: '100%' }} />
                              </div>
                              <div className="flex-1 rounded-t-xl bg-red-500/20 relative" style={{ height: `${Math.max(12, (item.expense / chartMax) * 100)}%` }}>
                                <div className="absolute inset-x-0 bottom-0 rounded-t-xl bg-red-400/70" style={{ height: '100%' }} />
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-emerald-500">+{formatPrice(item.income)}</span>
                              <span className="text-red-400">-{formatPrice(item.expense)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#0f0f11] border border-gray-800 p-4">
                      <h4 className="text-sm font-bold text-gray-100 mb-3">Hasil Pendapatan & Pengeluaran</h4>
                      <div className="space-y-2">
                        {financeChartData.map((item) => (
                          <div key={`${item.category}-summary`} className="rounded-xl border border-gray-800/80 bg-[#16171d] p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-gray-200">{item.label}</span>
                              <span className={`text-sm font-extrabold ${item.income - item.expense >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                                {formatPrice(item.income - item.expense)}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500">
                              <span>Pendapatan: <strong className="text-emerald-500">{formatPrice(item.income)}</strong></span>
                              <span>Pengeluaran: <strong className="text-red-400">{formatPrice(item.expense)}</strong></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#16171d] rounded-2xl border border-gray-800 p-6 h-fit space-y-6">
                <div>
                  <h3 className="text-base font-bold text-gray-100 mb-1">Catat Pemasukan & Pengeluaran</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Kelola arus kas harian warkop dengan pencatatan yang tersimpan otomatis di browser.
                  </p>
                </div>

                <form onSubmit={handleAddFinancialEntry} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                        Jenis
                      </label>
                      <select
                        value={newFinancialEntry.type}
                        onChange={(e) => setNewFinancialEntry({ ...newFinancialEntry, type: e.target.value })}
                        className="w-full bg-[#0f0f11] text-xs border border-gray-800 rounded-lg px-2.5 py-2 focus:outline-none focus:border-amber-500 transition text-gray-300"
                      >
                        <option value="income">Pemasukan</option>
                        <option value="expense">Pengeluaran</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                        Kategori
                      </label>
                      <select
                        value={newFinancialEntry.category}
                        onChange={(e) => setNewFinancialEntry({ ...newFinancialEntry, category: e.target.value })}
                        className="w-full bg-[#0f0f11] text-xs border border-gray-800 rounded-lg px-2.5 py-2 focus:outline-none focus:border-amber-500 transition text-gray-300"
                      >
                        <option value="penjualan">Penjualan</option>
                        <option value="bahan">Bahan Baku</option>
                        <option value="gaji">Gaji</option>
                        <option value="operasional">Operasional</option>
                        <option value="lainnya">Lainnya</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Judul Catatan
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Penjualan hari ini"
                      value={newFinancialEntry.title}
                      onChange={(e) => setNewFinancialEntry({ ...newFinancialEntry, title: e.target.value })}
                      className="w-full bg-[#0f0f11] text-xs border border-gray-800 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 transition text-gray-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Nominal (Rupiah)
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="50000"
                      value={newFinancialEntry.amount}
                      onChange={(e) => setNewFinancialEntry({ ...newFinancialEntry, amount: e.target.value })}
                      className="w-full bg-[#0f0f11] text-xs border border-gray-800 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 transition text-gray-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Catatan Tambahan
                    </label>
                    <textarea
                      placeholder="Opsional, misalnya: belanja kopi, ada promo, dll."
                      value={newFinancialEntry.note}
                      onChange={(e) => setNewFinancialEntry({ ...newFinancialEntry, note: e.target.value })}
                      className="w-full bg-[#0f0f11] text-xs border border-gray-800 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 transition text-gray-300 h-20 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Catatan</span>
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-100">Riwayat Catatan Keuangan</h3>
                  <span className="text-[11px] text-gray-500">{financePeriod === 'harian' ? 'Hari ini' : financePeriod === 'mingguan' ? 'Minggu ini' : financePeriod === 'tahunan' ? 'Tahun ini' : 'Bulan ini'}</span>
                </div>

                {filteredFinancialEntries.length === 0 ? (
                  <div className="text-center py-16 bg-[#16171d]/20 border border-gray-800/40 rounded-3xl">
                    <AlertCircle className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm font-semibold">Belum ada catatan keuangan.</p>
                    <p className="text-gray-600 text-xs mt-1">Tambahkan pemasukan atau pengeluaran untuk memulai pencatatan.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-2">
                    {[...filteredFinancialEntries].map((entry) => (
                      <div
                        key={entry.id}
                        className="bg-[#16171d] border border-gray-800/80 rounded-xl p-3 flex items-start justify-between gap-4"
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-black ${
                              entry.type === 'income'
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {entry.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                            </span>
                            <span className="text-[10px] text-gray-500">{entry.category}</span>
                            <span className="text-[10px] text-gray-500">{entry.displayDate || entry.date}</span>
                          </div>
                          <h4 className="text-sm font-bold text-gray-200">{entry.title}</h4>
                          {entry.note && <p className="text-xs text-gray-500">{entry.note}</p>}
                        </div>

                        <div className="text-right">
                          <p className={`text-sm font-extrabold ${entry.type === 'income' ? 'text-emerald-500' : 'text-red-400'}`}>
                            {entry.type === 'income' ? '+' : '-'}{formatPrice(entry.amount)}
                          </p>
                          <button
                            onClick={() => handleDeleteFinancialEntry(entry.id)}
                            className="mt-2 p-2 border border-gray-850 hover:border-red-500/25 hover:bg-red-500/5 text-gray-500 hover:text-red-400 rounded-lg transition cursor-pointer"
                            title="Hapus Catatan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB CONTENT: QR CODE MEJA --- */}
        {activeTab === 'qr-gen' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: QR Generator Form */}
            <div className="bg-[#16171d] rounded-2xl border border-gray-800 p-6 h-fit space-y-6">
              <div>
                <h3 className="text-base font-bold text-gray-100 mb-1">Generate QR Code Meja</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Masukkan nomor meja baru untuk membuat QR Code unik yang akan mengarahkan pelanggan langsung ke menu meja tersebut.
                </p>
              </div>

              <form onSubmit={handleGenerateQR} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Nomor Meja Baru
                  </label>
                  <input
                    type="number"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    placeholder="Contoh: 08"
                    value={qrTableInput}
                    onChange={(e) => setQrTableInput(e.target.value)}
                    className="w-full bg-[#0f0f11] text-lg font-bold text-amber-500 text-center tracking-widest border border-gray-800 rounded-xl py-3 focus:outline-none focus:border-amber-500 transition"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 rounded-xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Generate QR Code</span>
                </button>
              </form>
            </div>

            {/* Right Column: Generated QR Codes Listing */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-base font-bold text-gray-100">Daftar QR Code Meja Terdaftar</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {generatedTables.map((tableNum) => {
                  const tableUrl = `${window.location.origin}/?table=${tableNum}`;
                  
                  return (
                    <div 
                      key={tableNum}
                      className="bg-[#16171d] border border-gray-800 rounded-2xl p-4 flex gap-4 items-center justify-between hover:border-gray-700 transition"
                    >
                      {/* Left: QR code visual container */}
                      <div className="bg-white p-2 rounded-lg flex-shrink-0 shadow-lg">
                        <QRCode 
                          id={`qr-svg-${tableNum}`}
                          value={tableUrl} 
                          size={90}
                          level="H"
                        />
                      </div>

                      {/* Right: Info & Actions */}
                      <div className="flex-1 flex flex-col justify-between h-full py-1">
                        <div>
                          <span className="text-sm font-extrabold text-gray-200 block">Meja {tableNum}</span>
                          <span className="text-[10px] text-gray-500 block truncate max-w-[160px]" title={tableUrl}>
                            {tableUrl}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => handleDownloadPNG(tableNum)}
                            className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded bg-gray-800 text-gray-300 hover:text-white border border-gray-700 hover:border-gray-600 transition cursor-pointer"
                            title="Unduh File QR (PNG 500px)"
                          >
                            <Download className="w-3 h-3" /> Unduh
                          </button>
                          
                          <button
                            onClick={() => handleDeleteTableQR(tableNum)}
                            className="p-1 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded transition cursor-pointer"
                            title="Hapus Meja"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* --- TAB CONTENT: MENU MANAGEMENT --- */}
        {activeTab === 'menu-manage' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Add Menu Form */}
            <div className="bg-[#16171d] rounded-2xl border border-gray-800 p-6 h-fit space-y-6">
              <div>
                <h3 className="text-base font-bold text-gray-100 mb-1">Tambah Menu Baru</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Isi formulir untuk menambahkan item baru ke daftar menu warkop pelanggan.
                </p>
              </div>

              <form onSubmit={handleAddMenu} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Nama Menu
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Kopi Aren Boba"
                    value={newMenu.name}
                    onChange={(e) => setNewMenu({ ...newMenu, name: e.target.value })}
                    className="w-full bg-[#0f0f11] text-xs border border-gray-800 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 transition text-gray-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Harga (Rupiah)
                    </label>
                    <input
                      type="number"
                      placeholder="Harga"
                      value={newMenu.price}
                      onChange={(e) => setNewMenu({ ...newMenu, price: e.target.value })}
                      className="w-full bg-[#0f0f11] text-xs border border-gray-800 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 transition text-gray-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Kategori
                    </label>
                    <select
                      value={newMenu.category}
                      onChange={(e) => setNewMenu({ ...newMenu, category: e.target.value })}
                      className="w-full bg-[#0f0f11] text-xs border border-gray-800 rounded-lg px-2.5 py-2 focus:outline-none focus:border-amber-500 transition text-gray-300"
                    >
                      <option value="coffee">Kopi</option>
                      <option value="non-coffee">Non-Kopi</option>
                      <option value="food">Makanan</option>
                      <option value="snack">Cemilan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Stok Awal
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="50"
                    value={newMenu.stock}
                    onChange={(e) => setNewMenu({ ...newMenu, stock: e.target.value })}
                    className="w-full bg-[#0f0f11] text-xs border border-gray-800 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 transition text-gray-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Label Tag (Opsional)
                  </label>
                  <select
                    value={newMenu.tag}
                    onChange={(e) => setNewMenu({ ...newMenu, tag: e.target.value })}
                    className="w-full bg-[#0f0f11] text-xs border border-gray-800 rounded-lg px-2.5 py-2 focus:outline-none focus:border-amber-500 transition text-gray-350"
                  >
                    <option value="">Tanpa Label</option>
                    <option value="Terlaris">Terlaris</option>
                    <option value="Rekomendasi">Rekomendasi</option>
                    <option value="Klasik">Klasik</option>
                    <option value="Favorit">Favorit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    URL Gambar (Unsplash/Mmock)
                  </label>
                  <input
                    type="url"
                    value={newMenu.image}
                    onChange={(e) => setNewMenu({ ...newMenu, image: e.target.value })}
                    className="w-full bg-[#0f0f11] text-xs border border-gray-800 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 transition text-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Deskripsi Singkat
                  </label>
                  <textarea
                    placeholder="Tuliskan komposisi atau info detail produk..."
                    value={newMenu.description}
                    onChange={(e) => setNewMenu({ ...newMenu, description: e.target.value })}
                    className="w-full bg-[#0f0f11] text-xs border border-gray-800 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 transition text-gray-300 h-20 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambahkan Item Menu</span>
                </button>
              </form>
            </div>

            {/* List Menu Items in Storage */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-base font-bold text-gray-100">Daftar Menu Aktif Warkop ({menuItems.length})</h3>
              
              <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-2">
                {menuItems.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-[#16171d] border border-gray-800/80 rounded-xl p-3 flex items-center justify-between gap-4 hover:border-gray-800 transition"
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-12 h-12 rounded-lg object-cover bg-gray-900 flex-shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-gray-200">{item.name}</h4>
                          <span className="text-[9px] uppercase px-1.5 py-0.25 bg-gray-800 text-gray-400 rounded border border-gray-800/60 font-bold">
                            {item.category}
                          </span>
                          {item.tag && (
                            <span className="text-[8px] uppercase px-1.5 py-0.25 bg-amber-500/10 text-amber-500 rounded border border-amber-500/20 font-extrabold">
                              {item.tag}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-amber-500 font-bold mt-1 block">
                          {formatPrice(item.price)}
                        </span>
                        <div className="mt-1 flex items-center gap-2">
                          <span className={`text-[10px] font-bold ${Number(item.stock ?? 0) > 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                            Stok: {Number(item.stock ?? 0)}
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={Number(item.stock ?? 0)}
                            onChange={(e) => {
                              const nextMenu = menuItems.map((menuItem) =>
                                menuItem.id === item.id ? { ...menuItem, stock: Number(e.target.value) || 0 } : menuItem
                              );
                              setMenuItems(nextMenu);
                            }}
                            className="w-16 bg-[#0f0f11] text-[10px] border border-gray-800 rounded px-2 py-1 text-gray-200"
                          />
                          <button
                            onClick={() => handleUpdateMenuStock(item.id, item.name)}
                            className="text-[10px] font-semibold px-2 py-1 rounded bg-gray-800 text-gray-300 hover:text-white border border-gray-700 transition"
                          >
                            Simpan
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteMenu(item.id, item.name)}
                      className="p-2 border border-gray-850 hover:border-red-500/25 hover:bg-red-500/5 text-gray-500 hover:text-red-400 rounded-lg transition cursor-pointer"
                      title="Hapus Menu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}

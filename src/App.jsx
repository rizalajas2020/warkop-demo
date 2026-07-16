import React, { useState, useEffect } from 'react';
import { MENU_ITEMS } from './data/menu';
import Navbar from './components/Navbar';
import CategoryFilters from './components/CategoryFilters';
import MenuCard from './components/MenuCard';
import CartSidebar from './components/CartSidebar';
import CheckoutModal from './components/CheckoutModal';
import OrderHistory from './components/OrderHistory';
import AdminDashboard from './components/AdminDashboard';
import { ShoppingBag, ArrowRight, Sparkles, X, ChevronRight } from 'lucide-react';

export default function App() {
  // State variables
  const [menuItems, setMenuItems] = useState(() => {
    const saved = localStorage.getItem('warkop_menu');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('warkop_menu', JSON.stringify(MENU_ITEMS));
    return MENU_ITEMS;
  });
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('warkop_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('warkop_orders');
    return saved ? JSON.parse(saved) : [];
  });
  const [tableNumber, setTableNumber] = useState(() => {
    return localStorage.getItem('warkop_table') || '';
  });

  // Navigation Routing State ('customer' or 'admin')
  const [view, setView] = useState('customer');

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // UI states
  const [openCart, setOpenCart] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [openTableModal, setOpenTableModal] = useState(false);
  const [openCheckoutModal, setOpenCheckoutModal] = useState(false);
  
  // Custom Toast State
  const [toasts, setToasts] = useState([]);

  // Save state changes to LocalStorage
  useEffect(() => {
    localStorage.setItem('warkop_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('warkop_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('warkop_table', tableNumber);
  }, [tableNumber]);

  // Toast trigger helper
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Sync menu items in other tabs when admin modifies them
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'warkop_menu') {
        setMenuItems(JSON.parse(e.newValue || '[]'));
      }
      if (e.key === 'warkop_orders') {
        setOrders(JSON.parse(e.newValue || '[]'));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Detect view and table number from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Check view
    if (params.get('admin') === 'true') {
      setView('admin');
      return;
    }

    // Check table number
    const tableParam = params.get('table') || params.get('meja');
    if (tableParam) {
      setTableNumber(tableParam);
      showToast(`Selamat Datang! Anda berada di Meja ${tableParam}`, 'success');
      
      // Clean up URL query parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  // Cart operations
  const handleAddToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        showToast(`Jumlah ${item.name} berhasil ditambahkan!`, 'success');
        return prev.map((i) => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      showToast(`${item.name} ditambahkan ke keranjang.`, 'success');
      return [...prev, { ...item, quantity: 1, note: '' }];
    });
  };

  const handleUpdateQuantity = (itemId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setCart((prev) => 
      prev.map((item) => (item.id === itemId ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveItem = (itemId) => {
    const item = cart.find((i) => i.id === itemId);
    if (item) {
      showToast(`${item.name} dihapus dari keranjang.`, 'warning');
    }
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleUpdateNote = (itemId, note) => {
    setCart((prev) => 
      prev.map((item) => (item.id === itemId ? { ...item, note } : item))
    );
  };

  // Table submission
  const handleSubmitTable = (num) => {
    setTableNumber(num);
    showToast(`Nomor meja diatur ke Meja ${num}`, 'success');
  };

  // Order success handler
  const handleConfirmOrder = (newOrder) => {
    setOrders((prev) => [...prev, newOrder]);
    setCart([]); // Clear cart after checkout
    showToast(`Pesanan ${newOrder.id} berhasil terkirim!`, 'success');
    setOpenHistory(true); // Open order history to see status
  };

  // Simulate updating order statuses for interactivity
  const handleSimulateStatusUpdate = () => {
    setOrders((prev) => {
      let updated = false;
      const nextOrders = prev.map((order) => {
        if (order.status === 'Diproses') {
          updated = true;
          return { ...order, status: 'Disiapkan' };
        } else if (order.status === 'Disiapkan') {
          updated = true;
          return { ...order, status: 'Selesai' };
        }
        return order;
      });

      if (updated) {
        showToast("Status pesanan Anda telah diperbarui!", "success");
      } else {
        showToast("Semua pesanan Anda telah selesai disajikan.", "info");
      }
      return nextOrders;
    });
  };

  // Filtered menu items calculation
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartTotalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const activeOrdersCount = orders.filter(o => o.status !== 'Selesai').length;

  if (view === 'admin') {
    return (
      <AdminDashboard 
        onBackToCustomer={() => {
          setView('customer');
          window.history.replaceState({}, document.title, '/');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f11] text-gray-100 flex flex-col font-sans select-none antialiased">
      
      {/* Toast Notification Container */}
      <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-xs md:max-w-sm pointer-events-none px-4">
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

      {/* Header/Navbar */}
      <Navbar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        tableNumber={tableNumber}
        setOpenTableModal={setOpenTableModal}
        openHistory={openHistory}
        setOpenHistory={setOpenHistory}
        activeOrdersCount={activeOrdersCount}
      />

      {/* Main Layout Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto pb-24 md:pb-12">
        
        {/* Promotional Banner */}
        <div className="px-4 md:px-8 mt-6">
          <div className="relative overflow-hidden bg-gradient-to-r from-amber-900/60 to-amber-700/40 border border-amber-500/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none -mr-8 -mt-8" />
            
            <div className="space-y-2 max-w-xl">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-gray-950">
                <Sparkles className="w-3 h-3" /> PROMO KONGKOW
              </span>
              <h2 className="text-xl md:text-2xl font-black text-white m-0">Paket Combo Lebih Hemat!</h2>
              <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                Nikmati perpaduan manisnya <span className="text-amber-400 font-bold">Es Kopi Susu Aren</span> dan gurihnya <span className="text-amber-400 font-bold">Indomie Goreng Telur</span> hanya seharga <span className="line-through text-gray-500">Rp 33.000</span> <span className="text-emerald-400 font-extrabold text-base">Rp 28.000!</span>
              </p>
            </div>

            <button
              onClick={() => {
                // Auto add the two promo items to cart
                const kopi = menuItems.find(i => i.id === 1);
                const indomie = menuItems.find(i => i.id === 7);
                if (kopi && indomie) {
                  setCart(prev => {
                    let next = [...prev];
                    const hasKopi = next.find(i => i.id === kopi.id);
                    if (hasKopi) {
                      next = next.map(i => i.id === kopi.id ? { ...i, quantity: i.quantity + 1 } : i);
                    } else {
                      next.push({ ...kopi, quantity: 1, note: 'Promo Combo' });
                    }
                    const hasIndomie = next.find(i => i.id === indomie.id);
                    if (hasIndomie) {
                      next = next.map(i => i.id === indomie.id ? { ...i, quantity: i.quantity + 1 } : i);
                    } else {
                      next.push({ ...indomie, quantity: 1, note: 'Promo Combo' });
                    }
                    return next;
                  });
                  showToast("Paket Promo Combo berhasil ditambahkan!", "success");
                }
              }}
              className="px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 font-bold text-sm text-white flex items-center gap-1.5 transition duration-300 shadow-lg shadow-amber-600/20 cursor-pointer self-start md:self-auto"
            >
              <span>Klaim Promo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Categories Section */}
        <CategoryFilters 
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          menuItems={menuItems}
        />

        {/* Menu Grid Section */}
        <div className="px-4 md:px-8 mt-2">
          {filteredMenuItems.length === 0 ? (
            <div className="text-center py-16 bg-[#16171d]/30 border border-gray-800/40 rounded-3xl">
              <p className="text-gray-500 text-sm">Tidak ada menu yang cocok dengan pencarian Anda.</p>
              <button 
                onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
                className="mt-3 text-xs font-bold text-amber-500 hover:underline"
              >
                Reset Filter & Pencarian
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMenuItems.map((item) => {
                const cartItem = cart.find((i) => i.id === item.id);
                return (
                  <MenuCard
                    key={item.id}
                    item={item}
                    onAddToCart={handleAddToCart}
                    cartQuantity={cartItem ? cartItem.quantity : 0}
                  />
                );
              })}
            </div>
          )}
        </div>

      </main>

      {/* Floating Bottom Bar for Mobile Cart */}
      {cartTotalQty > 0 && !openCart && (
        <div className="fixed bottom-0 inset-x-0 z-30 p-4 md:hidden bg-gradient-to-t from-[#0f0f11] via-[#0f0f11]/90 to-transparent">
          <button
            onClick={() => setOpenCart(true)}
            className="w-full bg-amber-600 hover:bg-amber-505 text-white py-3.5 px-6 rounded-2xl font-bold flex items-center justify-between shadow-xl shadow-amber-600/20 active:scale-[0.99] transition duration-200 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="bg-amber-700 text-white rounded-lg px-2 py-1 text-xs font-black">
                {cartTotalQty}
              </div>
              <span className="text-sm">Lihat Keranjang</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(cartTotalPrice)}
              </span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Floating Sticky Cart Button for Desktop */}
      <button
        onClick={() => setOpenCart(true)}
        className="hidden md:flex fixed bottom-6 right-6 z-35 bg-amber-600 hover:bg-amber-500 text-white w-14 h-14 rounded-full items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
        title="Buka Keranjang"
      >
        <div className="relative">
          <ShoppingBag className="w-6 h-6" />
          {cartTotalQty > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-amber-700 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow">
              {cartTotalQty}
            </span>
          )}
        </div>
      </button>

      {/* Cart Sidebar drawer */}
      <CartSidebar 
        isOpen={openCart}
        onClose={() => setOpenCart(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onUpdateNote={handleUpdateNote}
        onCheckout={() => setOpenCheckoutModal(true)}
        tableNumber={tableNumber}
        setOpenTableModal={setOpenTableModal}
      />

      {/* Table & Checkout Modal */}
      <CheckoutModal 
        isOpen={openTableModal || openCheckoutModal}
        mode={openTableModal ? 'table' : 'checkout'}
        onClose={() => {
          setOpenTableModal(false);
          setOpenCheckoutModal(false);
        }}
        onSubmitTable={handleSubmitTable}
        tableNumber={tableNumber}
        cartItems={cart}
        onConfirmOrder={handleConfirmOrder}
      />

      {/* Order History drawer */}
      <OrderHistory 
        isOpen={openHistory}
        onClose={() => setOpenHistory(false)}
        orders={orders}
        onSimulateStatusUpdate={handleSimulateStatusUpdate}
      />

      {/* Footer Branding & Admin Link */}
      <footer className="py-8 border-t border-gray-800/40 text-center bg-[#0f0f11] mt-12 px-4">
        <p className="text-xs text-gray-600 m-0">
          © {new Date().getFullYear()} Warkop Digital. Hak Cipta Dilindungi.
        </p>
        <button
          onClick={() => {
            setView('admin');
            window.history.pushState({}, document.title, '/?admin=true');
          }}
          className="mt-3 text-[10px] uppercase tracking-wider font-extrabold text-gray-500 hover:text-amber-500 hover:underline transition cursor-pointer font-sans"
        >
          Kelola Toko (Admin Panel)
        </button>
      </footer>

    </div>
  );
}

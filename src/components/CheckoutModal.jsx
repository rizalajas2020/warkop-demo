import React, { useState } from 'react';
import { X, CreditCard, Banknote, HelpCircle, CheckCircle, QrCode } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CheckoutModal({
  isOpen,
  mode, // 'table' or 'checkout'
  onClose,
  onSubmitTable,
  tableNumber,
  cartItems,
  onConfirmOrder
}) {
  const [selectedTable, setSelectedTable] = useState(tableNumber || '');
  const [paymentMethod, setPaymentMethod] = useState('qris');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Format price helper
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleTableSubmit = (e) => {
    e.preventDefault();
    if (!selectedTable.trim()) return;
    onSubmitTable(selectedTable);
    onClose();
  };

  const handleCheckout = () => {
    setLoading(true);
    // Simulate loading for checkout
    setTimeout(() => {
      setLoading(false);
      setIsSuccess(true);
      
      // Trigger canvas-confetti
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#d97706', '#f59e0b', '#ffffff', '#10b981']
      });

      // Pass the order info to parent
      const orderDetails = {
        id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
        table: tableNumber,
        items: cartItems,
        total: totalPrice,
        payment: paymentMethod,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        status: 'Diproses'
      };

      setTimeout(() => {
        onConfirmOrder(orderDetails);
        setIsSuccess(false);
        onClose();
      }, 3500); // close and clear after 3.5s of success display
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={isSuccess || loading ? undefined : onClose}
      />

      {/* Modal Box */}
      <div className="bg-[#16171d] rounded-2xl border border-gray-800 w-full max-w-md overflow-hidden shadow-2xl relative z-10 transform scale-100 transition-all duration-300">
        
        {/* Close Button */}
        {!isSuccess && !loading && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* --- MODE TABLE --- */}
        {mode === 'table' && (
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-100 mb-2">Pilih Nomor Meja</h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Masukkan nomor meja tempat Anda duduk sekarang untuk menyesuaikan pengantaran pesanan.
            </p>

            <form onSubmit={handleTableSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Nomor Meja
                </label>
                <input
                  type="number"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  placeholder="Contoh: 05"
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full bg-[#0f0f11] text-lg font-extrabold text-amber-500 text-center tracking-widest border border-gray-800 rounded-xl py-3 focus:outline-none focus:border-amber-500 transition"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 rounded-xl transition duration-200 active:scale-[0.99] cursor-pointer"
              >
                Konfirmasi Nomor Meja
              </button>
            </form>
          </div>
        )}

        {/* --- MODE CHECKOUT --- */}
        {mode === 'checkout' && !isSuccess && (
          <div className="flex flex-col h-full max-h-[85vh]">
            {/* Header */}
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-lg font-bold text-gray-100">Metode Pembayaran</h3>
              <p className="text-xs text-gray-500">Pilih salah satu metode pembayaran di bawah untuk menyelesaikan pesanan Anda.</p>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Table Info Banner */}
              <div className="bg-amber-600/10 border border-amber-500/20 rounded-xl p-3 flex justify-between items-center">
                <span className="text-xs text-amber-500 font-semibold">Mengirim ke meja:</span>
                <span className="text-sm font-extrabold text-amber-400">Meja {tableNumber}</span>
              </div>

              {/* Payment Selector */}
              <div className="space-y-3">
                {/* QRIS Option */}
                <button
                  onClick={() => setPaymentMethod('qris')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                    paymentMethod === 'qris'
                      ? 'border-amber-500 bg-amber-500/5 text-gray-100'
                      : 'border-gray-800 hover:border-gray-700 bg-gray-900/30 text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <QrCode className="w-5 h-5 text-amber-500" />
                    <div className="text-left">
                      <span className="block font-bold text-sm text-gray-100">QRIS (Otomatis)</span>
                      <span className="block text-[11px] text-gray-500">Gopay, OVO, ShopeePay, M-Banking</span>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'qris' ? 'border-amber-500 bg-amber-500' : 'border-gray-800'
                  }`}>
                    {paymentMethod === 'qris' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>

                {/* Cash/Tunai Option */}
                <button
                  onClick={() => setPaymentMethod('tunai')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                    paymentMethod === 'tunai'
                      ? 'border-amber-500 bg-amber-500/5 text-gray-100'
                      : 'border-gray-800 hover:border-gray-700 bg-gray-900/30 text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Banknote className="w-5 h-5 text-amber-500" />
                    <div className="text-left">
                      <span className="block font-bold text-sm text-gray-100">Bayar Tunai</span>
                      <span className="block text-[11px] text-gray-500">Bayar langsung ke pelayan / kasir warkop</span>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'tunai' ? 'border-amber-500 bg-amber-500' : 'border-gray-800'
                  }`}>
                    {paymentMethod === 'tunai' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              </div>

              {/* Dynamic Payment Content */}
              {paymentMethod === 'qris' && (
                <div className="bg-[#0f0f11] border border-gray-800 rounded-xl p-4 flex flex-col items-center">
                  <div className="bg-white p-3 rounded-lg shadow-inner mb-4 relative group">
                    {/* Mock QR code using SVG */}
                    <svg className="w-40 h-40" viewBox="0 0 100 100">
                      <rect width="100" height="100" fill="white"/>
                      {/* Outer corners */}
                      <rect x="5" y="5" width="25" height="25" fill="black"/>
                      <rect x="8" y="8" width="19" height="19" fill="white"/>
                      <rect x="11" y="11" width="13" height="13" fill="black"/>
                      
                      <rect x="70" y="5" width="25" height="25" fill="black"/>
                      <rect x="73" y="8" width="19" height="19" fill="white"/>
                      <rect x="76" y="11" width="13" height="13" fill="black"/>
                      
                      <rect x="5" y="70" width="25" height="25" fill="black"/>
                      <rect x="8" y="73" width="19" height="19" fill="white"/>
                      <rect x="11" y="76" width="13" height="13" fill="black"/>
                      
                      {/* Random QR code bars */}
                      <rect x="35" y="10" width="5" height="25" fill="black"/>
                      <rect x="45" y="5" width="15" height="5" fill="black"/>
                      <rect x="45" y="15" width="5" height="15" fill="black"/>
                      <rect x="60" y="20" width="5" height="10" fill="black"/>
                      
                      <rect x="10" y="35" width="20" height="5" fill="black"/>
                      <rect x="15" y="45" width="5" height="15" fill="black"/>
                      <rect x="25" y="55" width="15" height="5" fill="black"/>
                      
                      <rect x="35" y="35" width="30" height="30" fill="black"/>
                      <rect x="40" y="40" width="20" height="20" fill="white"/>
                      <rect x="48" y="48" width="4" height="4" fill="amber-600"/> {/* Colored center anchor */}
                      
                      <rect x="70" y="35" width="20" height="5" fill="black"/>
                      <rect x="85" y="45" width="10" height="15" fill="black"/>
                      <rect x="75" y="60" width="15" height="5" fill="black"/>
                      
                      <rect x="35" y="75" width="20" height="5" fill="black"/>
                      <rect x="40" y="85" width="15" height="10" fill="black"/>
                      <rect x="60" y="70" width="5" height="25" fill="black"/>
                      
                      <rect x="70" y="70" width="25" height="5" fill="black"/>
                      <rect x="85" y="80" width="5" height="15" fill="black"/>
                      <rect x="75" y="90" width="20" height="5" fill="black"/>
                    </svg>
                  </div>
                  <span className="text-amber-500 font-extrabold text-xs tracking-wider uppercase bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded mb-2">
                    QRIS WARKOP DIGITAL
                  </span>
                  <p className="text-[11px] text-gray-500 text-center">
                    Pindai kode QR di atas menggunakan aplikasi pembayaran Anda. Pembayaran akan terverifikasi secara instan.
                  </p>
                </div>
              )}

              {paymentMethod === 'tunai' && (
                <div className="bg-[#0f0f11] border border-gray-800 rounded-xl p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-600/10 flex items-center justify-center mx-auto mb-3">
                    <Banknote className="w-6 h-6 text-amber-500" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-200 mb-1">Konfirmasi Pembayaran Kasir</h4>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                    Setelah mengonfirmasi pesanan, silakan tunjukkan nomor meja/ID Pesanan Anda ke meja kasir untuk melakukan pembayaran tunai.
                  </p>
                </div>
              )}
            </div>

            {/* Footer Summary & Confirm button */}
            <div className="p-6 border-t border-gray-800 bg-gray-900/20">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400 font-semibold">Total Tagihan</span>
                <span className="text-lg font-extrabold text-amber-500">{formatPrice(totalPrice)}</span>
              </div>
              
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 rounded-xl transition duration-200 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Memproses Pesanan...</span>
                  </>
                ) : (
                  <span>Konfirmasi & Buat Pesanan</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* --- SUCCESS STATE --- */}
        {isSuccess && (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-4 animate-bounce">
              <CheckCircle className="w-10 h-10 fill-green-500/15" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-100 mb-1">Pesanan Berhasil Dibuat!</h3>
            <p className="text-sm text-amber-500 font-bold mb-4">Meja {tableNumber}</p>
            
            <p className="text-xs text-gray-400 max-w-xs leading-relaxed mb-6">
              Pesanan Anda telah masuk antrean dapur. Silakan pantau status pesanan pada tab <span className="text-gray-200 font-semibold">Pesanan Saya</span>.
            </p>

            <div className="w-full bg-[#0f0f11] border border-gray-800 rounded-xl px-4 py-3 flex justify-between items-center text-xs">
              <span className="text-gray-500">Status Pembayaran</span>
              <span className="px-2 py-0.5 rounded font-extrabold uppercase bg-green-500/10 text-green-500 border border-green-500/20">
                {paymentMethod === 'qris' ? 'Lunas' : 'Belum Bayar'}
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

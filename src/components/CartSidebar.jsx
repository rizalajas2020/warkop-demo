import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, FileText, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartSidebar({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateNote,
  onCheckout,
  tableNumber,
  setOpenTableModal
}) {
  const [activeNoteInput, setActiveNoteInput] = useState(null); // stores itemId currently editing notes

  // Format price helper
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0f0f11] border-l border-gray-800 flex flex-col h-full shadow-2xl relative">
          
          {/* Header */}
          <div className="px-4 py-6 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-gray-100 m-0">Keranjang Belanja</h2>
              <span className="bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded-full font-bold">
                {cartItems.reduce((sum, i) => sum + i.quantity, 0)} Porsi
              </span>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-16 h-16 rounded-full bg-gray-800/40 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-gray-300 font-bold mb-1">Keranjang masih kosong</h3>
                <p className="text-xs text-gray-500 max-w-xs">
                  Yuk, pilih kopi dan camilan enak di menu untuk mulai memesan!
                </p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div 
                  key={item.id}
                  className="bg-[#16171d] rounded-xl border border-gray-800/80 p-3 flex flex-col gap-2 hover:border-gray-800 transition duration-200"
                >
                  <div className="flex items-start gap-3">
                    {/* Item Thumbnail */}
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-16 h-16 rounded-lg object-cover bg-gray-900 flex-shrink-0"
                    />

                    {/* Info & Quantity controls */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-gray-100 truncate">{item.name}</h4>
                        <button 
                          onClick={() => onRemoveItem(item.id)}
                          className="text-gray-500 hover:text-red-400 p-0.5 rounded transition cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-xs text-amber-500 font-semibold block mb-2">
                        {formatPrice(item.price)}
                      </span>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-[#0f0f11] rounded-lg border border-gray-800 px-1 py-0.5">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:text-amber-500 text-gray-400 transition cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-extrabold text-gray-200 px-2 min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:text-amber-500 text-gray-400 transition cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        {/* Note toggle */}
                        <button
                          onClick={() => setActiveNoteInput(activeNoteInput === item.id ? null : item.id)}
                          className={`text-xs flex items-center gap-1 transition cursor-pointer ${
                            item.note 
                              ? 'text-amber-500 font-semibold' 
                              : 'text-gray-500 hover:text-gray-300'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{item.note ? 'Ada Catatan' : 'Catatan'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Note Field (Conditionally Rendered) */}
                  {(activeNoteInput === item.id || item.note) && (
                    <div className="mt-1">
                      <input
                        type="text"
                        placeholder="Contoh: es sedikit, pedas manis, dll..."
                        value={item.note || ''}
                        onChange={(e) => onUpdateNote(item.id, e.target.value)}
                        className="w-full bg-[#0f0f11] text-xs text-gray-300 border border-gray-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500/80 transition"
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          {cartItems.length > 0 && (
            <div className="p-4 border-t border-gray-800 bg-[#0f0f11]">
              {/* Table check */}
              <div className="flex items-center justify-between mb-4 bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5">
                <div>
                  <span className="text-xs text-gray-500 block">Nomor Meja</span>
                  <span className="text-sm font-bold text-gray-200">
                    {tableNumber ? `Meja ${tableNumber}` : 'Belum Ditentukan'}
                  </span>
                </div>
                <button 
                  onClick={() => setOpenTableModal(true)}
                  className="text-xs font-bold text-amber-500 hover:text-amber-400 transition cursor-pointer"
                >
                  {tableNumber ? 'Ubah' : 'Pilih Meja'}
                </button>
              </div>

              {/* Summary */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-gray-400 font-semibold">Total Pembayaran</span>
                <span className="text-xl font-extrabold text-amber-500">{formatPrice(totalPrice)}</span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={onCheckout}
                disabled={!tableNumber}
                className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition duration-300 ${
                  tableNumber 
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/25 active:scale-[0.99]' 
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-800'
                }`}
              >
                <span>{tableNumber ? 'Lanjutkan Pemesanan' : 'Pilih Meja Terlebih Dahulu'}</span>
                {tableNumber && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

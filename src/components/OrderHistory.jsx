import React from 'react';
import { X, CheckCircle, Clock, ChefHat, RefreshCw, Clipboard } from 'lucide-react';

export default function OrderHistory({ 
  isOpen, 
  onClose, 
  orders, 
  onSimulateStatusUpdate 
}) {
  
  // Format price helper
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

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
              <Clipboard className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-gray-100 m-0">Riwayat Pesanan</h2>
            </div>
            <div className="flex items-center gap-2">
              {orders.length > 0 && (
                <button
                  onClick={onSimulateStatusUpdate}
                  className="p-2 rounded-lg text-amber-500 hover:text-amber-400 hover:bg-gray-850 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-amber-500/20 bg-amber-500/5"
                  title="Simulasi Update Status"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>Update Status</span>
                </button>
              )}
              <button 
                onClick={onClose}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Orders list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-16 h-16 rounded-full bg-gray-800/40 flex items-center justify-center mb-4">
                  <Clipboard className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-gray-300 font-bold mb-1">Belum ada pesanan</h3>
                <p className="text-xs text-gray-500 max-w-xs">
                  Semua pesanan yang Anda buat hari ini akan tersimpan dan dapat dipantau di sini.
                </p>
              </div>
            ) : (
              [...orders].reverse().map((order) => {
                // Determine icon & color based on status
                let StatusIcon = Clock;
                let statusColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
                let statusText = 'Diproses';

                if (order.status === 'Disiapkan') {
                  StatusIcon = ChefHat;
                  statusColor = 'text-orange-500 bg-orange-500/10 border-orange-500/20';
                  statusText = 'Disiapkan';
                } else if (order.status === 'Selesai') {
                  StatusIcon = CheckCircle;
                  statusColor = 'text-green-500 bg-green-500/10 border-green-500/20';
                  statusText = 'Selesai';
                }

                return (
                  <div 
                    key={order.id}
                    className="bg-[#16171d] rounded-xl border border-gray-800/80 p-4 space-y-3"
                  >
                    {/* ID & Status */}
                    <div className="flex items-center justify-between pb-2 border-b border-gray-800/40">
                      <div>
                        <span className="text-[10px] text-gray-500 block">ID Pesanan</span>
                        <span className="text-sm font-extrabold text-gray-200">{order.id}</span>
                      </div>
                      
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${statusColor}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span>{statusText}</span>
                      </div>
                    </div>

                    {/* Table, Time, Payment */}
                    <div className="grid grid-cols-3 gap-2 text-[11px] text-gray-400">
                      <div>
                        <span className="text-gray-500 block">Meja</span>
                        <span className="font-bold text-gray-200">Meja {order.table}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Waktu</span>
                        <span className="font-bold text-gray-200">{order.timestamp}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Pembayaran</span>
                        <span className="font-bold text-gray-200 uppercase">{order.payment}</span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-[#0f0f11] rounded-lg p-2.5 space-y-1.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <div className="truncate pr-4">
                            <span className="font-bold text-amber-500 mr-1.5">{item.quantity}x</span>
                            <span className="text-gray-300">{item.name}</span>
                            {item.note && (
                              <span className="block text-[10px] text-gray-500 italic mt-0.5">
                                Catatan: "{item.note}"
                              </span>
                            )}
                          </div>
                          <span className="text-gray-400 font-semibold">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-gray-400 font-semibold">Total Pesanan</span>
                      <span className="text-sm font-extrabold text-amber-500">{formatPrice(order.total)}</span>
                    </div>

                    {/* Progress Bar (Interactive visual helper) */}
                    <div className="w-full bg-gray-800 rounded-full h-1 mt-3 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          order.status === 'Diproses' ? 'w-1/3 bg-amber-500' :
                          order.status === 'Disiapkan' ? 'w-2/3 bg-orange-500' :
                          'w-full bg-green-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

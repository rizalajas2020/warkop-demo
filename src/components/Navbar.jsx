import React from 'react';
import { Coffee, Search, ClipboardList, Utensils } from 'lucide-react';

export default function Navbar({ 
  searchTerm, 
  setSearchTerm, 
  tableNumber, 
  setOpenTableModal, 
  openHistory, 
  setOpenHistory, 
  activeOrdersCount 
}) {
  return (
    <nav className="sticky top-0 z-40 bg-[#0f0f11]/90 backdrop-blur-md border-b border-gray-800/80 px-4 py-3 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Branding & Logo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Coffee className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent m-0 select-none">
                Warkop Digital
              </h1>
              <p className="text-xs text-gray-500 m-0">Order Praktis, Nongkrong Eksklusif</p>
            </div>
          </div>

          {/* Quick buttons on Mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setOpenTableModal(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-800 text-amber-400 hover:bg-gray-700 transition"
            >
              {tableNumber ? `Meja ${tableNumber}` : 'Pilih Meja'}
            </button>
            <button
              onClick={() => setOpenHistory(!openHistory)}
              className="p-2 relative rounded-lg bg-gray-800 text-gray-300 hover:text-white transition"
              title="Riwayat Pesanan"
            >
              <ClipboardList className="w-5 h-5" />
              {activeOrdersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-600 text-[10px] font-bold text-white flex items-center justify-center animate-bounce">
                  {activeOrdersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md mx-auto md:mx-0 w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-500" />
          </span>
          <input
            type="text"
            placeholder="Cari kopi, makanan, atau cemilan favoritmu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#16171d] text-gray-200 placeholder-gray-500 pl-10 pr-4 py-2 rounded-xl border border-gray-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
          />
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => setOpenTableModal(true)}
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-[#16171d] border border-gray-800 text-amber-400 hover:bg-gray-800/60 transition flex items-center gap-2"
          >
            <Utensils className="w-4 h-4" />
            {tableNumber ? `Meja Nomor: ${tableNumber}` : 'Pilih Meja'}
          </button>
          
          <button
            onClick={() => setOpenHistory(!openHistory)}
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-gray-800/80 hover:bg-gray-800 text-gray-200 hover:text-white transition flex items-center gap-2 relative"
          >
            <ClipboardList className="w-4 h-4" />
            Pesanan Saya
            {activeOrdersCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-amber-600 text-[10px] font-bold text-white flex items-center justify-center animate-bounce">
                {activeOrdersCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </nav>
  );
}

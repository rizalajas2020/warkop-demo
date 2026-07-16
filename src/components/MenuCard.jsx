import React from 'react';
import { Plus, Star, ShoppingCart } from 'lucide-react';

export default function MenuCard({ item, onAddToCart, cartQuantity }) {
  // Format price helper
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="group relative bg-[#16171d] rounded-2xl border border-gray-800/80 overflow-hidden hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 flex flex-col h-full">
      
      {/* Top Badges & Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-900">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />

        {/* Rating and Tags */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
          {item.tag ? (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wider uppercase bg-amber-500 text-gray-950 shadow-md">
              {item.tag}
            </span>
          ) : (
            <span></span> // Empty spacer
          )}
          
          <div className="flex items-center gap-1 bg-black/75 backdrop-blur-sm px-2 py-1 rounded-lg shadow-md">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-[11px] font-bold text-gray-200">{item.rating || '4.5'}</span>
          </div>
        </div>

        {/* In-cart indicator overlay */}
        {cartQuantity > 0 && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center opacity-100 transition-opacity">
            <div className="bg-amber-600/90 text-white font-bold text-sm px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg scale-105 transform transition duration-300">
              <ShoppingCart className="w-4 h-4" />
              <span>{cartQuantity} Porsi</span>
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="text-base font-bold text-gray-100 group-hover:text-amber-400 transition-colors line-clamp-1 mb-1">
            {item.name}
          </h3>
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4">
            {item.description}
          </p>
        </div>

        {/* Bottom Price & Add button */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-800/40">
          <div>
            <span className="text-xs text-gray-500 block">Harga</span>
            <span className="text-base font-extrabold text-white">
              {formatPrice(item.price)}
            </span>
          </div>

          <button
            onClick={() => onAddToCart(item)}
            className="w-10 h-10 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white flex items-center justify-center transition-all duration-200 shadow-md shadow-amber-600/10 cursor-pointer"
            title="Tambah ke Keranjang"
          >
            <Plus className="w-5 h-5 font-bold" />
          </button>
        </div>
      </div>
      
    </div>
  );
}

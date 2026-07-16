import React from 'react';
import { Coffee, Pizza, Sparkles, IceCream, Compass } from 'lucide-react';

export default function CategoryFilters({ activeCategory, setActiveCategory, menuItems }) {
  const categories = [
    { id: 'all', name: 'Semua Menu', icon: Compass },
    { id: 'coffee', name: 'Kopi', icon: Coffee },
    { id: 'non-coffee', name: 'Non-Kopi', icon: IceCream },
    { id: 'food', name: 'Makanan', icon: Pizza },
    { id: 'snack', name: 'Cemilan', icon: Sparkles },
  ];

  // Helper to count items in each category
  const getCount = (categoryId) => {
    if (categoryId === 'all') return menuItems.length;
    return menuItems.filter(item => item.category === categoryId).length;
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-4 px-4 md:px-8 scrollbar-none max-w-7xl mx-auto">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer ${
              isActive
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20 scale-105'
                : 'bg-[#16171d] text-gray-400 hover:text-gray-200 border border-gray-800/80 hover:border-gray-700'
            }`}
          >
            <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'rotate-12' : ''}`} />
            <span>{cat.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold transition-colors duration-300 ${
              isActive ? 'bg-amber-700 text-white' : 'bg-gray-800 text-gray-500 group-hover:text-gray-400'
            }`}>
              {getCount(cat.id)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

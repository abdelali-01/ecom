'use client';
import { useState, useEffect } from 'react';
import Input from '../form/input/InputField';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useTranslation } from 'react-i18next';

interface Filter {
  category: number[];
  price: {
    min: number;
    max: number;
  };
  sort: 'newest' | 'price-low' | 'price-high' | 'popular';
  inStock: boolean;
}

interface FilterSidebarProps {
  filters: Filter;
  onFilterChange: (filters: Filter) => void;
  isOpen: boolean;
}

export default function FilterSidebar({ filters, onFilterChange, isOpen }: FilterSidebarProps) {
  const { t } = useTranslation();
  const {products , categories } = useSelector((state: RootState) => state.products);

  return (
    <div className={`lg:w-64 ${isOpen ? 'block' : 'hidden lg:block'}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-6">
        {/* Categories */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">{t('shop.filters.categories')}</h3>
          <div className="space-y-2">
            {categories?.map((cat) => (
              <label key={cat.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.category.includes(Number(cat.id))}
                  onChange={(e) => {
                    const id = Number(cat.id);
                    const newCategories = e.target.checked
                      ? [...filters.category, id]
                      : filters.category.filter(cid => cid != id);
                    onFilterChange({ ...filters, category: newCategories });
                  }}
                  className="rounded border-gray-300 dark:border-gray-600 text-brand-600 focus:ring-brand-500"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">{t('shop.filters.priceRange')}</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={filters.price.min}
                onChange={(e) => onFilterChange({
                  ...filters,
                  price: { ...filters.price, min: Number(e.target.value) }
                })}
                className="w-full placeholder-gray-500"
                placeholder="Min"
              />
              <span className="text-gray-500">to</span>
              <Input
                type="number"
                value={filters.price.max}
                onChange={(e) => onFilterChange({
                  ...filters,
                  price: { ...filters.price, max: Number(e.target.value) }
                })}
                className="w-full placeholder-gray-500"
                placeholder="Max"
              />
            </div>
          </div>
        </div>

        {/* Stock Status */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">{t('shop.filters.stockStatus')}</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => onFilterChange({ ...filters, inStock: e.target.checked })}
                className="rounded border-gray-300 dark:border-gray-600 text-brand-600 focus:ring-brand-500"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">{t('shop.filters.inStock')}</span>
            </label>
          </div>
        </div>

        {/* Clear Filters */}
        <button
          onClick={() => onFilterChange({
            category: [],
            price: { min: 0, max: 1000 },
            sort: 'newest',
            inStock: false
          })}
          className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-white bg-gray-100 dark:bg-gray-700 hover:bg-brand-500 dark:hover:bg-brand-500 rounded-lg mt-4 shadow"
        >
          {t('shop.filters.clearAll')}
        </button>
      </div>
    </div>
  );
} 
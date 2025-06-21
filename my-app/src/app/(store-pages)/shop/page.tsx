'use client';
import { useState, useEffect } from 'react';
import ShopHeader from '@/components/shop/ShopHeader';
import FilterSidebar from '@/components/shop/FilterSidebar';
import ProductGrid from '@/components/shop/ProductGrid';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { Product } from '@/components/modals/ProductModal';
import { fetchProducts } from '@/store/products/productHandler';
import { useSearchParams } from 'next/navigation';

// Filter types
type Filter = {
  category: number[];
  price: {
    min: number;
    max: number;
  };
  sort: 'newest' | 'price-low' | 'price-high' | 'popular';
  inStock: boolean;
};

export default function ShopPage() {
  const { products, categories } = useSelector((state: RootState) => state.products)
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filter>({
    category: [],
    price: { min: 0, max: 10000 },
    sort: 'newest',
    inStock: false
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (categories) {
      const categoryName = searchParams.get('category');
      if (categoryName) {
        const category = categories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
        if (category) {
          setFilters(prev => ({ ...prev, category: [Number(category.id)] }));
        }
      }
    }
  }, [searchParams, categories]);

  // Filter products
  useEffect(() => {
    let result = products ? [...products] : [];

    // Search
    if (searchQuery) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filters.category.length) {
      result = result.filter(product =>
        filters.category.includes(product.category_id)
      );
    }

    // Price filter
    result = result.filter(product =>
      product.price >= filters.price.min &&
      product.price <= filters.price.max
    );

    // Stock filter
    if (filters.inStock) {
      result = result.filter(product => (typeof product.inStock === 'boolean' ? product.inStock : product.quantity > 0));
    }

    // Sort
    switch (filters.sort) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    setFilteredProducts(result);
  }, [filters, searchQuery, products]);

  // Set initial products
  useEffect(() => {
    if (products) {
      setFilteredProducts(products)
    } else {
      dispatch(fetchProducts());
    }
  }, [dispatch, products]);

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <ShopHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onFilterToggle={() => setIsFilterOpen(!isFilterOpen)}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <FilterSidebar
              filters={filters}
              onFilterChange={setFilters}
              isOpen={isFilterOpen}
            />

            <ProductGrid
              products={filteredProducts}
              sort={filters.sort}
              onSortChange={(sort) => setFilters(prev => ({ ...prev, sort: sort as Filter['sort'] }))}
            />
          </div>
        </div>
      </div>
    </>
  );
} 
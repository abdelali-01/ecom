import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import Button from '../ui/button/Button';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/store/cart/cartSlice';
import { useCartSidebar } from '@/context/CartSidebarContext';
import { Product } from '../modals/ProductModal';
import { useTranslation } from 'react-i18next';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation();
  const isOutOfStock = product.quantity === 0;
  const getImageSrc = (img: string) => {
    if (!img) return '/images/placeholder.png';
    if (img.startsWith('data:image') || img.startsWith('http')) return img;
    return `${process.env.NEXT_PUBLIC_SERVER}/${img}`;
  };

  const discountPercent = product.prevPrice && product.prevPrice > product.price
    ? Math.round(((product.prevPrice - product.price) / product.prevPrice) * 100)
    : 0;

  const dispatch = useDispatch();
  const { openCart } = useCartSidebar();

  const handleAddToCart = () => {
    dispatch(addToCart({
      ...product,
      quantity: typeof product.quantity === 'number' ? product.quantity : 1,
      cartQuantity: 1,
      // attributes: ... if needed
    }));
    openCart();
  };

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
      <div className="relative h-56 w-full">
        <Image
          src={getImageSrc(product.images?.[0]) || '/product.png'}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = '/product.png';
          }}
        />
        {discountPercent > 0 && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            -{discountPercent}%
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
            {t('product.outOfStock')}
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">{product.name}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm line-clamp-2">{product.description}</p>
        <div className="flex items-center gap-2 mb-4">
          <div className="text-xl font-bold text-brand-500">{product.price} DA</div>
          {product.prevPrice && product.prevPrice > product.price && (
            <div className="text-base text-gray-500 line-through">{product.prevPrice} DA</div>
          )}
        </div>
        <div className="flex gap-2 mt-auto">
          <Link href={!isOutOfStock ? `/shop/${product.id}` : '#'} className="flex-1">
            <Button
              className='w-full'
              disabled={isOutOfStock}
            >
              {t('product.orderNow')}
            </Button>
          </Link>
          <Button
            variant='light'
            className="flex items-center justify-center shadow"
            aria-label={t('product.addToCart')}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            <ShoppingCart className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

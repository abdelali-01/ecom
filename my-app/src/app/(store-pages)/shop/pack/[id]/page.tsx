"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchPacks } from "@/store/offers/offersHandler";
import Image from "next/image";
import ProductOrderForm from "@/components/shop/OrderForm";
import { PromoCode } from "@/store/offers/offerSlice";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/button/Button";
import { Product as StoreProduct } from '@/components/modals/ProductModal';

export default function PackPage() {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { packs, loading } = useSelector((state: RootState) => state.offers);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [discountCode] = useState<PromoCode | null>(null);

  const allProducts = useSelector((state: RootState) => state.products.products);

  // Find the pack by id
  const pack = packs?.find((p) => String(p.id) === String(id));

  useEffect(() => {
    if (!packs) {
      dispatch(fetchPacks());
    }
  }, [dispatch, packs]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [pack?.images]);

  if (loading || !packs) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="text-lg font-semibold">Loading...</span>
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <span className="text-2xl font-bold mb-4">Pack Not Found</span>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  // Calculate original price and discount
  const calculateTotalOriginalPrice = (products) => {
    return products.reduce((total, product) => total + (product.price * (product.quantity || 1)), 0);
  };
  const originalPrice = calculateTotalOriginalPrice(pack.products);
  const discountPercent = pack.discount > 0 ? pack.discount : 0;

  // Build products array for the order form with full attribute info
  const packProducts = pack.products.map((p) => {
    const full = allProducts?.find((prod: StoreProduct) => prod.id === p.id);
    return {
      productId: p.id,
      quantity: p.quantity,
      name: p.name,
      price: p.price,
      images: full?.images || (p.image ? [p.image] : []),
      availableAttributes: full?.attributes || {},
      attributes : p?.attributes
    };
  });

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Pack Images and Slider */}
        <div className="w-full lg:flex-1">
          <div className="relative w-full rounded-2xl flex flex-col gap-4">
            <div className="relative w-full h-full min-h-[340px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative h-full w-full"
                >
                  <div className="relative flex">
                    <Image
                      src={pack.images && pack.images.length > 0 ? `${process.env.NEXT_PUBLIC_SERVER}/${pack.images[currentImageIndex]}` : "/images/placeholder.png"}
                      alt={pack.name}
                      className="object-cover rounded-lg w-full min-h-[340px]"
                      width={600}
                      height={400}
                      unoptimized
                      quality={100}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
              {/* Navigation Buttons */}
              {pack.images && pack.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? pack.images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === pack.images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
            {/* Slide Indicators */}
            <div className="flex gap-2">
              {pack.images && pack.images.map((image, index) => (
                <Image
                  key={index}
                  src={image ? `${process.env.NEXT_PUBLIC_SERVER}/${image}` : "/images/placeholder.png"}
                  alt={pack.name}
                  onClick={() => setCurrentImageIndex(index)}
                  width={36}
                  height={36}
                  quality={100}
                  unoptimized
                  className={`w-9 h-9 object-cover rounded-xl transition-colors cursor-pointer ${index === currentImageIndex ? 'border-2 border-brand-500' : 'opacity-60'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Pack Information and Order Form */}
        <div className="w-full lg:w-1/2 lg:self-start">
          <div className="rounded-lg mb-3">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{pack.name}</h1>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-semibold text-blue-600 dark:text-blue-400">{pack.price} DA</span>
              {discountPercent > 0 && (
                <span className="text-lg text-gray-500 line-through">{originalPrice} DA</span>
              )}
              {discountPercent > 0 && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">-{discountPercent}%</span>
              )}
            </div>
            <p className="text-gray-700 dark:text-gray-200 leading-relaxed mb-6">{pack.description}</p>
            
          </div>

          {/* Order Form for the Pack as a multi-product order */}
          <ProductOrderForm
            products={packProducts}
            discount={discountCode}
            productPrice={pack.price}
            isPack={true}
            packId={pack.id}
          />
        </div>
      </div>
    </div>
  );
}

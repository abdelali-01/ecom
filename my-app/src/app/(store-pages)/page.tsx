'use client';
import Hero from "@/components/landing/Hero";
import FeaturedProducts from "@/components/landing/FeaturedProducts";
import Packs from "@/components/landing/Packs";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { useEffect } from "react";
import { fetchPacks } from "@/store/offers/offersHandler";
import { fetchProducts } from "@/store/products/productHandler";
import Loader from "@/components/ui/load/Loader";
import VideoShowcase from "@/components/landing/VideoShowcase";
import DeliveryInfo from '@/components/landing/DeliveryInfo';
import PaymentPrivacy from '@/components/landing/PaymentPrivacy';
import CategoriesShowcase from '@/components/landing/CategoriesShowcase';
import ContactCta from '@/components/landing/ContactCta';

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();

  const { packs } = useSelector((state: RootState) => state.offers);
  const { categories } = useSelector((state: RootState) => state.products);
  const { products } = useSelector((state: RootState) => state.products);

  console.log(packs);


  useEffect(() => {
    dispatch(fetchPacks());
    dispatch(fetchProducts());
  }, [dispatch]);

  if (!products || !packs || !categories) return <div className="h-screen flex items-center justify-center"><Loader /></div>
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Hero />
      <CategoriesShowcase categories={categories} />
      <DeliveryInfo />
      {/* <PaymentPrivacy /> */}
      <VideoShowcase />
      {packs.length > 0 && <Packs /> }
      <FeaturedProducts />
      <ContactCta />
    </div>
  );
} 
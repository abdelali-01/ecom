'use client';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { fetchProducts } from '@/store/products/productHandler';
import Image from 'next/image';
import { motion } from 'framer-motion';
import OrderForm from '@/components/shop/OrderForm';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import ProductPage from '@/components/shop/ProductPage';
import Loader from '@/components/ui/load/Loader';

interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  images: string[];
  discount?: number;
  category_id?: number; // Added category_id as it's in your productHandler
  quantity?: number; // Added quantity as it's in your productHandler
}

export default function Product() {
  const params = useParams();
  const productId = params.id as number;
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading, error } = useSelector((state : RootState) => state.products);

  useEffect(() => {
    if (!products) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products]);

  const product = products?.find(p => p.id === Number(productId));


  if (!product) {
    return <div className="h-screen flex items-center justify-center"><Loader/></div>;
  }

  return (
    <ProductPage product={product}/>
  );
} 
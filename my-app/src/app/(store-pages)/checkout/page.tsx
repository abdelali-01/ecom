'use client'
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import OrderForm from '@/components/shop/OrderForm';
import Link from 'next/link';
import { Product } from '@/components/modals/ProductModal';
import { useState } from 'react';
import { checkCode } from '@/store/offers/offersHandler';
import { PromoCode } from '@/store/offers/offerSlice';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';
import { useTranslation } from 'react-i18next';

export default function CheckoutPage() {
  const cart = useSelector((state: RootState) => state.cart.items);
  const products = useSelector((state: RootState) => state.products.products) as Product[] | null;
  const dispatch = useDispatch();
  const { i18n } = useTranslation();
  const [promoCode, setPromoCode] = useState('');
  const [discountCode, setDiscountCode] = useState<PromoCode | null>(null);
  const [promoFeedback, setPromoFeedback] = useState<string | null>(null);

  const content = {
    title: {
      en: "Checkout",
      fr: "Commande",
      ar: "إتمام الطلب"
    },
    emptyCart: {
      en: "Your cart is empty.",
      fr: "Votre panier est vide.",
      ar: "سلة التسوق فارغة."
    },
    goToShop: {
      en: "Go to Shop",
      fr: "Aller au Magasin",
      ar: "اذهب إلى المتجر"
    },
    promoCode: {
      en: "Promo Code",
      fr: "Code Promo",
      ar: "رمز الخصم"
    },
    enterPromoCode: {
      en: "Enter promo code",
      fr: "Entrez le code promo",
      ar: "أدخل رمز الخصم"
    },
    apply: {
      en: "Apply",
      fr: "Appliquer",
      ar: "تطبيق"
    },
    promoApplied: {
      en: "Promo code applied!",
      fr: "Code promo appliqué !",
      ar: "تم تطبيق رمز الخصم!"
    },
    invalidPromo: {
      en: "Invalid or expired promo code.",
      fr: "Code promo invalide ou expiré.",
      ar: "رمز الخصم غير صالح أو منتهي الصلاحية."
    },
    orderDetails: {
      en: "Order Details",
      fr: "Détails de la Commande",
      ar: "تفاصيل الطلب"
    }
  };

  const handlePromoCodeChange = (e) => setPromoCode(e.target.value);

  const applyPromoCode = async (e) => {
    e.preventDefault();
    setPromoFeedback(null);
    const res = await dispatch(checkCode(promoCode));
    if (res?.discount) {
      setDiscountCode({ ...res, code: promoCode });
      setPromoFeedback(content.promoApplied[i18n.language as keyof typeof content.promoApplied]);
    } else {
      setDiscountCode(null);
      setPromoFeedback(content.invalidPromo[i18n.language as keyof typeof content.invalidPromo]);
    }
    setPromoCode('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">{content.title[i18n.language as keyof typeof content.title]}</h1>
        {cart.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-16">
            {content.emptyCart[i18n.language as keyof typeof content.emptyCart]} <Link href="/shop" className="text-brand-500 underline">{content.goToShop[i18n.language as keyof typeof content.goToShop]}</Link>
          </div>
        ) : (
          <div className="">
            {/* Promo Code Card */}
            <form onSubmit={applyPromoCode} className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2" htmlFor="promoCode">
                {content.promoCode[i18n.language as keyof typeof content.promoCode]}
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    type="text"
                    id="promoCode"
                    name="promoCode"
                    value={promoCode}
                    onChange={handlePromoCodeChange}
                    placeholder={content.enterPromoCode[i18n.language as keyof typeof content.enterPromoCode]}
                    required
                  />
                </div>
                <Button disabled={!promoCode.trim()} type="submit">
                  {content.apply[i18n.language as keyof typeof content.apply]}
                </Button>
              </div>
              {promoFeedback && (
                <div className={`mt-2 text-sm ${discountCode ? 'text-green-600' : 'text-red-500'}`}>{promoFeedback}</div>
              )}
            </form>
            {/* Order Form */}
            <div className="w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">{content.orderDetails[i18n.language as keyof typeof content.orderDetails]}</h2>
              {cart.length > 0 && products && (
                <OrderForm
                  products={cart.map(item => ({
                    productId: item.id,
                    quantity: item.cartQuantity,
                    attributes: item.attributes
                  }))}
                  discount={discountCode}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
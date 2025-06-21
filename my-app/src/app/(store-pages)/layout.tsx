'use client';
import CartSidebar from '@/components/ui/cart/CartSidebar';
import { CartSidebarProvider } from '@/context/CartSidebarContext';
import Footer from '@/layout/Footer';
import Navbar from '@/layout/Navbar';
import { Metadata } from 'next';
import { useTranslation } from 'react-i18next';
import React from 'react'

// export const metadata: Metadata = {
//     title: "@devali.i store",
//     description: "This store is for selling "
// }

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    return (
        <div 
            dir={isRTL ? 'rtl' : 'ltr'} 
            className={isRTL ? 'rtl' : 'ltr'}
            style={isRTL ? { fontFamily: "'El Messiri', sans-serif" } : {}}
        >
            <CartSidebarProvider>
                <CartSidebar />
                <Navbar />
                <main className='px-3 md:px-0'>
                    {children}
                </main>
                <Footer />
            </CartSidebarProvider>
        </div>
    );
}

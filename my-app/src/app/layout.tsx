import { Outfit, El_Messiri  } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import StoreProvider from './StoreProvider';
import AuthInitializer from './AuthInitializer';
import ErrorChecking from './ErrorChecking';
import AlertPlayer from './AlertPlayer';
import { Metadata } from 'next';
import I18nProvider from './I18nProvider';

const outfit = Outfit({
  subsets: ["latin"],
});

const elMessiri = El_Messiri({
  subsets: ["arabic"],
});

export const metadata: Metadata = {
    title:
        "Ecommerce store",
    description: "Standard Ecommerce store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <StoreProvider>
          <I18nProvider>
            <AlertPlayer/>
            <ErrorChecking/>
            <AuthInitializer/>
            <ThemeProvider>
              <SidebarProvider>
                  {children}
              </SidebarProvider>
            </ThemeProvider>
          </I18nProvider>
        </StoreProvider>
      </body>
    </html>
  );
}

'use client';
import { SessionProvider } from 'next-auth/react';
import { CartProvider } from './CartContext';
import { CompareProvider } from './CompareContext';
import { WishlistProvider } from './WishlistContext';
import CompareBar from './CompareBar';
import LanguageSync from './LanguageSync';
import I18nProvider from './I18nProvider';
import { CurrencyProvider } from './CurrencyContext';

import { SWRConfig } from 'swr';

const defaultFetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.info = await res.json().catch(() => ({}));
    error.status = res.status;
    throw error;
  }
  return res.json();
};

export default function Providers({ children, session }) {
  return (
    <SessionProvider session={session}>
      <I18nProvider>
        <CurrencyProvider>
          <SWRConfig value={{ 
            fetcher: defaultFetcher,
            revalidateOnFocus: false,
            dedupingInterval: 5000,
          }}>
            <CartProvider>
              <WishlistProvider>
                <CompareProvider>
                  <LanguageSync />
                  {children}
                  <CompareBar />
                </CompareProvider>
              </WishlistProvider>
            </CartProvider>
          </SWRConfig>
        </CurrencyProvider>
      </I18nProvider>
    </SessionProvider>
  );
}

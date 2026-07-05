'use client';
import { SessionProvider } from 'next-auth/react';
import { CartProvider } from './CartContext';
import { CompareProvider } from './CompareContext';
import CompareBar from './CompareBar';
import LanguageSync from './LanguageSync';
import I18nProvider from './I18nProvider';

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
        <SWRConfig value={{ 
          fetcher: defaultFetcher,
          revalidateOnFocus: false,
          dedupingInterval: 5000,
        }}>
          <CartProvider>
            <CompareProvider>
              <LanguageSync />
              {children}
              <CompareBar />
            </CompareProvider>
          </CartProvider>
        </SWRConfig>
      </I18nProvider>
    </SessionProvider>
  );
}

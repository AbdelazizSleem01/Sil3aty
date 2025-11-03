'use client';
import { SessionProvider } from 'next-auth/react';
import { CartProvider } from './CartContext';
import LanguageSync from './LanguageSync';
import I18nProvider from './I18nProvider';

export default function Providers({ children, session }) {
  return (
    <SessionProvider session={session}>
      <I18nProvider>
        <CartProvider>
          <LanguageSync />
          {children}
        </CartProvider>
      </I18nProvider>
    </SessionProvider>
  );
}

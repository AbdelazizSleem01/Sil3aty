'use client';

import { useEffect } from 'react';
import i18n from '../i18n';

export default function I18nProvider({ children }) {
  useEffect(() => {
    if (!i18n.isInitialized) {
      i18n.init();
    }
  }, []);

  return children;
}

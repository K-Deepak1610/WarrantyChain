import { useEffect } from 'react';

export function usePageTitle(title) {
  useEffect(() => {
    document.title = 'WarrantyChain';
    return () => { document.title = 'WarrantyChain'; };
  }, [title]);
}

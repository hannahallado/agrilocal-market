import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VENDORS_KEY = '@agrilocal_fav_vendors';
const PRODUCTS_KEY = '@agrilocal_fav_products';

const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [favoriteVendors, setFavoriteVendors] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);

  // ─── Load from AsyncStorage on mount ────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [vendorsRaw, productsRaw] = await Promise.all([
          AsyncStorage.getItem(VENDORS_KEY),
          AsyncStorage.getItem(PRODUCTS_KEY),
        ]);
        if (vendorsRaw) setFavoriteVendors(JSON.parse(vendorsRaw));
        if (productsRaw) setFavoriteProducts(JSON.parse(productsRaw));
      } catch (e) {
        console.error('Failed to load favorites:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ─── Vendors ─────────────────────────────────────────────────────────────────
  const addFavoriteVendor = useCallback(async (vendor) => {
    setFavoriteVendors((prev) => {
      if (prev.find((v) => v.id === vendor.id)) return prev;
      const updated = [...prev, vendor];
      AsyncStorage.setItem(VENDORS_KEY, JSON.stringify(updated)).catch(console.error);
      return updated;
    });
  }, []);

  const removeFavoriteVendor = useCallback(async (vendorId) => {
    setFavoriteVendors((prev) => {
      const updated = prev.filter((v) => v.id !== vendorId);
      AsyncStorage.setItem(VENDORS_KEY, JSON.stringify(updated)).catch(console.error);
      return updated;
    });
  }, []);

  const isFavoriteVendor = useCallback(
    (vendorId) => favoriteVendors.some((v) => v.id === vendorId),
    [favoriteVendors]
  );

  // ─── Products ────────────────────────────────────────────────────────────────
  const addFavoriteProduct = useCallback(async (product) => {
    setFavoriteProducts((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev;
      const updated = [...prev, product];
      AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated)).catch(console.error);
      return updated;
    });
  }, []);

  const removeFavoriteProduct = useCallback(async (productId) => {
    setFavoriteProducts((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated)).catch(console.error);
      return updated;
    });
  }, []);

  const isFavoriteProduct = useCallback(
    (productId) => favoriteProducts.some((p) => p.id === productId),
    [favoriteProducts]
  );

  return (
    <FavoritesContext.Provider
      value={{
        loading,
        favoriteVendors,
        favoriteProducts,
        addFavoriteVendor,
        removeFavoriteVendor,
        isFavoriteVendor,
        addFavoriteProduct,
        removeFavoriteProduct,
        isFavoriteProduct,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside <FavoritesProvider>');
  return ctx;
};

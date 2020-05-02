import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);
const KEY_PRODUCTS = '@GoMarketplace#Products';

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storageProducts = await AsyncStorage.getItem(KEY_PRODUCTS).then();
      if (storageProducts) {
        setProducts(JSON.parse(storageProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const newProducts = [...products];
      const indexProduct = newProducts.findIndex(
        item => item.id === product.id,
      );

      if (indexProduct === -1) {
        newProducts.push({ ...product, quantity: 1 });
      } else {
        newProducts[indexProduct].quantity += 1;
      }

      setProducts(newProducts);
      await AsyncStorage.setItem(KEY_PRODUCTS, JSON.stringify(newProducts));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProducts = [...products];
      const indexProduct = newProducts.findIndex(product => product.id === id);
      newProducts[indexProduct].quantity += 1;
      setProducts(newProducts);
      await AsyncStorage.setItem(KEY_PRODUCTS, JSON.stringify(newProducts));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newProducts = [...products];
      const indexProduct = newProducts.findIndex(product => product.id === id);

      if (newProducts[indexProduct].quantity > 1) {
        newProducts[indexProduct].quantity -= 1;
      } else {
        newProducts.splice(indexProduct, 1);
      }

      setProducts(newProducts);
      await AsyncStorage.setItem(KEY_PRODUCTS, JSON.stringify(newProducts));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };

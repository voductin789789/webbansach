// src/providers/CartProvider.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Book, CartItem } from '../types';
import { toast } from '../components/ui/Toast';

interface CartContextType {
  items: CartItem[];
  addToCart: (book: Book, quantity?: number) => void;
  removeItem: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('shopping_cart');
      const parsed: unknown = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed as CartItem[] : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('shopping_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Lỗi lưu giỏ hàng vào localStorage:', e);
    }
  }, [items]);

  const addToCart = (book: Book, quantity = 1) => {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      toast.error('Số lượng thêm vào giỏ hàng không hợp lệ.');
      return;
    }
    if (book.stock !== undefined && book.stock <= 0) {
      toast.error('Sách hiện đã hết hàng.');
      return;
    }

    const item: Omit<CartItem, 'quantity'> = {
      bookId: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
      originalPrice: book.originalPrice,
      coverImage: book.coverImage,
      stock: book.stock,
    };
    const existing = items.find((current) => current.bookId === item.bookId);
    if (item.stock !== undefined && existing && existing.quantity + quantity > item.stock) {
      toast.error(`Chỉ còn ${item.stock} cuốn "${item.title}" trong kho.`);
      return;
    }

    setItems((prev) => {
      const currentItem = prev.find((current) => current.bookId === item.bookId);
      if (currentItem) {
        return prev.map((i) =>
          i.bookId === item.bookId
            ? { ...i, ...item, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
    toast.success(`Đã thêm "${item.title}" vào giỏ hàng!`);
  };

  const removeItem = (bookId: string) => {
    setItems((prev) => prev.filter((i) => i.bookId !== bookId));
    toast.info('Đã xóa sách khỏi giỏ hàng.');
  };

  const updateQuantity = (bookId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(bookId);
      return;
    }
    const item = items.find((current) => current.bookId === bookId);
    if (item?.stock !== undefined && quantity > item.stock) {
      toast.error(`Chỉ còn ${item.stock} cuốn "${item.title}" trong kho.`);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.bookId === bookId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = useMemo(() => {
    return items.reduce((sum, i) => sum + i.quantity, 0);
  }, [items]);

  const totalPrice = useMemo(() => {
    return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart phải được sử dụng bên trong CartProvider');
  }
  return context;
};

export default CartProvider;

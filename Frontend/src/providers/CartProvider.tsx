import React, {createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef} from 'react';
import type {CartItem} from '../types';
import {toast} from '../components/ui/Toast';
import {useAuth} from './AuthProvider';
import {fetchBook} from '../api/bookApi';
import {getCart, addCartItem, setCartQuantity, deleteCartItem, mergeGuestCart} from '../api/cartApi';

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  refreshStock: () => Promise<void>;
  stockLoading: boolean;
  totalItems: number;
  totalPrice: number;
}
const CartContext = createContext<CartContextType | undefined>(undefined);
const GUEST_KEY = 'bookstore_cart_guest';
const asStock = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : undefined;
const readGuest = (): CartItem[] => {
  try { const value = JSON.parse(sessionStorage.getItem(GUEST_KEY) || '[]'); return Array.isArray(value) ? value : []; }
  catch { return []; }
};

const CartStore: React.FC<{children:ReactNode}> = ({children}) => {
  const {user, token, isAuthenticated} = useAuth();
  const signedIn = isAuthenticated && Boolean(token);
  const sessionKey = signedIn ? `${user?.id}:${token}` : 'guest';
  const [items, setItems] = useState<CartItem[]>(() => signedIn ? [] : readGuest());
  const [stockLoading, setStockLoading] = useState(signedIn);
  const active = useRef(sessionKey);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Mỗi tab có phiên JWT riêng, nhưng giỏ của tài khoản được lưu trên MySQL.
  // Không chuyển giỏ của tài khoản A sang tài khoản B khi đổi phiên.
  useEffect(() => {
    active.current = sessionKey;
    let cancelled = false;
    queue.current = Promise.resolve();
    setItems(signedIn ? [] : readGuest());
    if (!signedIn) {setStockLoading(false);return () => {cancelled = true;};}
    setStockLoading(true);
    const initialization = (async () => {
      try {
        const guest = readGuest();
        const serverItems = guest.length ? await mergeGuestCart(guest) : await getCart();
        if (cancelled || active.current !== sessionKey) return;
        setItems(serverItems);
        if (guest.length) sessionStorage.removeItem(GUEST_KEY);
      } catch {if (!cancelled) toast.error('Không thể tải giỏ từ MySQL. Vui lòng thử lại.');}
      finally {if (!cancelled && active.current === sessionKey) setStockLoading(false);}
    })();
    queue.current = initialization;
    return () => {cancelled = true;};
  }, [sessionKey, signedIn]);

  const apply = useCallback((next: CartItem[]) => {
    setItems(next);
    if (!signedIn) sessionStorage.setItem(GUEST_KEY, JSON.stringify(next));
  }, [signedIn]);
  const operate = useCallback((action: () => Promise<CartItem[]>, successMessage?: string) => {
    const current = sessionKey;
    queue.current = queue.current.catch(() => {}).then(async () => {
      try {
        const data = await action();
        if (active.current === current) {
          apply(data);
          if (successMessage) toast.success(successMessage);
        }
      } catch (error: any) {
        if (active.current === current) toast.error(error?.response?.data?.message || 'Không thể cập nhật giỏ hàng.');
      }
    });
  }, [apply, sessionKey]);

  const refreshStock = useCallback(async () => {
    const current = sessionKey;
    setStockLoading(true);
    try {
      if (signedIn) {
        // Đợi các thao tác thêm/sửa/xóa đang thực hiện để không ghi đè kết quả mới.
        await queue.current.catch(() => {});
        const remote = await getCart();
        if (active.current === current) setItems(remote);
      } else {
        const local = readGuest();
        const checked = await Promise.all(local.map(async item => {
          try {
            const book = await fetchBook(item.bookId);
            return {...item, stock: Math.max(0, book.stock ?? 0), price: book.price, title: book.title,
              author: book.author, quantity: Math.min(item.quantity, Math.max(1, book.stock ?? 0))};
          } catch {return {...item,stock:undefined};}
        }));
        if (active.current === current) apply(checked);
      }
    } catch {if (active.current === current) toast.error('Không thể kiểm tra giỏ hàng từ máy chủ.');}
    finally {if (active.current === current) setStockLoading(false);}
  }, [apply, signedIn, sessionKey]);

  const addItem = (item: Omit<CartItem,'quantity'>, quantity = 1) => {
    const stock = asStock(item.stock);
    if (stock === undefined || stock === 0 || !Number.isSafeInteger(quantity) || quantity < 1) {toast.error('Sách hết hàng hoặc chưa xác minh tồn kho.');return;}
    if (signedIn) {
      operate(() => addCartItem(item.bookId, quantity), `Đã thêm "${item.title}" vào giỏ!`);
      return;
    }
    const previous = itemsRef.current.find(i => i.bookId === item.bookId);
    const current = previous?.quantity ?? 0;
    if (current + quantity > stock) {toast.error(`Trong kho chỉ còn ${stock} cuốn.`);return;}
    apply(previous ? itemsRef.current.map(i => i.bookId === item.bookId ? {...i,stock,quantity:i.quantity+quantity} : i)
      : [...itemsRef.current,{...item,quantity}]);
    toast.success('Đã thêm sách vào giỏ hàng!');
  };
  const removeItem = (bookId: string) => {
    if (signedIn) operate(() => deleteCartItem(bookId));
    else apply(itemsRef.current.filter(i => i.bookId !== bookId));
  };
  const updateQuantity = (bookId: string, quantity: number) => {
    if (!Number.isSafeInteger(quantity)) return;
    if (quantity <= 0) {removeItem(bookId);return;}
    const item = itemsRef.current.find(i => i.bookId === bookId);
    if (!item) return;
    if (item.stock === undefined || item.stock <= 0 || quantity > item.stock) {toast.error(`Tồn kho chỉ còn ${item.stock ?? 'chưa xác minh'} cuốn.`);return;}
    if (signedIn) operate(() => setCartQuantity(bookId, quantity));
    else apply(itemsRef.current.map(i => i.bookId === bookId ? {...i,quantity} : i));
  };
  const clearCart = () => {
    // Backend đã xóa đúng những mặt hàng vừa mua trong transaction tạo đơn.
    // Không xóa cả giỏ nếu mua ngay một cuốn hoặc đơn chỉ chứa một phần giỏ.
    if (signedIn) {void refreshStock();}
    else apply([]);
  };
  const totalItems = useMemo(() => items.reduce((sum,i) => sum+i.quantity,0),[items]);
  const totalPrice = useMemo(() => items.reduce((sum,i) => sum+i.price*i.quantity,0),[items]);
  return <CartContext.Provider value={{items,addItem,removeItem,updateQuantity,clearCart,refreshStock,stockLoading,totalItems,totalPrice}}>{children}</CartContext.Provider>;
};
export const CartProvider: React.FC<{children:ReactNode}> = ({children}) => <CartStore>{children}</CartStore>;
export const useCart = () => {const ctx=useContext(CartContext);if(!ctx)throw new Error('useCart phải nằm trong CartProvider');return ctx;};
export default CartProvider;

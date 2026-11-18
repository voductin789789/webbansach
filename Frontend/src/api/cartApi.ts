import { api } from './httpClient';
import type { CartItem } from '../types';

const result = (response: {data: {data: CartItem[]}}) => response.data.data;
export const getCart = async () => result(await api.get('/cart'));
export const addCartItem = async (bookId: string, quantity: number) => result(await api.post('/cart/items', {bookId: Number(bookId), quantity}));
export const setCartQuantity = async (bookId: string, quantity: number) => result(await api.patch(`/cart/items/${encodeURIComponent(bookId)}`, {quantity}));
export const deleteCartItem = async (bookId: string) => result(await api.delete(`/cart/items/${encodeURIComponent(bookId)}`));
export const mergeGuestCart = async (items: CartItem[]) => result(await api.post('/cart/merge', {items: items.map(i => ({bookId: Number(i.bookId), quantity: i.quantity}))}));

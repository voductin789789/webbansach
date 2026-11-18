// src/App.tsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import Spinner from './components/ui/Spinner';
import RouteGuard from './components/common/RouteGuard';

// Lazy load các trang
const HomePage = lazy(() => import('./pages/HomePage'));
const BooksPage = lazy(() => import('./pages/BooksPage'));
const BookDetailPage = lazy(() => import('./pages/BookDetailPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminBooks = lazy(() => import('./pages/admin/AdminBooks'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));

// Loading Page Fallback
const PageLoading: React.FC = () => (
  <div
    style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
    }}
  >
    <Spinner size="lg" color="accent" />
    <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 600 }}>
      Đang tải dữ liệu...
    </span>
  </div>
);

export const App: React.FC = () => {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        {/* PUBLIC CUSTOMER ROUTES (Sử dụng MainLayout: Header + Nav + Footer) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:slug" element={<BooksPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route element={<RouteGuard />}><Route path="/checkout" element={<CheckoutPage />} /><Route path="/profile" element={<ProfilePage />} /><Route path="/my-orders" element={<OrdersPage />} /><Route path="/my-orders/:id" element={<OrderDetailPage />} /></Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/authors" element={<BooksPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* ADMIN ROUTES (Sử dụng AdminLayout: Sidebar + Admin Header) */}
        <Route element={<RouteGuard admin />}><Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="books" element={<AdminBooks />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<div style={{ padding: '20px' }}><h2>Quản Lý Người Dùng (Placeholder FE4)</h2></div>} />
          <Route path="settings" element={<div style={{ padding: '20px' }}><h2>Cấu Hình Hệ Thống (Placeholder)</h2></div>} />
        </Route>

        </Route>

        {/* 404 NOT FOUND */}
        <Route path="*" element={<MainLayout />}>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;

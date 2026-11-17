// src/App.tsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import Spinner from './components/ui/Spinner';
import ProtectedRoute from './components/common/ProtectedRoute';

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
const MyOrdersPage = lazy(() => import('./pages/MyOrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const AddressesPage = lazy(() => import('./pages/AddressesPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminBooks = lazy(() => import('./pages/admin/AdminBooks'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminOperations = lazy(() => import('./pages/admin/AdminOperations'));
const AdminBlog = lazy(() => import('./pages/admin/AdminBlog'));

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
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/my-orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
          <Route path="/order-success/:id" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          <Route path="/addresses" element={<ProtectedRoute><AddressesPage /></ProtectedRoute>} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
        </Route>

        {/* ADMIN ROUTES (Sử dụng AdminLayout: Sidebar + Admin Header) */}
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="books" element={<AdminBooks />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="operations" element={<AdminOperations />} />
          <Route path="blog" element={<AdminBlog />} />
        </Route>
        <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />

      </Routes>
    </Suspense>
  );
};

export default App;

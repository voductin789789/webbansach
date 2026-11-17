// src/components/layout/MainLayout.tsx
import React, { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export const MainLayout: React.FC<{ children?: ReactNode }> = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC' }}>
      <Header />
      <main style={{ flex: 1 }}>
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;

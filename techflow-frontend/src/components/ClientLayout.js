// src/components/ClientLayout.js
'use client';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  // 不需要导航栏的路由：管理后台、卖家后台、登录、注册
  const isAdminPage = pathname?.startsWith('/admin');
  const isSellerPage = pathname?.startsWith('/seller');
  const isAuthPage = pathname === '/login' || pathname === '/register';

  const showNavbar = !isAdminPage && !isSellerPage && !isAuthPage;

  return (
    <>
      {showNavbar && <Navbar />}
      {/* 修改这里：
          pt-20 (80px) 完美匹配移动端导航栏高度
          md:pt-32 (128px) 完美匹配电脑端（主导航+分类栏）高度
      */}
      <main className={showNavbar ? 'pt-20 md:pt-32' : ''}>
        {children}
      </main>
    </>
  );
}
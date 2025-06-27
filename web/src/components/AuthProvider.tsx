'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface Props {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 登录页或 API 路径不做校验，避免死循环
    if (pathname.startsWith('/login')) return;

    const password = localStorage.getItem('password');
    const fullPath =
      typeof window !== 'undefined'
        ? window.location.pathname + window.location.search
        : pathname;

    // 有密码时验证
    (async () => {
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });

        if (!res.ok) {
          // 校验未通过，清理并跳转登录
          localStorage.removeItem('password');
          router.replace(`/login?redirect=${encodeURIComponent(fullPath)}`);
        }
      } catch (error) {
        // 网络错误等也认为未登录
        router.replace(`/login?redirect=${encodeURIComponent(fullPath)}`);
      }
    })();
  }, [pathname, router]);

  return <>{children}</>;
}

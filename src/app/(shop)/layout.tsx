import { ShopLayout } from '@/components/shop/shop-layout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ShopLayout>{children}</ShopLayout>;
}

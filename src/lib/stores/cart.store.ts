import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  imageUrl?: string;
  unitPriceKes: number;
  quantity: number;
  totalPriceKes: number;
}

interface CartStore {
  cartId: string | null;
  sessionId: string | null;
  items: CartItem[];
  subtotalKes: number;
  deliveryFeeKes: number;
  totalKes: number;
  savingsKes: number;
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'totalPriceKes'>) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  setCartId: (id: string) => void;
  setSessionId: (id: string) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartId: null,
      sessionId: null,
      items: [],
      subtotalKes: 0,
      deliveryFeeKes: 20000,
      totalKes: 0,
      savingsKes: 0,
      isOpen: false,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.variantId === item.variantId,
          );
          let newItems: CartItem[];
          if (existing) {
            newItems = state.items.map((i) =>
              i.productId === item.productId && i.variantId === item.variantId
                ? { ...i, quantity: i.quantity + item.quantity, totalPriceKes: i.unitPriceKes * (i.quantity + item.quantity) }
                : i,
            );
          } else {
            newItems = [
              ...state.items,
              { ...item, totalPriceKes: item.unitPriceKes * item.quantity },
            ];
          }
          const subtotalKes = newItems.reduce((s, i) => s + i.totalPriceKes, 0);
          const deliveryFeeKes = subtotalKes >= 100000 ? 0 : 20000;
          return {
            items: newItems,
            subtotalKes,
            deliveryFeeKes,
            totalKes: subtotalKes + deliveryFeeKes,
            isOpen: true,
          };
        }),

      updateQuantity: (productId, variantId, quantity) =>
        set((state) => {
          const newItems =
            quantity <= 0
              ? state.items.filter((i) => !(i.productId === productId && i.variantId === variantId))
              : state.items.map((i) =>
                  i.productId === productId && i.variantId === variantId
                    ? { ...i, quantity, totalPriceKes: i.unitPriceKes * quantity }
                    : i,
                );
          const subtotalKes = newItems.reduce((s, i) => s + i.totalPriceKes, 0);
          const deliveryFeeKes = subtotalKes >= 100000 ? 0 : 20000;
          return { items: newItems, subtotalKes, deliveryFeeKes, totalKes: subtotalKes + deliveryFeeKes };
        }),

      removeItem: (productId, variantId) =>
        set((state) => {
          const newItems = state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId),
          );
          const subtotalKes = newItems.reduce((s, i) => s + i.totalPriceKes, 0);
          const deliveryFeeKes = subtotalKes >= 100000 ? 0 : 20000;
          return { items: newItems, subtotalKes, deliveryFeeKes, totalKes: subtotalKes + deliveryFeeKes };
        }),

      clear: () => set({ items: [], subtotalKes: 0, totalKes: 0, savingsKes: 0 }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      setCartId: (id) => set({ cartId: id }),
      setSessionId: (id) => set({ sessionId: id }),
    }),
    {
      name: 'oda:cart',
      partialize: (state) => ({
        cartId: state.cartId,
        sessionId: state.sessionId,
        items: state.items,
        subtotalKes: state.subtotalKes,
        deliveryFeeKes: state.deliveryFeeKes,
        totalKes: state.totalKes,
        savingsKes: state.savingsKes,
      }),
    },
  ),
);

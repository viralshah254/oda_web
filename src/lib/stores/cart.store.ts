import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  /** Server `cart_items.id` — required for PUT/DELETE sync */
  cartItemId?: string;
  productId: string;
  variantId?: string;
  name: string;
  imageUrl?: string;
  unitPriceKes: number;
  quantity: number;
  totalPriceKes: number;
  mrpKes?: number;
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
  addItem: (item: Omit<CartItem, 'totalPriceKes' | 'cartItemId'>) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  setCartId: (id: string) => void;
  setSessionId: (id: string) => void;
  hydrateFromServer: (payload: {
    cartId: string;
    items: CartItem[];
    subtotalKes: number;
    deliveryFeeKes: number;
    totalKes: number;
    savingsKes: number;
  }) => void;
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

      hydrateFromServer: (payload) =>
        set({
          cartId: payload.cartId,
          items: payload.items,
          subtotalKes: payload.subtotalKes,
          deliveryFeeKes: payload.deliveryFeeKes,
          totalKes: payload.totalKes,
          savingsKes: payload.savingsKes,
        }),

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.variantId === item.variantId,
          );
          let newItems: CartItem[];
          if (existing) {
            newItems = state.items.map((i) =>
              i.productId === item.productId && i.variantId === item.variantId
                ? {
                    ...i,
                    quantity: i.quantity + item.quantity,
                    totalPriceKes: i.unitPriceKes * (i.quantity + item.quantity),
                  }
                : i,
            );
          } else {
            newItems = [
              ...state.items,
              {
                ...item,
                totalPriceKes: item.unitPriceKes * item.quantity,
              },
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

      updateQuantity: (productId, variantId, quantity) => {
        const before = get().items.find((i) => i.productId === productId && i.variantId === variantId);
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
        });

        if (
          before?.cartItemId &&
          typeof window !== 'undefined' &&
          localStorage.getItem('oda_access_token')
        ) {
          const id = before.cartItemId;
          void import('@/lib/cart-server-sync').then((m) => {
            if (quantity <= 0) m.syncCartRemoveOnServer(id);
            else m.syncCartUpdateOnServer(id, quantity);
          });
        }
      },

      removeItem: (productId, variantId) => {
        const line = get().items.find((i) => i.productId === productId && i.variantId === variantId);
        set((state) => {
          const newItems = state.items.filter((i) => !(i.productId === productId && i.variantId === variantId));
          const subtotalKes = newItems.reduce((s, i) => s + i.totalPriceKes, 0);
          const deliveryFeeKes = subtotalKes >= 100000 ? 0 : 20000;
          return { items: newItems, subtotalKes, deliveryFeeKes, totalKes: subtotalKes + deliveryFeeKes };
        });
        if (line?.cartItemId && typeof window !== 'undefined' && localStorage.getItem('oda_access_token')) {
          void import('@/lib/cart-server-sync').then((m) => m.syncCartRemoveOnServer(line.cartItemId!));
        }
      },

      clear: () => {
        void import('@/lib/cart-server-sync').then((m) => m.syncCartClearOnServer());
        set({ items: [], subtotalKes: 0, totalKes: 0, savingsKes: 0, deliveryFeeKes: 20000 });
      },

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

/** After local Zustand merge — push quantity delta to API when logged in. */
export function afterLocalCartAdd(productId: string, quantityDelta: number, variantId?: string): void {
  void import('@/lib/cart-server-sync').then((m) => m.syncCartAddToServer(productId, quantityDelta, variantId));
}

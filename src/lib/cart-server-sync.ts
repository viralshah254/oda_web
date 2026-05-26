import { cartApi } from '@/lib/api-client';
import { useCartStore, type CartItem } from '@/lib/stores/cart.store';

/** Serialized cart mutations so server state stays consistent. */
let syncChain = Promise.resolve();

function enqueue(fn: () => Promise<void>): void {
  syncChain = syncChain.then(fn).catch(() => {});
}

function mapServerRow(row: Record<string, unknown>): CartItem {
  const product = row.product as Record<string, unknown> | undefined;
  const images = product?.images as Array<{ url?: string }> | undefined;
  const urls = product?.imageUrls as string[] | undefined;
  const primary = images?.[0]?.url;
  const imageUrl = (typeof primary === 'string' ? primary : undefined) ?? urls?.[0];
  return {
    id: String(row.id),
    cartItemId: String(row.id),
    productId: String(row.productId),
    variantId: (row.variantId as string | null | undefined) ?? undefined,
    name: String(product?.name ?? 'Product'),
    imageUrl: imageUrl ?? undefined,
    unitPriceKes: Number(row.unitPriceKes ?? 0),
    quantity: Number(row.quantity ?? 1),
    totalPriceKes: Number(row.totalPriceKes ?? 0),
  };
}

export function pullCartIntoStoreFromResponse(data: Record<string, unknown>): void {
  const items = (data.items as Array<Record<string, unknown>> | undefined) ?? [];
  const subtotalKes = Number(data.subtotalKes ?? 0);
  const deliveryFeeKes = Number(data.deliveryFeeKes ?? 20000);
  const totalKes = Number(data.totalKes ?? subtotalKes + deliveryFeeKes);
  const savingsKes = Number(data.savingsKes ?? 0);
  useCartStore.getState().hydrateFromServer({
    cartId: String(data.id),
    items: items.map(mapServerRow),
    subtotalKes,
    deliveryFeeKes,
    totalKes,
    savingsKes,
  });
}

async function fetchAndHydrateCart(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem('oda_access_token')) return;
  const { data } = await cartApi.getCart();
  pullCartIntoStoreFromResponse(data as Record<string, unknown>);
}

/**
 * After local `addItem`, push the delta quantity to the server cart and re-hydrate from server (prices + line ids).
 */
export function syncCartAddToServer(
  productId: string,
  quantityDelta: number,
  variantId?: string,
): void {
  enqueue(async () => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('oda_access_token')) return;
    if (quantityDelta <= 0) return;
    let cartId = useCartStore.getState().cartId;
    if (!cartId) {
      const { data } = await cartApi.getCart();
      cartId = (data as { id?: string }).id ?? null;
      if (cartId) useCartStore.getState().setCartId(cartId);
    }
    if (!cartId) return;
    await cartApi.addItem({
      cartId,
      productId,
      quantity: quantityDelta,
      variantId,
    });
    await fetchAndHydrateCart();
  });
}

export function syncCartUpdateOnServer(cartItemId: string, quantity: number): void {
  enqueue(async () => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('oda_access_token')) return;
    await cartApi.updateItem(cartItemId, quantity);
    await fetchAndHydrateCart();
  });
}

export function syncCartRemoveOnServer(cartItemId: string): void {
  enqueue(async () => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('oda_access_token')) return;
    await cartApi.removeItem(cartItemId);
    await fetchAndHydrateCart();
  });
}

export function syncCartClearOnServer(): void {
  enqueue(async () => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('oda_access_token')) return;
    const cartId = useCartStore.getState().cartId;
    if (cartId) {
      try {
        await cartApi.clearCart(cartId);
      } catch {
        /* ignore */
      }
    }
  });
}

/** Call on cart page mount to align line ids / totals with the API after login or refresh. */
export function hydrateCartFromServerIfAuthed(): void {
  enqueue(fetchAndHydrateCart);
}

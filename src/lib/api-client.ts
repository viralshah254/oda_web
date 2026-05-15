import axios, { AxiosInstance } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE}/v1`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('oda_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const cid =
      (typeof crypto !== 'undefined' && 'randomUUID' in crypto && crypto.randomUUID()) ||
      `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    config.headers['X-Correlation-Id'] = String(
      config.headers['X-Correlation-Id'] ?? cid,
    );
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('oda_access_token');
      localStorage.removeItem('oda_refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// API methods
export const authApi = {
  requestOtp: (phone: string, channel?: string) =>
    apiClient.post('/auth/otp/request', { phone, channel }),
  verifyOtp: (phone: string, otp: string) =>
    apiClient.post('/auth/otp/verify', { phone, otp }),
  getProfile: () => apiClient.get('/auth/profile'),
  logout: () => apiClient.post('/auth/logout'),
};

export const catalogApi = {
  getCategories: () => apiClient.get('/catalog/categories'),
  getCategoryGroups: () => apiClient.get('/catalog/categories/groups'),
  updateCategoryGroup: (id: string, body: Record<string, unknown>) =>
    apiClient.put(`/catalog/categories/groups/${id}`, body),
  getProducts: (params?: Record<string, unknown>) => apiClient.get('/catalog/products', { params }),
  getProduct: (id: string) => apiClient.get(`/catalog/products/${id}`),
  syncProductImages: (id: string, images: Array<Record<string, unknown>>) =>
    apiClient.put(`/catalog/products/${id}/images`, { images }),
  search: (query: string, params?: any) => apiClient.get('/catalog/search', { params: { q: query, ...params } }),
};

export const cartApi = {
  getCart: () => apiClient.get('/cart'),
  addItem: (productId: string, quantity: number, variantId?: string) =>
    apiClient.post('/cart/items', { productId, quantity, variantId }),
  updateItem: (itemId: string, quantity: number) =>
    apiClient.put(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId: string) => apiClient.delete(`/cart/items/${itemId}`),
  applyCoupon: (code: string) => apiClient.post('/cart/coupon', { code }),
  bindWholesaleBranch: (cartId: string, branchId: string) =>
    apiClient.post('/cart/wholesale-branch', { cartId, branchId }),
};

export const checkoutApi = {
  summary: (data: any) => apiClient.post('/cart/checkout/summary', data),
  placeOrder: (data: any) => apiClient.post('/orders', data),
  initiateMpesa: (orderId: string) => apiClient.post(`/payments/mpesa/stk/${orderId}`),
};

export const ordersApi = {
  list: (params?: any) => apiClient.get('/orders', { params }),
  getOrder: (id: string) => apiClient.get(`/orders/${id}`),
  track: (id: string) => apiClient.get(`/orders/${id}/tracking`),
};

export const walletApi = {
  getBalance: () => apiClient.get('/wallet'),
  getTransactions: (page?: number) => apiClient.get('/wallet/transactions', { params: { page } }),
  topUp: (amountKes: number) => apiClient.post('/wallet/topup', { amountKes }),
};

export const cmsApi = {
  getBanners: (section?: string) =>
    apiClient.get('/cms/banners', { params: section ? { section } : undefined }),
  createBanner: (data: Record<string, unknown>) => apiClient.post('/cms/banners', data),
  updateBanner: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/cms/banners/${id}`, data),
  deleteBanner: (id: string) => apiClient.delete(`/cms/banners/${id}`),
};

export const loyaltyApi = {
  getAccount: () => apiClient.get('/loyalty'),
  getTransactions: (page?: number) => apiClient.get('/loyalty/transactions', { params: { page } }),
  convertToWallet: (points: number) => apiClient.post('/loyalty/convert', { points }),
};

export const dealsApi = {
  // Public
  listActive: () => apiClient.get('/deals'),
  getBySlug: (slug: string) => apiClient.get(`/deals/${slug}`),

  // Admin
  adminListAll: () => apiClient.get('/admin/deals'),
  adminCreate: (data: Record<string, unknown>) => apiClient.post('/admin/deals', data),
  adminUpdate: (id: string, data: Record<string, unknown>) => apiClient.put(`/admin/deals/${id}`, data),
  adminDelete: (id: string) => apiClient.delete(`/admin/deals/${id}`),
  adminAddProduct: (
    id: string,
    data: { productId: string; sortOrder?: number; rowIndex?: number; colIndex?: number; isHighlighted?: boolean },
  ) => apiClient.post(`/admin/deals/${id}/products`, data),
  adminUpdateProduct: (
    id: string,
    productId: string,
    data: { sortOrder?: number; rowIndex?: number; colIndex?: number; isHighlighted?: boolean },
  ) => apiClient.put(`/admin/deals/${id}/products/${productId}`, data),
  adminRemoveProduct: (id: string, productId: string) =>
    apiClient.delete(`/admin/deals/${id}/products/${productId}`),
};

export const b2bApi = {
  register: (body: Record<string, unknown>, idempotencyKey?: string) =>
    apiClient.post('/b2b/register', body, {
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
    }),
  getProfile: (businessId?: string) =>
    apiClient.get('/b2b/profile', {
      headers: businessId ? { 'X-B2B-Business-Id': businessId } : undefined,
    }),
  getDocumentCapabilities: () => apiClient.get('/b2b/documents/capabilities'),
  presignKyc: (
    businessId: string,
    body: {
      documentType: string;
      mimeType: string;
      contentLength: number;
      filename?: string;
    },
  ) =>
    apiClient.post('/b2b/documents/presign', body, {
      headers: { 'X-B2B-Business-Id': businessId },
    }),
  confirmKyc: (businessId: string, body: { uploadId: string; etag?: string }) =>
    apiClient.post('/b2b/documents/confirm', body, {
      headers: { 'X-B2B-Business-Id': businessId },
    }),
  uploadKycMultipart: (
    businessId: string,
    formData: FormData,
    onProgress?: (pct: number) => void,
  ) =>
    apiClient.post('/b2b/documents', formData, {
      headers: {
        'X-B2B-Business-Id': businessId,
      },
      onUploadProgress: (evt) => {
        if (evt.total && onProgress) onProgress(Math.round((evt.loaded / evt.total) * 100));
      },
    }),
};

export const documentsApi = {
  getViewUrl: (documentId: string) => apiClient.get(`/documents/${documentId}/view-url`),
};

export const adminB2bApi = {
  list: (params?: Record<string, unknown>) => apiClient.get('/admin/b2b/applications', { params }),
  exportCsvBlob: (params?: Record<string, unknown>) =>
    apiClient.get('/admin/b2b/applications/export.csv', { params, responseType: 'blob' }),
  getSummary: (id: string) => apiClient.get(`/admin/b2b/applications/${id}`),
  review: (id: string, body: Record<string, unknown>) =>
    apiClient.post(`/admin/b2b/applications/${id}/review`, body),
  openReview: (id: string) => apiClient.post(`/admin/b2b/applications/${id}/open-review`, {}),
  getKycDocumentViewUrl: (businessId: string, documentId: string) =>
    apiClient.get(`/admin/b2b/applications/${businessId}/kyc-documents/${documentId}/view-url`),
  /** Binary stream for local-disk KYC files — use with responseType: 'blob' */
  getKycDocumentFile: (documentId: string) =>
    apiClient.get(`/admin/b2b/kyc-documents/${documentId}/file`, { responseType: 'blob' }),
};

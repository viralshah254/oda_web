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
  requestOtp: (credential: { phone?: string; email?: string }, channel?: string) =>
    apiClient.post('/auth/otp/request', {
      ...credential,
      ...(channel ? { channel } : {}),
    }),
  verifyOtp: (credential: { phone?: string; email?: string }, otp: string) =>
    apiClient.post('/auth/otp/verify', { ...credential, otp }),
  loginWithPassword: (credential: { email?: string; phone?: string }, password: string) =>
    apiClient.post('/auth/login/password', { ...credential, password }),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post('/auth/password/change', { currentPassword, newPassword }),
  getProfile: () => apiClient.get('/auth/profile'),
  logout: () => apiClient.post('/auth/logout'),
};

export const addressApi = {
  list: () => apiClient.get('/addresses'),
  create: (data: Record<string, unknown>) => apiClient.post('/addresses', data),
  update: (id: string, data: Record<string, unknown>) => apiClient.put(`/addresses/${id}`, data),
  remove: (id: string) => apiClient.delete(`/addresses/${id}`),
  setDefault: (id: string) => apiClient.put(`/addresses/${id}/set-default`, {}),
};

export const supportApi = {
  listTickets: (params?: any) => apiClient.get('/support/tickets', { params }),
  createTicket: (data: { subject: string; description: string; category?: string }) =>
    apiClient.post('/support/tickets', data),
};

export const wishlistApi = {
  list: () => apiClient.get('/wishlist'),
  add: (productId: string) => apiClient.post('/wishlist', { productId }),
  remove: (productId: string) => apiClient.delete(`/wishlist/${productId}`),
};

export const recurringApi = {
  list: () => apiClient.get('/recurring'),
  pause: (id: string) => apiClient.post(`/recurring/${id}/pause`, {}),
  resume: (id: string) => apiClient.post(`/recurring/${id}/resume`, {}),
  skip: (id: string) => apiClient.post(`/recurring/${id}/skip`, {}),
  remove: (id: string) => apiClient.delete(`/recurring/${id}`),
};

export const adminApi = {
  getDashboard: () => apiClient.get('/admin/dashboard'),
  getRolloutCities: () => apiClient.get('/admin/rollout/cities'),
  applyPenalty: (data: {
    orderId: string;
    actorType: string;
    actorId: string;
    penaltyKes: number;
    evidenceRefs: string[];
    reason: string;
  }) => apiClient.post('/admin/penalties', data),
  getOrders: (params?: Record<string, unknown>) => apiClient.get('/admin/orders', { params }),
  getCustomers: (params?: Record<string, unknown>) => apiClient.get('/admin/customers', { params }),
  getSuppliers: (params?: Record<string, unknown>) => apiClient.get('/admin/suppliers', { params }),
  getRiders: (params?: Record<string, unknown>) => apiClient.get('/admin/riders', { params }),
  getCampaigns: (params?: Record<string, unknown>) => apiClient.get('/admin/campaigns', { params }),
  approveCampaign: (id: string) => apiClient.post(`/admin/campaigns/${id}/approve`, {}),
  rejectCampaign: (id: string, reason: string) =>
    apiClient.post(`/admin/campaigns/${id}/reject`, { reason }),
  getPriceRules: (productId: string) => apiClient.get(`/pricing/tiers/${productId}`),
  updatePriceRule: (productId: string, data: Record<string, unknown>) =>
    apiClient.put(`/pricing/rules/${productId}`, data),
  upsertPriceTier: (productId: string, data: Record<string, unknown>) =>
    apiClient.post(`/pricing/tiers/${productId}`, data),
  deletePriceTier: (tierId: string) => apiClient.delete(`/pricing/tiers/tier/${tierId}`),
  simulatePrice: (data: Record<string, unknown>) => apiClient.post('/pricing/simulate', data),
};

export const promotionsAdminApi = {
  list: () => apiClient.get('/promotions'),
  create: (data: Record<string, unknown>) => apiClient.post('/promotions', data),
};

export const returnsAdminApi = {
  queue: (params?: Record<string, unknown>) => apiClient.get('/returns/admin/queue', { params }),
  review: (id: string, data: Record<string, unknown>) => apiClient.post(`/returns/${id}/review`, data),
};

export const supportAdminApi = {
  queue: (params?: Record<string, unknown>) => apiClient.get('/support/admin/queue', { params }),
};

export const analyticsAdminApi = {
  profitability: (params?: Record<string, unknown>) => apiClient.get('/analytics/profitability', { params }),
};

export const dataQualityAdminApi = {
  getReport: () => apiClient.get('/admin/data-quality'),
};

export const moderationAdminApi = {
  queue: (params?: Record<string, unknown>) => apiClient.get('/admin/moderation', { params }),
  approve: (id: string) => apiClient.post(`/admin/moderation/${id}/approve`, {}),
  reject: (id: string, reason: string) => apiClient.post(`/admin/moderation/${id}/reject`, { reason }),
};

export const importAdminApi = {
  list: () => apiClient.get('/admin/imports'),
  create: (data: Record<string, unknown>) => apiClient.post('/admin/imports', data),
  getJob: (id: string) => apiClient.get(`/admin/imports/${id}`),
};

export const featureFlagsAdminApi = {
  list: () => apiClient.get('/feature-flags'),
  toggle: (key: string, enabled: boolean) => apiClient.put(`/feature-flags/${key}/toggle`, { isEnabled: enabled }),
};

export const paymentsAdminApi = {
  reconciliation: (params?: Record<string, unknown>) => apiClient.get('/admin/payments/reconciliation', { params }),
};

export const notificationsAdminApi = {
  campaigns: () => apiClient.get('/admin/notifications/campaigns'),
  createCampaign: (data: Record<string, unknown>) => apiClient.post('/admin/notifications/campaigns', data),
};

export const ordersCommandAdminApi = {
  board: (params?: Record<string, unknown>) => apiClient.get('/admin/orders/command', { params }),
};

export const aiAdminApi = {
  insights: () => apiClient.get('/admin/ai/insights'),
  demandForecast: (params?: { branchId?: string; horizonDays?: number }) =>
    apiClient.get('/admin/ai/demand-forecast', { params }),
};

export const supplierApi = {
  getProfile: () => apiClient.get('/supplier/profile'),
  getOrders: (params?: Record<string, unknown>) => apiClient.get('/supplier/orders', { params }),
  acceptOrder: (id: string) => apiClient.post(`/supplier/orders/${id}/accept`, {}),
  markReady: (id: string) => apiClient.post(`/supplier/orders/${id}/ready`, {}),
  initHandover: (id: string, data?: { riderId?: string }) =>
    apiClient.post(`/supplier/orders/${id}/handover`, data ?? {}),
  getHandover: (id: string) => apiClient.get(`/supplier/orders/${id}/handover`),
  getSettlements: (params?: { page?: number }) =>
    apiClient.get('/supplier/settlements', { params: { page: params?.page ?? 1 } }),
};

export const manufacturerApi = {
  getDashboard: (manufacturerId: string) =>
    apiClient.get('/manufacturer/dashboard', { params: { manufacturerId } }),
  getCampaigns: (manufacturerId: string, params?: { page?: number }) =>
    apiClient.get('/manufacturer/campaigns', { params: { manufacturerId, page: params?.page ?? 1 } }),
  createCampaign: (manufacturerId: string, data: Record<string, unknown>) =>
    apiClient.post('/manufacturer/campaigns', data, { params: { manufacturerId } }),
  getAnalytics: (manufacturerId: string, from: string, to: string) =>
    apiClient.get('/manufacturer/analytics', { params: { manufacturerId, from, to } }),
};

export const logisticsAdminApi = {
  dashboard: (partnerId: string) => apiClient.get('/logistics/dashboard', { params: { partnerId } }),
  activeRiders: (partnerId: string) => apiClient.get('/logistics/riders/active', { params: { partnerId } }),
  fleet: (partnerId: string) => apiClient.get('/logistics/fleet', { params: { partnerId } }),
  createFleet: (body: {
    partnerId: string;
    vehicleType: string;
    plateNumber: string;
    make?: string;
    model?: string;
  }) => apiClient.post('/logistics/fleet', body),
  updateFleet: (
    vehicleId: string,
    body: { partnerId: string; plateNumber?: string; vehicleType?: string; isActive?: boolean },
  ) => apiClient.patch(`/logistics/fleet/${vehicleId}`, body),
  deactivateFleet: (vehicleId: string, partnerId: string) =>
    apiClient.delete(`/logistics/fleet/${vehicleId}`, { params: { partnerId } }),
  dispatch: (orderId: string, riderId: string) =>
    apiClient.post('/logistics/dispatch', { orderId, riderId }),
  settlements: (partnerId: string) => apiClient.get('/logistics/settlements', { params: { partnerId } }),
  disputes: (partnerId: string, status?: string) =>
    apiClient.get('/logistics/disputes', { params: { partnerId, status } }),
};

export const fraudAdminApi = {
  queue: (params?: { page?: number; limit?: number }) => apiClient.get('/admin/fraud/queue', { params }),
  score: (userId: string) => apiClient.get(`/admin/fraud/users/${userId}/score`),
  flag: (userId: string, reason: string) => apiClient.post(`/admin/fraud/users/${userId}/flag`, { reason }),
  clear: (userId: string, note?: string) => apiClient.post(`/admin/fraud/users/${userId}/clear`, { note }),
};

export const queueOpsAdminApi = {
  stats: () => apiClient.get('/admin/queues'),
  dlq: (name: string, page?: number) => apiClient.get(`/admin/queues/${name}/dlq`, { params: { page } }),
  replay: (name: string, jobId: string) => apiClient.post(`/admin/queues/${name}/replay/${jobId}`, {}),
  quarantine: (name: string, jobId: string, reason: string) =>
    apiClient.post(`/admin/queues/${name}/quarantine/${jobId}`, { reason }),
  history: (name: string, params?: { status?: string; page?: number }) =>
    apiClient.get(`/admin/queues/${name}/history`, { params }),
};

export const erpAdminApi = {
  integrations: () => apiClient.get('/admin/erp/integrations'),
  jobs: (tenantId: string, page?: number) =>
    apiClient.get('/admin/erp/jobs', { params: { tenantId, page } }),
  sync: (tenantId: string, entityType: string) =>
    apiClient.post('/admin/erp/sync', { tenantId, entityType }),
};

export const securityAdminApi = {
  listImpersonation: () => apiClient.get('/admin/impersonation'),
  startImpersonation: (targetUserId: string, reason: string, writeAccess?: boolean) =>
    apiClient.post('/admin/impersonation', { targetUserId, reason, writeAccess }),
  endImpersonation: (sessionId: string) => apiClient.delete(`/admin/impersonation/${sessionId}`),
  listApiKeys: () => apiClient.get('/admin/api-keys'),
  createApiKey: (data: { name: string; scopes: string[]; expiresAt?: string }) =>
    apiClient.post('/admin/api-keys', data),
  revokeApiKey: (id: string) => apiClient.delete(`/admin/api-keys/${id}`),
  rotateApiKey: (id: string) => apiClient.post(`/admin/api-keys/${id}/rotate`, {}),
  listExports: (page?: number) => apiClient.get('/exports', { params: { page } }),
  requestExport: (data: { exportType: string; format: string; filters?: Record<string, unknown> }) =>
    apiClient.post('/exports', data),
  getExport: (jobId: string) => apiClient.get(`/exports/${jobId}`),
};

export const ledgerAdminApi = {
  reconciliation: () => apiClient.get('/admin/ledger/reconciliation'),
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
  addItem: (body: { cartId: string; productId: string; quantity: number; variantId?: string }) =>
    apiClient.post('/cart/items', body),
  updateItem: (itemId: string, quantity: number) =>
    apiClient.put(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId: string) => apiClient.delete(`/cart/items/${itemId}`),
  clearCart: (cartId: string) => apiClient.delete(`/cart/${cartId}/clear`),
  applyCoupon: (code: string) => apiClient.post('/cart/coupon', { code }),
  bindWholesaleBranch: (cartId: string, branchId: string) =>
    apiClient.post('/cart/wholesale-branch', { cartId, branchId }),
};

export const recommendationsApi = {
  preCheckout: (excludeIds: string[]) =>
    apiClient.get('/recommendations/pre-checkout', {
      params: { exclude: excludeIds.length ? excludeIds.join(',') : undefined },
    }),
};

export const checkoutApi = {
  summary: (data: any) => apiClient.post('/checkout/summary', data),
  placeOrder: (data: {
    addressId: string;
    paymentMethod: string;
    couponCode?: string;
    walletCreditKes?: number;
    idempotencyKey?: string;
    b2bDeliveryWindowId?: string;
  }) => apiClient.post('/checkout/place-order', data),
  initiateMpesa: (orderId: string) => apiClient.post(`/payments/mpesa/stk-push`, { orderId }),
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

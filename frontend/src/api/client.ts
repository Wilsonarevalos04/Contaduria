import {
  DashboardStats,
  Entity,
  EntityType,
  Category,
  Transaction,
  Receipt,
  TransactionType,
  AccountStatementResponse,
} from '../types';

const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.message || 'Error en la petición al servidor');
  }
  return data;
}

export const api = {
  // Dashboard
  async getDashboard(params?: { startDate?: string; endDate?: string; entity_id?: string }): Promise<{ success: boolean; data: DashboardStats }> {
    const query = new URLSearchParams();
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.entity_id) query.append('entity_id', params.entity_id);
    return request(`/dashboard/stats?${query.toString()}`);
  },

  // Entidades
  async getEntities(params?: { type?: EntityType; search?: string }): Promise<{ success: boolean; data: Entity[] }> {
    const query = new URLSearchParams();
    if (params?.type) query.append('type', params.type);
    if (params?.search) query.append('search', params.search);
    return request(`/entities?${query.toString()}`);
  },

  async getEntity(id: string): Promise<{ success: boolean; data: Entity & { transactions: Transaction[] } }> {
    return request(`/entities/${id}`);
  },

  async createEntity(payload: Partial<Entity>): Promise<{ success: boolean; data: Entity }> {
    return request('/entities', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateEntity(id: string, payload: Partial<Entity>): Promise<{ success: boolean; data: Entity }> {
    return request(`/entities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteEntity(id: string): Promise<{ success: boolean; message: string }> {
    return request(`/entities/${id}`, {
      method: 'DELETE',
    });
  },

  // Categorías
  async getCategories(type?: TransactionType): Promise<{ success: boolean; data: Category[] }> {
    const query = type ? `?type=${type}` : '';
    return request(`/categories${query}`);
  },

  async createCategory(payload: { name: string; transaction_type: TransactionType; description?: string }): Promise<{ success: boolean; data: Category }> {
    return request('/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Transacciones
  async getTransactions(params?: {
    type?: TransactionType;
    entity_id?: string;
    category_id?: string;
    status?: string;
    currency?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<{
    success: boolean;
    data: Transaction[];
    summary: { totalIncome: number; totalExpense: number; balance: number; totalCount: number };
  }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val) query.append(key, val);
      });
    }
    return request(`/transactions?${query.toString()}`);
  },

  async createTransaction(payload: any): Promise<{ success: boolean; data: Transaction }> {
    return request('/transactions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateTransaction(id: string, payload: any): Promise<{ success: boolean; data: Transaction }> {
    return request(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteTransaction(id: string): Promise<{ success: boolean; message: string }> {
    return request(`/transactions/${id}`, {
      method: 'DELETE',
    });
  },

  // Recibos
  async getReceipts(params?: { status?: string; search?: string }): Promise<{ success: boolean; data: Receipt[] }> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    return request(`/receipts?${query.toString()}`);
  },

  async createReceipt(transaction_id: string): Promise<{ success: boolean; data: Receipt }> {
    return request('/receipts/generate', {
      method: 'POST',
      body: JSON.stringify({ transaction_id }),
    });
  },

  async voidReceipt(id: string): Promise<{ success: boolean; message: string; data: Receipt }> {
    return request(`/receipts/${id}/void`, {
      method: 'POST',
    });
  },

  getReceiptPdfUrl(receiptIdOrNumber: string, download = false): string {
    return `${API_BASE}/receipts/${receiptIdOrNumber}/pdf${download ? '?download=true' : ''}`;
  },

  // Extracto de Cuenta Bancario / Contable
  async getStatement(params?: {
    startDate?: string;
    endDate?: string;
    entity_id?: string;
    currency?: string;
    payment_method?: string;
  }): Promise<AccountStatementResponse> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val && val !== 'all') query.append(key, val);
      });
    }
    return request(`/statement?${query.toString()}`);
  },

  getStatementPdfUrl(
    params?: {
      startDate?: string;
      endDate?: string;
      entity_id?: string;
      currency?: string;
      payment_method?: string;
      download?: boolean;
    }
  ): string {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '' && val !== 'all') {
          query.append(key, String(val));
        }
      });
    }
    return `${API_BASE}/statement/pdf?${query.toString()}`;
  },
};

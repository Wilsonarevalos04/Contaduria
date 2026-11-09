export type EntityType = 'CLIENT' | 'SUPPLIER';
export type TransactionType = 'INCOME' | 'EXPENSE';
export type PaymentMethod = 'CASH' | 'TRANSFER' | 'CHEQUE' | 'CARD';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';
export type ReceiptStatus = 'VALID' | 'VOIDED';
export type Currency = 'GS' | 'USD';

export interface Entity {
  id: string;
  entity_type: EntityType;
  name: string;
  document_number: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  total_transactions?: number;
  total_income?: number;
  total_expense?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  transaction_type: TransactionType;
  description?: string | null;
  created_at?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  entity_id: string;
  category_id?: string | null;
  transaction_type: TransactionType;
  amount: number | string;
  currency: Currency;
  payment_method: PaymentMethod;
  concept: string;
  reference_number?: string | null;
  transaction_date: string;
  status: TransactionStatus;
  created_at?: string;
  updated_at?: string;
  
  // Joined fields
  entity_name?: string;
  entity_doc?: string;
  entity_type?: EntityType;
  category_name?: string;
  user_name?: string;
  receipt_id?: string | null;
  receipt_number?: string | null;
  receipt_status?: ReceiptStatus | null;
}

export interface Receipt {
  id: string;
  transaction_id: string;
  receipt_number: string;
  issue_date: string;
  pdf_url?: string | null;
  status: ReceiptStatus;
  created_at?: string;

  // Joined fields
  amount?: number | string;
  currency?: Currency;
  concept?: string;
  payment_method?: PaymentMethod;
  reference_number?: string | null;
  transaction_date?: string;
  transaction_type?: TransactionType;
  entity_id?: string;
  entity_name?: string;
  entity_doc?: string;
  entity_type?: EntityType;
  category_name?: string;
  user_name?: string;
}

export interface DashboardStats {
  kpis: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    totalTransactions: number;
    clientCount: number;
    supplierCount: number;
    validReceipts: number;
    voidedReceipts: number;
  };
  cashFlow: Array<{
    month: string;
    ingresos: number;
    egresos: number;
    balance: number;
  }>;
  categoryBreakdown: {
    expenses: Array<{ name: string; value: number }>;
    incomes: Array<{ name: string; value: number }>;
  };
  recentTransactions: Transaction[];
}

export interface StatementItem {
  id: string;
  transaction_date: string;
  concept: string;
  reference_number?: string | null;
  entity_id: string;
  entity_name: string;
  entity_doc: string;
  entity_type: EntityType;
  category_name?: string | null;
  payment_method: PaymentMethod;
  transaction_type: TransactionType;
  amount: number;
  currency: Currency;
  debit: number;
  credit: number;
  running_balance: number;
  receipt_id?: string | null;
  receipt_number?: string | null;
  receipt_status?: ReceiptStatus | null;
}

export interface StatementSummary {
  startDate: string;
  endDate: string;
  currency: Currency;
  initialBalance: number;
  totalCredits: number;
  totalDebits: number;
  netChange: number;
  finalBalance: number;
  transactionCount: number;
  paymentMethod: string;
  entity?: {
    id: string;
    name: string;
    document_number: string;
    entity_type: EntityType;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  } | null;
}

export interface AccountStatementResponse {
  success: boolean;
  summary: StatementSummary;
  items: StatementItem[];
}

import { Currency, PaymentMethod, TransactionStatus } from '../types';

export function formatCurrency(amount: number | string | undefined | null, currency: Currency = 'GS'): string {
  const num = Number(amount) || 0;
  if (currency === 'USD') {
    return `$ ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `₲ ${Math.round(num).toLocaleString('es-PY')}`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  // Evitar desajustes de zona horaria si viene en formato YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }
  const date = new Date(dateString);
  return date.toLocaleDateString('es-PY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  CASH: 'Efectivo',
  TRANSFER: 'Transferencia',
  CHEQUE: 'Cheque',
  CARD: 'Tarjeta',
};

export const statusLabels: Record<TransactionStatus, { label: string; bg: string; text: string }> = {
  COMPLETED: { label: 'Completado', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700' },
  PENDING: { label: 'Pendiente', bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700' },
  CANCELLED: { label: 'Anulado', bg: 'bg-rose-50 text-rose-700 border-rose-200', text: 'text-rose-700' },
};

import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  FileCheck2,
  Trash2,
  Calendar,
  Building2,
  CreditCard,
  FileText,
} from 'lucide-react';
import { Transaction, TransactionType, Entity, Category } from '../../types';
import { api } from '../../api/client';
import { formatCurrency, formatDate, paymentMethodLabels } from '../../utils/formatters';

interface LibroDiarioViewProps {
  transactions: Transaction[];
  summary: { totalIncome: number; totalExpense: number; balance: number; totalCount: number };
  loading: boolean;
  onRefresh: () => void;
  onOpenNewTx: (type: 'INCOME' | 'EXPENSE') => void;
  onViewReceipt: (receiptId: string) => void;
  entities: Entity[];
  categories: Category[];
  filters: any;
  setFilters: React.Dispatch<React.SetStateAction<any>>;
}

export const LibroDiarioView: React.FC<LibroDiarioViewProps> = ({
  transactions,
  summary,
  loading,
  onRefresh,
  onOpenNewTx,
  onViewReceipt,
  entities,
  categories,
  filters,
  setFilters,
}) => {
  const [generatingReceiptTxId, setGeneratingReceiptTxId] = useState<string | null>(null);

  const handleCreateReceipt = async (txId: string) => {
    try {
      setGeneratingReceiptTxId(txId);
      const res = await api.createReceipt(txId);
      onRefresh();
      onViewReceipt(res.data.id);
    } catch (err: any) {
      alert(err.message || 'Error al emitir el recibo');
    } finally {
      setGeneratingReceiptTxId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este registro del Libro Diario?')) {
      try {
        await api.deleteTransaction(id);
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Error al eliminar');
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Barra de Resumen Rápido de Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="border-r border-slate-100 last:border-0 pr-3">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Total Ingresos
          </span>
          <span className="text-base font-extrabold text-emerald-700 mono-num block mt-0.5">
            +{formatCurrency(summary.totalIncome, 'GS')}
          </span>
        </div>

        <div className="border-r border-slate-100 last:border-0 pr-3">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Total Egresos
          </span>
          <span className="text-base font-extrabold text-rose-700 mono-num block mt-0.5">
            -{formatCurrency(summary.totalExpense, 'GS')}
          </span>
        </div>

        <div className="border-r border-slate-100 last:border-0 pr-3">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Saldo del Filtro
          </span>
          <span
            className={`text-base font-extrabold mono-num block mt-0.5 ${
              summary.balance >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {formatCurrency(summary.balance, 'GS')}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Registros
          </span>
          <span className="text-base font-extrabold text-slate-800 mono-num block mt-0.5">
            {summary.totalCount} operaciones
          </span>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Campo de búsqueda */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por concepto, cliente, RUC o nro de referencia..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none"
            />
          </div>

          {/* Selector de Tipo (Todos / Ingreso / Egreso) */}
          <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 w-full md:w-auto">
            <button
              onClick={() => setFilters({ ...filters, type: undefined })}
              className={`flex-1 md:flex-none px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                !filters.type ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilters({ ...filters, type: 'INCOME' })}
              className={`flex-1 md:flex-none px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filters.type === 'INCOME'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Ingresos (+)
            </button>
            <button
              onClick={() => setFilters({ ...filters, type: 'EXPENSE' })}
              className={`flex-1 md:flex-none px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filters.type === 'EXPENSE'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Egresos (-)
            </button>
          </div>

          {/* Botón registrar */}
          <button
            onClick={() => onOpenNewTx('INCOME')}
            className="w-full md:w-auto flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md shadow-emerald-600/30 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Operación</span>
          </button>
        </div>

        {/* Filtros secundarios: Fechas y Entidades */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Desde:</span>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="px-2 py-1 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-slate-500">
            <span>Hasta:</span>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="px-2 py-1 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-slate-500">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.entity_id || 'all'}
              onChange={(e) => setFilters({ ...filters, entity_id: e.target.value })}
              className="px-2 py-1 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 bg-white"
            >
              <option value="all">Todas las entidades</option>
              {entities.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          {(filters.search || filters.type || filters.startDate || filters.endDate || (filters.entity_id && filters.entity_id !== 'all')) && (
            <button
              onClick={() =>
                setFilters({ search: '', type: undefined, startDate: '', endDate: '', entity_id: 'all' })
              }
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 ml-auto"
            >
              Limpiar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabla del Libro Diario */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Concepto & Ref.</th>
                <th className="py-3 px-4">Entidad (Cliente/Prov.)</th>
                <th className="py-3 px-4">Rubro</th>
                <th className="py-3 px-4">Pago</th>
                <th className="py-3 px-4 text-right">Monto</th>
                <th className="py-3 px-4 text-center">Recibo Oficial</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    Cargando transacciones del Libro Diario...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No se encontraron transacciones registradas con los filtros actuales.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isIncome = tx.transaction_type === 'INCOME';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 text-slate-600 mono-num whitespace-nowrap">
                        {formatDate(tx.transaction_date)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            isIncome
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isIncome ? (
                            <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3 text-rose-600" />
                          )}
                          {isIncome ? 'Ingreso' : 'Egreso'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-800 truncate">{tx.concept}</div>
                        {tx.reference_number && (
                          <div className="text-[11px] text-slate-400 font-mono">
                            Ref: {tx.reference_number}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{tx.entity_name}</div>
                        <div className="text-[11px] text-slate-400 mono-num">RUC: {tx.entity_doc}</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 text-[11px]">
                          {tx.category_name || 'General'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 text-[11px]">
                        {paymentMethodLabels[tx.payment_method] || tx.payment_method}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold mono-num whitespace-nowrap">
                        <span className={`text-sm ${isIncome ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {isIncome ? '+' : '-'} {formatCurrency(tx.amount, tx.currency)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {tx.receipt_id ? (
                          <button
                            onClick={() => onViewReceipt(tx.receipt_id!)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                            <span>{tx.receipt_number}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCreateReceipt(tx.id)}
                            disabled={generatingReceiptTxId === tx.id}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                          >
                            <FileText className="w-3 h-3 text-slate-500" />
                            <span>{generatingReceiptTxId === tx.id ? 'Emitiendo...' : 'Generar PDF'}</span>
                          </button>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(tx.id)}
                          title="Eliminar operación"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

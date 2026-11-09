import React from 'react';
import {
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  FileCheck2,
  Users,
  Wallet,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { DashboardStats, Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface DashboardViewProps {
  stats: DashboardStats | null;
  loading: boolean;
  onOpenNewTx: (type: 'INCOME' | 'EXPENSE') => void;
  onViewReceipt: (receiptId: string) => void;
  onNavigateToTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  loading,
  onOpenNewTx,
  onViewReceipt,
  onNavigateToTab,
}) => {
  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">Cargando métricas contables...</p>
        </div>
      </div>
    );
  }

  const kpis = stats?.kpis || {
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    totalTransactions: 0,
    clientCount: 0,
    supplierCount: 0,
    validReceipts: 0,
    voidedReceipts: 0,
  };

  const cashFlow = stats?.cashFlow || [];
  const maxFlow = Math.max(
    ...cashFlow.map((c) => Math.max(c.ingresos, c.egresos)),
    1000000
  );

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Saldo Neto */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Saldo Neto Actual
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                kpis.netBalance >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}
            >
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3
              className={`text-2xl font-black mono-num tracking-tight ${
                kpis.netBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {formatCurrency(kpis.netBalance, 'GS')}
            </h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              Flujo positivo acumulado
            </p>
          </div>
        </div>

        {/* Total Ingresos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ingresos del Período
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 mono-num tracking-tight">
              {formatCurrency(kpis.totalIncome, 'GS')}
            </h3>
            <p className="text-xs text-emerald-600 font-medium mt-1">
              Cobros y honorarios registrados
            </p>
          </div>
        </div>

        {/* Total Egresos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Egresos / Gastos
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 mono-num tracking-tight">
              {formatCurrency(kpis.totalExpense, 'GS')}
            </h3>
            <p className="text-xs text-rose-600 font-medium mt-1">
              Compras, insumos y tributos
            </p>
          </div>
        </div>

        {/* Recibos Emitidos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Recibos Oficiales
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 mono-num tracking-tight">
              {kpis.validReceipts}{' '}
              <span className="text-xs font-semibold text-slate-400">válidos</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {kpis.clientCount} clientes &bull; {kpis.supplierCount} proveedores
            </p>
          </div>
        </div>
      </div>

      {/* Gráficos y Desgloses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flujo de Caja Comparativo */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Flujo de Caja Mensual</h3>
              <p className="text-xs text-slate-400">Comparativa directa de Cobros vs Pagos</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-3 h-3 rounded-md bg-emerald-500"></span> Ingresos
              </span>
              <span className="flex items-center gap-1.5 text-rose-700">
                <span className="w-3 h-3 rounded-md bg-rose-500"></span> Egresos
              </span>
            </div>
          </div>

          {cashFlow.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-slate-400 text-xs">
              No hay suficientes transacciones para el histórico mensual.
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {cashFlow.map((item) => {
                const incomePercent = Math.min(100, Math.round((item.ingresos / maxFlow) * 100));
                const expensePercent = Math.min(100, Math.round((item.egresos / maxFlow) * 100));

                return (
                  <div key={item.month} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 mono-num">{item.month}</span>
                      <div className="flex gap-3 text-xs mono-num">
                        <span className="text-emerald-700 font-semibold">
                          +{formatCurrency(item.ingresos, 'GS')}
                        </span>
                        <span className="text-rose-700 font-semibold">
                          -{formatCurrency(item.egresos, 'GS')}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                      <div className="flex justify-end">
                        <div
                          style={{ width: `${incomePercent}%` }}
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        ></div>
                      </div>
                      <div>
                        <div
                          style={{ width: `${expensePercent}%` }}
                          className="h-full bg-rose-500 rounded-full transition-all duration-500"
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Desglose por Categorías de Gastos */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="font-bold text-slate-800 text-sm">Distribución de Gastos</h3>
          <p className="text-xs text-slate-400 mb-4">Rubros con mayor egreso</p>

          <div className="space-y-3.5">
            {(!stats?.categoryBreakdown?.expenses || stats.categoryBreakdown.expenses.length === 0) ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                No hay egresos categorizados todavía.
              </div>
            ) : (
              stats.categoryBreakdown.expenses.map((cat, i) => {
                const totalExp = kpis.totalExpense || 1;
                const percent = Math.min(100, Math.round((cat.value / totalExp) * 100));
                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700 truncate pr-2">{cat.name}</span>
                      <span className="font-bold text-slate-800 mono-num">
                        {percent}% ({formatCurrency(cat.value, 'GS')})
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className={`h-full rounded-full ${
                          i === 0
                            ? 'bg-rose-500'
                            : i === 1
                            ? 'bg-amber-500'
                            : i === 2
                            ? 'bg-blue-500'
                            : 'bg-slate-400'
                        }`}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Tabla de Movimientos Recientes */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Últimos Movimientos del Libro Diario</h3>
            <p className="text-xs text-slate-400">Operaciones recientes registradas</p>
          </div>
          <button
            onClick={() => onNavigateToTab('transactions')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
          >
            <span>Ver todo el Libro Diario</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Entidad / RUC</th>
                <th className="py-3 px-4">Concepto</th>
                <th className="py-3 px-4">Rubro</th>
                <th className="py-3 px-4 text-right">Monto</th>
                <th className="py-3 px-4 text-center">Recibo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(!stats?.recentTransactions || stats.recentTransactions.length === 0) ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No hay movimientos registrados recientemente.
                  </td>
                </tr>
              ) : (
                stats.recentTransactions.map((tx: Transaction) => {
                  const isIncome = tx.transaction_type === 'INCOME';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-slate-600 mono-num whitespace-nowrap">
                        {formatDate(tx.transaction_date)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{tx.entity_name}</div>
                        <div className="text-[11px] text-slate-400 mono-num">{tx.entity_doc}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium max-w-xs truncate">
                        {tx.concept}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[11px]">
                          {tx.category_name || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold mono-num whitespace-nowrap">
                        <span className={isIncome ? 'text-emerald-700' : 'text-rose-700'}>
                          {isIncome ? '+' : '-'} {formatCurrency(tx.amount, tx.currency)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {tx.receipt_id ? (
                          <button
                            onClick={() => onViewReceipt(tx.receipt_id!)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                            <span>{tx.receipt_number}</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
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

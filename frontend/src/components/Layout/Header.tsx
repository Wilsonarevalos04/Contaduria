import React from 'react';
import { PlusCircle, MinusCircle, RefreshCw, Calendar } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface HeaderProps {
  title: string;
  subtitle: string;
  netBalance?: number;
  onNewTransaction: (type: 'INCOME' | 'EXPENSE') => void;
  onRefresh: () => void;
  loading?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  netBalance = 0,
  onNewTransaction,
  onRefresh,
  loading = false,
}) => {
  const currentDate = new Date().toLocaleDateString('es-PY', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="bg-white border-b border-slate-200/80 px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 shadow-xs">
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          {title}
        </h2>
        <p className="text-xs text-slate-500 capitalize flex items-center gap-1.5 mt-0.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentDate} &bull; {subtitle}</span>
          <span className="hidden sm:inline text-slate-300">&bull;</span>
          <span className="hidden sm:inline text-[#0E0F3D] font-semibold">CP. Arturo Arévalos</span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Saldo Caja Resumido */}
        <div className="hidden lg:flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-xl">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Saldo Actual en Caja
            </span>
            <span
              className={`text-sm font-bold mono-num ${
                netBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {formatCurrency(netBalance, 'GS')}
            </span>
          </div>
        </div>

        {/* Botón Refrescar */}
        <button
          onClick={onRefresh}
          disabled={loading}
          title="Actualizar datos"
          className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
        </button>

        {/* Acceso Directo + Ingreso */}
        <button
          onClick={() => onNewTransaction('INCOME')}
          className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4 text-emerald-600" />
          <span>+ Ingreso</span>
        </button>

        {/* Acceso Directo - Egreso */}
        <button
          onClick={() => onNewTransaction('EXPENSE')}
          className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all active:scale-[0.98]"
        >
          <MinusCircle className="w-4 h-4 text-rose-600" />
          <span>- Egreso</span>
        </button>
      </div>
    </header>
  );
};

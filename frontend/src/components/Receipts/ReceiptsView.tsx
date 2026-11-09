import React, { useState } from 'react';
import {
  Search,
  FileCheck2,
  Download,
  Eye,
  Ban,
  CheckCircle2,
  XCircle,
  Calendar,
  Building2,
} from 'lucide-react';
import { Receipt } from '../../types';
import { api } from '../../api/client';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface ReceiptsViewProps {
  receipts: Receipt[];
  loading: boolean;
  onRefresh: () => void;
  onViewReceipt: (receiptId: string) => void;
}

export const ReceiptsView: React.FC<ReceiptsViewProps> = ({
  receipts,
  loading,
  onRefresh,
  onViewReceipt,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const filtered = receipts.filter((r) => {
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.receipt_number.toLowerCase().includes(q) ||
        (r.entity_name && r.entity_name.toLowerCase().includes(q)) ||
        (r.concept && r.concept.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const validCount = receipts.filter((r) => r.status === 'VALID').length;
  const voidedCount = receipts.filter((r) => r.status === 'VOIDED').length;

  return (
    <div className="space-y-5">
      {/* Barra superior de controles */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Pestañas de estado */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filterStatus === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Todos ({receipts.length})
          </button>
          <button
            onClick={() => setFilterStatus('VALID')}
            className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filterStatus === 'VALID'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Válidos ({validCount})
          </button>
          <button
            onClick={() => setFilterStatus('VOIDED')}
            className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filterStatus === 'VOIDED'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Anulados ({voidedCount})
          </button>
        </div>

        {/* Búsqueda */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por N° Recibo (ej: 001-001) o Entidad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none"
          />
        </div>
      </div>

      {/* Tabla de Recibos */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">N° Recibo Oficial</th>
                <th className="py-3 px-4">Fecha Emisión</th>
                <th className="py-3 px-4">Entidad / RUC</th>
                <th className="py-3 px-4">Concepto Vinculado</th>
                <th className="py-3 px-4 text-right">Monto</th>
                <th className="py-3 px-4 text-center">Estado Legal</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Cargando recibos oficiales...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No se encontraron recibos oficiales emitidos con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const isValid = r.status === 'VALID';
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200">
                          {r.receipt_number}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 mono-num whitespace-nowrap">
                        {formatDate(r.issue_date)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{r.entity_name}</div>
                        <div className="text-[11px] text-slate-400 mono-num">RUC: {r.entity_doc}</div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-700 font-medium">
                        {r.concept}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold mono-num whitespace-nowrap text-sm text-slate-900">
                        {formatCurrency(r.amount, r.currency)}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isValid
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isValid ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-rose-600" />
                          )}
                          {isValid ? 'Válido' : 'Anulado'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onViewReceipt(r.id)}
                            title="Ver Comprobante PDF"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver PDF</span>
                          </button>

                          <a
                            href={api.getReceiptPdfUrl(r.id, true)}
                            download
                            title="Descargar archivo PDF"
                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
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

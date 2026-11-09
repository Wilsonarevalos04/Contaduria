import React, { useEffect, useState } from 'react';
import { X, Building2, Phone, Mail, MapPin, FileCheck2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Entity, Transaction } from '../../types';
import { api } from '../../api/client';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface EntityDetailModalProps {
  entityId: string | null;
  onClose: () => void;
  onViewReceipt: (receiptId: string) => void;
}

export const EntityDetailModal: React.FC<EntityDetailModalProps> = ({
  entityId,
  onClose,
  onViewReceipt,
}) => {
  const [data, setData] = useState<(Entity & { transactions: Transaction[] }) | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!entityId) return;
    setLoading(true);
    api.getEntity(entityId)
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [entityId]);

  if (!entityId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden transition-all animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                {loading ? 'Cargando...' : data?.name}
              </h3>
              <p className="text-xs text-slate-500 mono-num">
                RUC: {data?.document_number} &bull; {data?.entity_type === 'CLIENT' ? 'Cliente' : 'Proveedor'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Cargando historial de la entidad...</div>
          ) : data ? (
            <>
              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Contacto</span>
                  <p className="text-xs font-semibold text-slate-700 mt-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {data.phone || 'No registrado'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {data.email || 'No registrado'}
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 md:col-span-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Dirección Fiscal</span>
                  <p className="text-xs font-semibold text-slate-700 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {data.address || 'Sin dirección registrada'}
                  </p>
                </div>
              </div>

              {/* Transactions History */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600 mb-3">
                  Historial de Operaciones ({data.transactions?.length || 0})
                </h4>

                {(!data.transactions || data.transactions.length === 0) ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                    No hay transacciones registradas para esta entidad.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {data.transactions.map((tx) => {
                      const isIncome = tx.transaction_type === 'INCOME';
                      return (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50/80 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                              }`}
                            >
                              {isIncome ? (
                                <ArrowDownLeft className="w-4 h-4" />
                              ) : (
                                <ArrowUpRight className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-xs text-slate-800">{tx.concept}</p>
                              <p className="text-[11px] text-slate-400">
                                {formatDate(tx.transaction_date)} &bull; {tx.category_name || 'Sin rubro'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-right">
                            <div>
                              <span
                                className={`text-xs font-bold mono-num block ${
                                  isIncome ? 'text-emerald-700' : 'text-rose-700'
                                }`}
                              >
                                {isIncome ? '+' : '-'} {formatCurrency(tx.amount, tx.currency)}
                              </span>
                              <span className="text-[10px] text-slate-400 capitalize">
                                {tx.payment_method.toLowerCase()}
                              </span>
                            </div>

                            {tx.receipt_id && (
                              <button
                                onClick={() => onViewReceipt(tx.receipt_id!)}
                                title="Ver Recibo Oficial"
                                className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                              >
                                <FileCheck2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

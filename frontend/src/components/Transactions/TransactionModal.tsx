import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  FileCheck2,
  AlertCircle,
  Building2,
  Calendar,
  CreditCard,
  Tag,
} from 'lucide-react';
import { Entity, Category, TransactionType, PaymentMethod, Currency } from '../../types';
import { api } from '../../api/client';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tx: any) => void;
  initialType?: TransactionType;
  entities: Entity[];
  categories: Category[];
  onOpenNewEntityModal: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialType = 'INCOME',
  entities,
  categories,
  onOpenNewEntityModal,
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<Currency>('GS');
  const [entityId, setEntityId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [concept, setConcept] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TRANSFER');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [generateReceipt, setGenerateReceipt] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setType(initialType);
    if (initialType === 'EXPENSE') {
      setGenerateReceipt(false);
    } else {
      setGenerateReceipt(true);
    }
  }, [initialType, isOpen]);

  // Filtrar categorías según tipo
  const filteredCategories = categories.filter((c) => c.transaction_type === type);

  // Filtrar entidades según tipo (o mostrar todas si se desea)
  const filteredEntities = entities.filter((e) =>
    type === 'INCOME' ? e.entity_type === 'CLIENT' : e.entity_type === 'SUPPLIER'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Por favor ingrese un monto válido mayor a 0');
      return;
    }

    if (!entityId) {
      setError(`Seleccione un ${type === 'INCOME' ? 'cliente' : 'proveedor'}`);
      return;
    }

    if (!concept.trim()) {
      setError('Ingrese un concepto o descripción para la transacción');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.createTransaction({
        entity_id: entityId,
        category_id: categoryId || null,
        transaction_type: type,
        amount: numericAmount,
        currency,
        payment_method: paymentMethod,
        concept: concept.trim(),
        reference_number: referenceNumber.trim() || null,
        transaction_date: transactionDate,
        status: 'COMPLETED',
        generate_receipt: generateReceipt,
      });

      // Limpiar formulario
      setAmount('');
      setConcept('');
      setReferenceNumber('');
      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la transacción');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden transition-all animate-scale-up">
        {/* Modal Header con pestañas Treinta */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => {
              setType('INCOME');
              setGenerateReceipt(true);
            }}
            className={`flex-1 py-3.5 px-4 font-bold text-sm flex items-center justify-center gap-2 border-b-2 transition-all ${
              type === 'INCOME'
                ? 'bg-white border-emerald-600 text-emerald-700 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
            <span>Ingreso (Cobro)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setType('EXPENSE');
              setGenerateReceipt(false);
            }}
            className={`flex-1 py-3.5 px-4 font-bold text-sm flex items-center justify-center gap-2 border-b-2 transition-all ${
              type === 'EXPENSE'
                ? 'bg-white border-rose-600 text-rose-700 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
            <span>Egreso (Pago)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-3 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="m-4 mb-0 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Monto principal en grande */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
              Monto de la Operación
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 font-bold text-2xl text-slate-400">
                {currency === 'USD' ? '$' : '₲'}
              </span>
              <input
                type="number"
                step="any"
                required
                autoFocus
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-12 pr-28 py-3 text-3xl font-extrabold text-slate-900 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none mono-num"
              />
              <div className="absolute right-2 flex bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setCurrency('GS')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    currency === 'GS'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  GS
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    currency === 'USD'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  USD
                </button>
              </div>
            </div>
          </div>

          {/* Entidad (Cliente o Proveedor) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {type === 'INCOME' ? 'Cliente (Receptor)' : 'Proveedor (Emisor)'}
              </label>
              <button
                type="button"
                onClick={onOpenNewEntityModal}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Nuevo
              </button>
            </div>
            <select
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
            >
              <option value="">Seleccione una entidad...</option>
              {filteredEntities.map((ent) => (
                <option key={ent.id} value={ent.id}>
                  {ent.name} (RUC: {ent.document_number})
                </option>
              ))}
              {filteredEntities.length === 0 && (
                <option disabled value="">
                  No hay entidades registradas de este tipo
                </option>
              )}
            </select>
          </div>

          {/* Concepto / Motivo */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
              Concepto / Detalle
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Honorarios contables mes de Septiembre"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
            />
          </div>

          {/* Grid de 2 columnas: Categoría y Método de Pago */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" /> Rubro Contable
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
              >
                <option value="">(Sin categoría asignada)</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Forma de Pago
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
              >
                <option value="TRANSFER">Transferencia Bancaria</option>
                <option value="CASH">Efectivo</option>
                <option value="CHEQUE">Cheque</option>
                <option value="CARD">Tarjeta Débito/Crédito</option>
              </select>
            </div>
          </div>

          {/* Grid: Referencia y Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                N° Referencia / Cheque
              </label>
              <input
                type="text"
                placeholder="Ej: TRF-90182 o N° Cheque"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Fecha
              </label>
              <input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
              />
            </div>
          </div>

          {/* Switch para Generar Recibo Automático */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileCheck2 className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Emitir Recibo Oficial en PDF
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Asigna correlativo y genera comprobante legal
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={generateReceipt}
                onChange={(e) => setGenerateReceipt(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Botones de acción */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-slate-300 rounded-xl font-semibold text-xs text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs text-white shadow-md transition-all active:scale-[0.98] ${
                type === 'INCOME'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
              } disabled:opacity-50`}
            >
              {submitting ? 'Registrando...' : `Confirmar ${type === 'INCOME' ? 'Ingreso' : 'Egreso'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

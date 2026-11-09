import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Download,
  Printer,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Landmark,
  Wallet,
  FileText,
  User,
  CheckCircle2,
  CalendarDays,
  Building2,
  Receipt as ReceiptIcon,
} from 'lucide-react';
import { api } from '../../api/client';
import {
  Entity,
  StatementItem,
  StatementSummary,
  Currency,
  PaymentMethod,
} from '../../types';

interface StatementViewProps {
  entities: Entity[];
  onViewReceipt?: (receiptId: string) => void;
}

export const StatementView: React.FC<StatementViewProps> = ({
  entities,
  onViewReceipt,
}) => {
  // Rango de fechas por defecto: Mes actual
  const getInitialDates = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const end = now.toISOString().split('T')[0];
    return { start, end };
  };

  const initialDates = getInitialDates();
  const [startDate, setStartDate] = useState(initialDates.start);
  const [endDate, setEndDate] = useState(initialDates.end);
  const [selectedEntityId, setSelectedEntityId] = useState<string>('all');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('GS');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Estados de datos
  const [loading, setLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState<StatementSummary | null>(null);
  const [items, setItems] = useState<StatementItem[]>([]);
  const [activePreset, setActivePreset] = useState<string>('this_month');

  // Cargar extracto
  const fetchStatement = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getStatement({
        startDate,
        endDate,
        entity_id: selectedEntityId,
        currency: selectedCurrency,
        payment_method: selectedPaymentMethod,
      });

      setSummary(res.summary);
      setItems(res.items);
    } catch (error: any) {
      console.error('Error fetching statement:', error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedEntityId, selectedCurrency, selectedPaymentMethod]);

  useEffect(() => {
    fetchStatement();
  }, [fetchStatement]);

  // Manejo de presets de fecha
  const applyPreset = (preset: string) => {
    setActivePreset(preset);
    const now = new Date();

    if (preset === 'this_month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split('T')[0];
      const end = now.toISOString().split('T')[0];
      setStartDate(start);
      setEndDate(end);
    } else if (preset === 'last_month') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        .toISOString()
        .split('T')[0];
      const end = new Date(now.getFullYear(), now.getMonth(), 0)
        .toISOString()
        .split('T')[0];
      setStartDate(start);
      setEndDate(end);
    } else if (preset === 'last_30_days') {
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      const end = now.toISOString().split('T')[0];
      setStartDate(start);
      setEndDate(end);
    } else if (preset === 'this_year') {
      const start = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      const end = now.toISOString().split('T')[0];
      setStartDate(start);
      setEndDate(end);
    } else if (preset === 'all_time') {
      setStartDate('2020-01-01');
      setEndDate(now.toISOString().split('T')[0]);
    }
  };

  // Formateadores
  const formatMoney = (val: number, cur: Currency = selectedCurrency) => {
    const isNeg = val < 0;
    const abs = Math.abs(val);
    if (cur === 'USD') {
      return `${isNeg ? '-' : ''}$ ${abs.toLocaleString('es-PY', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return `${isNeg ? '-' : ''}Gs. ${Math.round(abs).toLocaleString('es-PY')}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const clean = dateStr.split('T')[0];
    const parts = clean.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return clean;
  };

  // Filtrado de filas en pantalla por búsqueda
  const filteredItems = items.filter((item) => {
    if (!searchTerm.trim()) return true;
    const s = searchTerm.toLowerCase();
    return (
      item.concept.toLowerCase().includes(s) ||
      (item.reference_number && item.reference_number.toLowerCase().includes(s)) ||
      (item.receipt_number && item.receipt_number.toLowerCase().includes(s)) ||
      item.entity_name.toLowerCase().includes(s) ||
      item.entity_doc.toLowerCase().includes(s) ||
      (item.category_name && item.category_name.toLowerCase().includes(s))
    );
  });

  // Descargar PDF del Extracto
  const handleDownloadPdf = (download = true) => {
    const url = api.getStatementPdfUrl({
      startDate,
      endDate,
      entity_id: selectedEntityId,
      currency: selectedCurrency,
      payment_method: selectedPaymentMethod,
      download,
    });
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Barra de Título y Acciones Principales */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0E0F3D] to-[#1E293B] text-white flex items-center justify-center shadow-md shadow-slate-900/10 shrink-0">
            <Landmark className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Extracto de Operaciones & Bancario
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                Oficial
              </span>
            </h2>
            <p className="text-sm text-slate-500">
              Control cronológico de movimientos con saldo anterior y acumulado en tiempo real
            </p>
          </div>
        </div>

        {/* Botones de Exportación / Acción */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => fetchStatement()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-300 active:scale-95"
            title="Actualizar datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>

          <button
            onClick={() => handleDownloadPdf(false)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-all shadow-sm active:scale-95"
            title="Vista previa e impresión"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>

          <button
            onClick={() => handleDownloadPdf(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#0E0F3D] to-[#1E3A8A] hover:from-[#171954] hover:to-[#1E40AF] rounded-xl transition-all shadow-md shadow-blue-950/20 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Extracto PDF</span>
          </button>
        </div>
      </div>

      {/* Tarjeta de Filtros Avanzados */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {/* Presets rápidos */}
        <div className="flex items-center gap-2 flex-wrap border-b border-slate-100 pb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
            <CalendarDays className="w-3.5 h-3.5" />
            Períodos:
          </span>
          {[
            { id: 'this_month', label: 'Este Mes' },
            { id: 'last_month', label: 'Mes Pasado' },
            { id: 'last_30_days', label: 'Últimos 30 días' },
            { id: 'this_year', label: 'Año 2026' },
            { id: 'all_time', label: 'Todo el Histórico' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                activePreset === preset.id
                  ? 'bg-[#0E0F3D] text-white shadow-sm font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Inputs de Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Fecha Desde */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Fecha Desde
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setActivePreset('custom');
                }}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#0E0F3D] focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Fecha Hasta */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Fecha Hasta
            </label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setActivePreset('custom');
                }}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#0E0F3D] focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Titular / Entidad */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Cliente / Proveedor
            </label>
            <select
              value={selectedEntityId}
              onChange={(e) => setSelectedEntityId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#0E0F3D] focus:border-transparent outline-none transition"
            >
              <option value="all">Todas las Entidades (General)</option>
              {entities.map((ent) => (
                <option key={ent.id} value={ent.id}>
                  {ent.name} ({ent.document_number})
                </option>
              ))}
            </select>
          </div>

          {/* Moneda */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Moneda
            </label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value as Currency)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#0E0F3D] focus:border-transparent outline-none transition"
            >
              <option value="GS">Guaraníes (GS)</option>
              <option value="USD">Dólares (USD)</option>
            </select>
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Medio de Pago
            </label>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#0E0F3D] focus:border-transparent outline-none transition"
            >
              <option value="all">Todos los Medios</option>
              <option value="CASH">Efectivo</option>
              <option value="TRANSFER">Transferencia Bancaria</option>
              <option value="CHEQUE">Cheque</option>
              <option value="CARD">Tarjeta</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resumen Financiero Estilo Estado de Cuenta Bancario (4 Tarjetas KPI) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Saldo Inicial */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Saldo Anterior (Apertura)
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono tracking-tight">
            {formatMoney(summary?.initialBalance ?? 0)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
            <span>Al inicio del día</span>
            <span className="font-semibold text-slate-700">{formatDate(startDate)}</span>
          </div>
        </div>

        {/* Total Ingresos */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden bg-gradient-to-br from-white to-emerald-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              (+) Total Ingresos / Créditos
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2 font-mono tracking-tight">
            {formatMoney(summary?.totalCredits ?? 0)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-medium">
            <span>Depósitos y cobros del período</span>
          </div>
        </div>

        {/* Total Egresos */}
        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm relative overflow-hidden bg-gradient-to-br from-white to-rose-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
              (-) Total Egresos / Débitos
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-700 mt-2 font-mono tracking-tight">
            {formatMoney(summary?.totalDebits ?? 0)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-600 font-medium">
            <span>Pagos y salidas del período</span>
          </div>
        </div>

        {/* Saldo Final al Corte */}
        <div className="bg-[#0E0F3D] text-white p-5 rounded-2xl shadow-md shadow-blue-950/20 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
              (=) Saldo al Cierre
            </span>
            <div className="w-8 h-8 rounded-lg bg-white/10 text-sky-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2 font-mono tracking-tight">
            {formatMoney(summary?.finalBalance ?? 0)}
          </p>
          <div className="flex items-center justify-between mt-2 text-xs text-slate-300">
            <span>Al corte de {formatDate(endDate)}</span>
            <span
              className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                (summary?.netChange ?? 0) >= 0
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {(summary?.netChange ?? 0) >= 0 ? '+' : ''}
              {formatMoney(summary?.netChange ?? 0)} neto
            </span>
          </div>
        </div>
      </div>

      {/* Información del Titular si se seleccionó una entidad */}
      {summary?.entity && (
        <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                Extracto Personalizado: {summary.entity.name}
              </p>
              <p className="text-xs text-slate-600">
                Documento / RUC: <span className="font-semibold">{summary.entity.document_number}</span>
                {summary.entity.phone && ` • Tel: ${summary.entity.phone}`}
                {summary.entity.email && ` • Email: ${summary.entity.email}`}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold uppercase px-3 py-1 bg-white text-sky-800 rounded-full border border-sky-300">
            {summary.entity.entity_type === 'CLIENT' ? 'Cliente' : 'Proveedor'}
          </span>
        </div>
      )}

      {/* Tabla Detallada de Movimientos Estilo Extracto Bancario */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Cabecera de la tabla con barra de búsqueda rápida */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">
              Detalle de Movimientos en Cuenta
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {filteredItems.length} registros
            </span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar en el extracto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E0F3D] outline-none"
            />
          </div>
        </div>

        {/* Contenedor de la Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0E0F3D] text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4 w-28">Fecha</th>
                <th className="py-3 px-4 w-36">Comprobante</th>
                <th className="py-3 px-4">Concepto / Detalle</th>
                <th className="py-3 px-4 w-44">Entidad</th>
                <th className="py-3 px-4 w-28">Medio</th>
                <th className="py-3 px-4 w-32 text-right">Débito (-)</th>
                <th className="py-3 px-4 w-32 text-right">Crédito (+)</th>
                <th className="py-3 px-4 w-36 text-right">Saldo Acumulado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {/* Fila Especial: Apertura con Saldo Anterior */}
              <tr className="bg-sky-50/80 font-bold border-b border-sky-100">
                <td className="py-3 px-4 text-sky-900 font-mono">
                  {formatDate(startDate)}
                </td>
                <td className="py-3 px-4 text-slate-400 font-normal">—</td>
                <td className="py-3 px-4 text-sky-950 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-600 inline-block"></span>
                  SALDO INICIAL ANTERIOR AL PERÍODO
                </td>
                <td className="py-3 px-4 text-slate-400 font-normal">—</td>
                <td className="py-3 px-4 text-slate-400 font-normal">—</td>
                <td className="py-3 px-4 text-right text-slate-400">—</td>
                <td className="py-3 px-4 text-right text-slate-400">—</td>
                <td className="py-3 px-4 text-right font-mono text-sm text-[#0E0F3D]">
                  {formatMoney(summary?.initialBalance ?? 0)}
                </td>
              </tr>

              {/* Filas de Movimientos en el Período */}
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-sky-600 mb-2" />
                    <span>Cargando extracto de operaciones...</span>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">
                      No hay operaciones registradas en este rango de fechas.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      El saldo final se mantiene igual al saldo de apertura.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => {
                  const isIncome = item.transaction_type === 'INCOME';
                  const isNegBalance = item.running_balance < 0;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                      }`}
                    >
                      {/* Fecha */}
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {formatDate(item.transaction_date)}
                      </td>

                      {/* Comprobante */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {item.receipt_number ? (
                          <button
                            onClick={() =>
                              item.receipt_id &&
                              onViewReceipt &&
                              onViewReceipt(item.receipt_id)
                            }
                            className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 px-2 py-0.5 rounded border border-sky-200 transition"
                            title="Ver Recibo Oficial"
                          >
                            <ReceiptIcon className="w-3 h-3 text-sky-600" />
                            <span>{item.receipt_number}</span>
                          </button>
                        ) : item.reference_number ? (
                          <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {item.reference_number}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">S/N</span>
                        )}
                      </td>

                      {/* Concepto & Categoría */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 leading-snug">
                          {item.concept}
                        </div>
                        {item.category_name && (
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                            {item.category_name}
                          </div>
                        )}
                      </td>

                      {/* Entidad */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 truncate max-w-[170px]" title={item.entity_name}>
                          {item.entity_name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.entity_doc}
                        </div>
                      </td>

                      {/* Método de pago */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {item.payment_method === 'CASH' && 'Efectivo'}
                          {item.payment_method === 'TRANSFER' && 'Transferencia'}
                          {item.payment_method === 'CHEQUE' && 'Cheque'}
                          {item.payment_method === 'CARD' && 'Tarjeta'}
                        </span>
                      </td>

                      {/* Débito (-) */}
                      <td className="py-3 px-4 text-right font-mono font-medium whitespace-nowrap">
                        {item.debit > 0 ? (
                          <span className="text-rose-600 font-semibold">
                            -{formatMoney(item.debit)}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Crédito (+) */}
                      <td className="py-3 px-4 text-right font-mono font-medium whitespace-nowrap">
                        {item.credit > 0 ? (
                          <span className="text-emerald-600 font-semibold">
                            +{formatMoney(item.credit)}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Saldo Acumulado */}
                      <td className="py-3 px-4 text-right font-mono whitespace-nowrap">
                        <span
                          className={`font-bold px-2 py-0.5 rounded ${
                            isNegBalance
                              ? 'bg-rose-50 text-rose-700 font-bold'
                              : 'text-slate-900 bg-slate-100'
                          }`}
                        >
                          {formatMoney(item.running_balance)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Pie de Tabla con Totales del Período */}
            <tfoot>
              <tr className="bg-[#0E0F3D] text-white font-bold text-xs">
                <td colSpan={5} className="py-3.5 px-4 text-sky-200 uppercase tracking-wide">
                  TOTALES Y SALDO FINAL AL CIERRE ({formatDate(endDate)})
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-rose-300">
                  -{formatMoney(summary?.totalDebits ?? 0)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-emerald-300">
                  +{formatMoney(summary?.totalCredits ?? 0)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-sm text-sky-300 font-black">
                  {formatMoney(summary?.finalBalance ?? 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

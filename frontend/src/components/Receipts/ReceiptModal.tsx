import React, { useRef, useState } from 'react';
import { X, Download, Printer, Ban, FileCheck, CheckCircle, AlertTriangle } from 'lucide-react';
import { api } from '../../api/client';

interface ReceiptModalProps {
  receiptId: string | null;
  onClose: () => void;
  onVoidSuccess?: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  receiptId,
  onClose,
  onVoidSuccess,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [voiding, setVoiding] = useState(false);
  const [confirmVoid, setConfirmVoid] = useState(false);

  if (!receiptId) return null;

  const pdfUrl = api.getReceiptPdfUrl(receiptId);
  const downloadUrl = api.getReceiptPdfUrl(receiptId, true);

  const handlePrint = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };

  const handleVoid = async () => {
    try {
      setVoiding(true);
      await api.voidReceipt(receiptId);
      setConfirmVoid(false);
      if (onVoidSuccess) onVoidSuccess();
      // Recargar iframe para mostrar la marca de agua 'ANULADO'
      if (iframeRef.current) {
        iframeRef.current.src = pdfUrl + `&t=${Date.now()}`;
      }
    } catch (err: any) {
      alert(err.message || 'Error al anular el recibo');
    } finally {
      setVoiding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        {/* Header con acciones */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="AR Asesoría Contable"
              className="w-9 h-9 rounded-lg object-cover border border-slate-300 shadow-2xs"
            />
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                Visor de Recibo Oficial Digital
              </h3>
              <p className="text-[11px] text-slate-500">
                Asesoría Contable CP. Arturo Arévalos &bull; Yasy Cañy-Canindeyu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Imprimir */}
            <button
              onClick={handlePrint}
              title="Imprimir comprobante"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Imprimir</span>
            </button>

            {/* Descargar */}
            <a
              href={downloadUrl}
              download
              title="Descargar archivo PDF"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Descargar PDF</span>
            </a>

            {/* Anular */}
            {!confirmVoid ? (
              <button
                onClick={() => setConfirmVoid(true)}
                title="Anular recibo"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors shadow-2xs"
              >
                <Ban className="w-3.5 h-3.5 text-rose-600" />
                <span>Anular</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-rose-100 border border-rose-300 px-2 py-1 rounded-lg">
                <span className="text-[11px] font-bold text-rose-800">¿Confirmar?</span>
                <button
                  onClick={handleVoid}
                  disabled={voiding}
                  className="px-2 py-0.5 text-[11px] bg-rose-600 text-white font-bold rounded hover:bg-rose-700 transition-colors"
                >
                  {voiding ? '...' : 'Sí, anular'}
                </button>
                <button
                  onClick={() => setConfirmVoid(false)}
                  className="px-1.5 py-0.5 text-[11px] text-slate-600 hover:text-slate-900"
                >
                  No
                </button>
              </div>
            )}

            <div className="w-[1px] h-6 bg-slate-200 mx-1"></div>

            {/* Cerrar */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Visor PDF Embebido */}
        <div className="flex-1 bg-slate-100 p-2 min-h-[500px]">
          <iframe
            ref={iframeRef}
            src={pdfUrl}
            title="Recibo Oficial PDF"
            className="w-full h-full min-h-[550px] rounded-xl border border-slate-300 bg-white shadow-inner"
          />
        </div>
      </div>
    </div>
  );
};

import PDFDocument from 'pdfkit';
import fs from 'fs';
import { COMPANY_CONFIG } from '../config/company';

export interface StatementPdfData {
  startDate: string;
  endDate: string;
  currency: string;
  initialBalance: number;
  totalCredits: number;
  totalDebits: number;
  netChange: number;
  finalBalance: number;
  transactionCount: number;
  entity?: {
    id: string;
    name: string;
    document_number: string;
    entity_type: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  } | null;
  items: Array<{
    transaction_date: string | Date;
    concept: string;
    reference_number?: string | null;
    entity_name: string;
    entity_doc: string;
    category_name?: string | null;
    payment_method: string;
    transaction_type: 'INCOME' | 'EXPENSE';
    debit: number;
    credit: number;
    amount: number;
    running_balance: number;
    receipt_number?: string | null;
  }>;
}

function formatMoney(amount: number, currency: string = 'GS'): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  if (currency === 'USD') {
    const formatted = absAmount.toLocaleString('es-PY', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${isNegative ? '-' : ''}$ ${formatted}`;
  } else {
    const formatted = Math.round(absAmount).toLocaleString('es-PY');
    return `${isNegative ? '-' : ''}Gs. ${formatted}`;
  }
}

function formatDate(dateInput: string | Date): string {
  if (!dateInput) return '-';
  const str = typeof dateInput === 'string' ? dateInput.split('T')[0] : dateInput.toISOString().split('T')[0];
  const parts = str.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return str;
}

export function generateStatementPdf(data: StatementPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 36,
        bufferPages: true,
        info: {
          Title: `Extracto de Operaciones (${formatDate(data.startDate)} al ${formatDate(data.endDate)})`,
          Author: COMPANY_CONFIG.name,
          Subject: 'Extracto de Cuenta y Movimientos Contables',
        },
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const navy = COMPANY_CONFIG.colors.primaryNavy; // #0E0F3D
      const darkNavy = COMPANY_CONFIG.colors.navyDark; // #070822
      const green = '#16A34A';
      const red = '#DC2626';

      // Función para dibujar encabezado de página
      const drawHeader = (isFirstPage: boolean) => {
        // Barra decorativa superior
        doc.rect(36, 28, 523, 4).fill(navy);

        if (isFirstPage) {
          // Logo si existe
          const hasLogo = fs.existsSync(COMPANY_CONFIG.logoPath);
          let textX = 36;
          if (hasLogo) {
            try {
              doc.image(COMPANY_CONFIG.logoPath, 36, 38, { width: 44, height: 44 });
              textX = 88;
            } catch (err) {
              textX = 36;
            }
          }

          // Datos empresa
          doc.fontSize(10.5).font('Helvetica-Bold').fillColor(navy)
            .text(COMPANY_CONFIG.name, textX, 39, { width: 260 });
          doc.fontSize(7.5).font('Helvetica').fillColor('#334155')
            .text(`${COMPANY_CONFIG.activity} • ${COMPANY_CONFIG.location}`, textX, 54, { width: 260 });
          doc.fontSize(7).font('Helvetica').fillColor('#64748B')
            .text(`Email: ${COMPANY_CONFIG.email} | Tel: ${COMPANY_CONFIG.phone}`, textX, 66, { width: 260 });

          // Tarjeta lateral derecha: Título del Extracto
          const cardX = 355;
          const cardY = 36;
          const cardW = 204;
          const cardH = 48;

          doc.rect(cardX, cardY, cardW, cardH)
            .lineWidth(1)
            .strokeColor(navy)
            .fillAndStroke('#F8FAFC', navy);

          doc.fontSize(9.5).font('Helvetica-Bold').fillColor(navy)
            .text('EXTRACTO DE MOVIMIENTOS', cardX, cardY + 7, { width: cardW, align: 'center' });
          doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#0284C7')
            .text('ESTADO DE CUENTA / FLUJO', cardX, cardY + 21, { width: cardW, align: 'center' });
          
          const nowStr = new Date().toLocaleDateString('es-PY') + ' ' + new Date().toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' });
          doc.fontSize(6.5).font('Helvetica').fillColor('#64748B')
            .text(`Emisión: ${nowStr}`, cardX, cardY + 34, { width: cardW, align: 'center' });
        } else {
          // Encabezado simplificado en páginas siguientes
          doc.fontSize(8).font('Helvetica-Bold').fillColor(navy)
            .text(`EXTRACTO DE MOVIMIENTOS • ${formatDate(data.startDate)} al ${formatDate(data.endDate)}`, 36, 36);
          doc.fontSize(8).font('Helvetica').fillColor('#64748B')
            .text(COMPANY_CONFIG.name, 36, 47);
        }
      };

      // Dibujar cabecera inicial
      drawHeader(true);

      // Recuadro de Metadatos del Período y Titular
      let y = 92;
      doc.rect(36, y, 523, 34)
        .lineWidth(0.8)
        .strokeColor('#CBD5E1')
        .fillAndStroke('#F1F5F9', '#CBD5E1');

      doc.fontSize(8).font('Helvetica-Bold').fillColor(navy).text('PERÍODO:', 44, y + 6);
      doc.font('Helvetica').fillColor('#1E293B').text(`Del ${formatDate(data.startDate)} al ${formatDate(data.endDate)}`, 92, y + 6);

      doc.font('Helvetica-Bold').fillColor(navy).text('MONEDA:', 44, y + 19);
      doc.font('Helvetica').fillColor('#1E293B').text(`${data.currency === 'USD' ? 'Dólares (USD)' : 'Guaraníes (GS)'}`, 92, y + 19);

      const titularText = data.entity
        ? `${data.entity.entity_type === 'CLIENT' ? 'Cliente' : 'Proveedor'}: ${data.entity.name} (Doc: ${data.entity.document_number})`
        : 'EXTRACTO GENERAL (Todas las Operaciones)';

      doc.font('Helvetica-Bold').fillColor(navy).text('TITULAR:', 260, y + 6);
      doc.font('Helvetica').fillColor('#1E293B').text(titularText, 310, y + 6, { width: 240, ellipsis: true });

      doc.font('Helvetica-Bold').fillColor(navy).text('REGISTROS:', 260, y + 19);
      doc.font('Helvetica').fillColor('#1E293B').text(`${data.transactionCount} operaciones en el período`, 325, y + 19);

      // Resumen Financiero en 4 Cajas KPI estilo Extracto Bancario
      y = 132;
      const boxW = 126;
      const boxH = 44;
      const gap = 6.3;

      // Caja 1: Saldo Anterior
      doc.rect(36, y, boxW, boxH).lineWidth(0.8).strokeColor('#E2E8F0').fillAndStroke('#FFFFFF', '#CBD5E1');
      doc.fontSize(7).font('Helvetica-Bold').fillColor('#64748B').text('SALDO ANTERIOR', 42, y + 7);
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#0F172A').text(formatMoney(data.initialBalance, data.currency), 42, y + 21);

      // Caja 2: Total Ingresos (+)
      doc.rect(36 + boxW + gap, y, boxW, boxH).lineWidth(0.8).strokeColor('#BBF7D0').fillAndStroke('#F0FDF4', '#86EFAC');
      doc.fontSize(7).font('Helvetica-Bold').fillColor(green).text('(+) TOTAL INGRESOS', 36 + boxW + gap + 6, y + 7);
      doc.fontSize(10).font('Helvetica-Bold').fillColor(green).text(formatMoney(data.totalCredits, data.currency), 36 + boxW + gap + 6, y + 21);

      // Caja 3: Total Egresos (-)
      doc.rect(36 + (boxW + gap) * 2, y, boxW, boxH).lineWidth(0.8).strokeColor('#FECACA').fillAndStroke('#FEF2F2', '#FCA5A5');
      doc.fontSize(7).font('Helvetica-Bold').fillColor(red).text('(-) TOTAL EGRESOS', 36 + (boxW + gap) * 2 + 6, y + 7);
      doc.fontSize(10).font('Helvetica-Bold').fillColor(red).text(formatMoney(data.totalDebits, data.currency), 36 + (boxW + gap) * 2 + 6, y + 21);

      // Caja 4: Saldo al Cierre
      doc.rect(36 + (boxW + gap) * 3, y, boxW, boxH).lineWidth(1).strokeColor(navy).fillAndStroke(navy, navy);
      doc.fontSize(7).font('Helvetica-Bold').fillColor('#93C5FD').text('(=) SALDO AL CIERRE', 36 + (boxW + gap) * 3 + 6, y + 7);
      doc.fontSize(10.5).font('Helvetica-Bold').fillColor('#FFFFFF').text(formatMoney(data.finalBalance, data.currency), 36 + (boxW + gap) * 3 + 6, y + 21);

      // Encabezado de la Tabla de Movimientos
      y = 186;

      const drawTableHeader = (startY: number) => {
        doc.rect(36, startY, 523, 18).fill(navy);
        doc.fontSize(7).font('Helvetica-Bold').fillColor('#FFFFFF');
        doc.text('FECHA', 40, startY + 5, { width: 50 });
        doc.text('COMPROBANTE', 92, startY + 5, { width: 70 });
        doc.text('CONCEPTO / DESCRIPCIÓN', 164, startY + 5, { width: 145 });
        doc.text('ENTIDAD / CLIENTE', 311, startY + 5, { width: 85 });
        doc.text('DÉBITO (-)', 398, startY + 5, { width: 48, align: 'right' });
        doc.text('CRÉDITO (+)', 448, startY + 5, { width: 50, align: 'right' });
        doc.text('SALDO', 500, startY + 5, { width: 55, align: 'right' });
      };

      drawTableHeader(y);
      y += 18;

      // Fila 0: Saldo Anterior / Inicial
      doc.rect(36, y, 523, 17).fill('#EFF6FF');
      doc.fontSize(7).font('Helvetica-Bold').fillColor('#1E40AF');
      doc.text(formatDate(data.startDate), 40, y + 4, { width: 50 });
      doc.text('-', 92, y + 4, { width: 70 });
      doc.text('*** SALDO ANTERIOR AL PERÍODO ***', 164, y + 4, { width: 145 });
      doc.text('-', 311, y + 4, { width: 85 });
      doc.text('-', 398, y + 4, { width: 48, align: 'right' });
      doc.text('-', 448, y + 4, { width: 50, align: 'right' });
      doc.text(formatMoney(data.initialBalance, data.currency), 500, y + 4, { width: 55, align: 'right' });
      
      // Línea divisoria
      doc.rect(36, y + 16, 523, 0.5).fill('#BFDBFE');
      y += 17;

      // Iterar movimientos
      let isEven = false;
      const maxPageY = 760;

      data.items.forEach((item) => {
        // Comprobar salto de página
        if (y > maxPageY) {
          doc.addPage();
          drawHeader(false);
          y = 65;
          drawTableHeader(y);
          y += 18;
        }

        const rowBg = isEven ? '#F8FAFC' : '#FFFFFF';
        doc.rect(36, y, 523, 18).fill(rowBg);

        doc.fontSize(6.8).font('Helvetica').fillColor('#334155');
        doc.text(formatDate(item.transaction_date), 40, y + 5, { width: 50 });

        const docRef = item.receipt_number || item.reference_number || 'S/N';
        doc.text(docRef, 92, y + 5, { width: 70, ellipsis: true });

        doc.font('Helvetica-Bold').fillColor('#0F172A')
          .text(item.concept, 164, y + 5, { width: 145, height: 11, ellipsis: true });

        doc.font('Helvetica').fillColor('#475569')
          .text(item.entity_name, 311, y + 5, { width: 85, height: 11, ellipsis: true });

        // Débito
        if (item.debit > 0) {
          doc.font('Helvetica').fillColor(red)
            .text(formatMoney(item.debit, data.currency), 398, y + 5, { width: 48, align: 'right' });
        } else {
          doc.font('Helvetica').fillColor('#94A3B8')
            .text('-', 398, y + 5, { width: 48, align: 'right' });
        }

        // Crédito
        if (item.credit > 0) {
          doc.font('Helvetica').fillColor(green)
            .text(formatMoney(item.credit, data.currency), 448, y + 5, { width: 50, align: 'right' });
        } else {
          doc.font('Helvetica').fillColor('#94A3B8')
            .text('-', 448, y + 5, { width: 50, align: 'right' });
        }

        // Saldo Acumulado
        const isNegBalance = item.running_balance < 0;
        doc.font('Helvetica-Bold').fillColor(isNegBalance ? red : darkNavy)
          .text(formatMoney(item.running_balance, data.currency), 500, y + 5, { width: 55, align: 'right' });

        // Línea inferior sutil
        doc.rect(36, y + 17.5, 523, 0.5).fill('#E2E8F0');

        y += 18;
        isEven = !isEven;
      });

      // Fila de Cierre / Totales
      if (y > maxPageY - 20) {
        doc.addPage();
        drawHeader(false);
        y = 65;
        drawTableHeader(y);
        y += 18;
      }

      doc.rect(36, y, 523, 20).fill('#0E0F3D');
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#FFFFFF');
      doc.text('TOTALES Y SALDO FINAL AL CIERRE', 40, y + 6, { width: 265 });
      doc.text(formatMoney(data.totalDebits, data.currency), 398, y + 6, { width: 48, align: 'right' });
      doc.text(formatMoney(data.totalCredits, data.currency), 448, y + 6, { width: 50, align: 'right' });
      doc.fillColor('#93C5FD').text(formatMoney(data.finalBalance, data.currency), 500, y + 6, { width: 55, align: 'right' });
      y += 30;

      // Sección de Firmas y Nota Legal
      if (y > 700) {
        doc.addPage();
        drawHeader(false);
        y = 80;
      }

      const sigY = y + 35;
      // Firma izquierda: Cliente / Auditor
      doc.moveTo(60, sigY).lineTo(220, sigY).lineWidth(0.8).strokeColor('#94A3B8');
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#334155')
        .text('CONFORME CLIENTE / RESPONSABLE', 60, sigY + 5, { width: 160, align: 'center' });
      doc.fontSize(7).font('Helvetica').fillColor('#64748B')
        .text('Firma y Aclaración', 60, sigY + 16, { width: 160, align: 'center' });

      // Firma derecha: Contador Oficial
      doc.moveTo(375, sigY).lineTo(535, sigY).lineWidth(0.8).strokeColor(navy);
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor(navy)
        .text(COMPANY_CONFIG.accountant, 375, sigY + 5, { width: 160, align: 'center' });
      doc.fontSize(7).font('Helvetica').fillColor('#64748B')
        .text(`${COMPANY_CONFIG.title} • Asesoría Contable`, 375, sigY + 16, { width: 160, align: 'center' });

      // Nota legal al pie
      const footerY = 780;
      doc.rect(36, footerY - 5, 523, 0.5).fill('#CBD5E1');
      doc.fontSize(6.5).font('Helvetica').fillColor('#64748B')
        .text('Este extracto es un reporte oficial emitido por el Sistema de Gestión Contable y Recibos. Válido para control de caja, conciliación bancaria y auditoría interna.', 36, footerY, { width: 440 });

      // Paginación en todas las páginas generadas
      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        doc.fontSize(7).font('Helvetica').fillColor('#64748B')
          .text(`Página ${i + 1} de ${totalPages}`, 480, footerY, { width: 79, align: 'right' });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

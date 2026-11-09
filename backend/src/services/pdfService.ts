import PDFDocument from 'pdfkit';
import fs from 'fs';
import { COMPANY_CONFIG } from '../config/company';

// Función para convertir números a palabras en español (imprescindible en recibos oficiales)
export function numeroALetras(monto: number, moneda: string = 'GS'): string {
  const entero = Math.floor(Math.abs(monto));
  const decimal = Math.round((Math.abs(monto) - entero) * 100);

  const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const decenas = [
    '',
    'DIEZ',
    'VEINTE',
    'TREINTA',
    'CUARENTA',
    'CINCUENTA',
    'SESENTA',
    'SETENTA',
    'OCHENTA',
    'NOVENTA',
  ];
  const especiales: { [key: number]: string } = {
    11: 'ONCE',
    12: 'DOCE',
    13: 'TRECE',
    14: 'CATORCE',
    15: 'QUINCE',
    16: 'DIECISÉIS',
    17: 'DIECISIETE',
    18: 'DIECIOCHO',
    19: 'DIECINUEVE',
    21: 'VEINTIUNO',
    22: 'VEINTIDÓS',
    23: 'VEINTITRÉS',
    24: 'VEINTICUATRO',
    25: 'VEINTICINCO',
    26: 'VEINTISÉIS',
    27: 'VEINTISIETE',
    28: 'VEINTIOCHO',
    29: 'VEINTINUEVE',
  };
  const centenas = [
    '',
    'CIENTO',
    'DOSCIENTOS',
    'TRESCIENTOS',
    'CUATROCIENTOS',
    'QUINIENTOS',
    'SEISCIENTOS',
    'SETECIENTOS',
    'OCHOCIENTOS',
    'NOVECIENTOS',
  ];

  function seccion(num: number): string {
    if (num === 0) return '';
    if (num === 100) return 'CIEN ';

    let output = '';
    const c = Math.floor(num / 100);
    const d = Math.floor((num % 100) / 10);
    const u = num % 10;
    const du = num % 100;

    if (c > 0) output += centenas[c] + ' ';

    if (du in especiales) {
      output += especiales[du] + ' ';
    } else {
      if (d > 0) {
        output += decenas[d];
        if (u > 0) output += ' Y ' + unidades[u] + ' ';
        else output += ' ';
      } else if (u > 0) {
        output += unidades[u] + ' ';
      }
    }
    return output;
  }

  function convertir(n: number): string {
    if (n === 0) return 'CERO';

    let resultado = '';
    const millones = Math.floor(n / 1000000);
    const miles = Math.floor((n % 1000000) / 1000);
    const resto = n % 1000;

    if (millones > 0) {
      if (millones === 1) resultado += 'UN MILLÓN ';
      else resultado += seccion(millones) + 'MILLONES ';
    }

    if (miles > 0) {
      if (miles === 1) resultado += 'MIL ';
      else resultado += seccion(miles) + 'MIL ';
    }

    if (resto > 0) {
      resultado += seccion(resto);
    }

    return resultado.trim();
  }

  const textoEntero = convertir(entero);
  const nombreMoneda = moneda === 'USD' ? 'DÓLARES AMERICANOS' : 'GUARANÍES';

  if (moneda === 'USD') {
    return `${textoEntero} CON ${decimal.toString().padStart(2, '0')}/100 ${nombreMoneda}`;
  } else {
    return `${textoEntero} ${nombreMoneda}`;
  }
}

export interface ReceiptData {
  receiptNumber: string;
  issueDate: Date | string;
  status: 'VALID' | 'VOIDED';
  entityName: string;
  entityDocNumber: string;
  entityType: 'CLIENT' | 'SUPPLIER';
  entityAddress?: string;
  entityPhone?: string;
  entityEmail?: string;
  amount: number;
  currency: string;
  concept: string;
  paymentMethod: string;
  referenceNumber?: string;
  categoryName?: string;
  userName?: string;
}

export function generateReceiptPdf(data: ReceiptData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `Recibo Oficial - ${data.receiptNumber}`,
          Author: 'Sistema de Gestión Contable',
          Subject: 'Recibo Oficial de Dinero',
        },
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const isVoided = data.status === 'VOIDED';

      // Marca de agua si está anulado
      if (isVoided) {
        doc.save();
        doc.fontSize(60);
        doc.fillColor('#EF4444');
        doc.opacity(0.18);
        doc.rotate(-30, { origin: [297, 421] });
        doc.text('DOCUMENTO ANULADO', 60, 400, { align: 'center', width: 500 });
        doc.restore();
      }

      // Encabezado Principal / Membrete Corporativo Oficial
      // Barra superior decorativa con el azul marino oficial #0E0F3D
      doc.rect(40, 36, 515, 5).fill(COMPANY_CONFIG.colors.primaryNavy);

      // Logo oficial AR incrustado
      const hasLogo = fs.existsSync(COMPANY_CONFIG.logoPath);
      let headerTextX = 40;

      if (hasLogo) {
        try {
          doc.image(COMPANY_CONFIG.logoPath, 40, 48, { width: 64, height: 64 });
          headerTextX = 114;
        } catch (err) {
          console.warn('Advertencia al incrustar el logo en PDF:', err);
          headerTextX = 40;
        }
      }

      // Bloque izquierdo: Membrete oficial del estudio contable
      doc.fontSize(11).font('Helvetica-Bold').fillColor(COMPANY_CONFIG.colors.primaryNavy)
        .text('ASESORIA CONTABLE CP. ARTURO AREVALOS', headerTextX, 49, { width: 230 });

      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#1E293B')
        .text('Servicios de contabilidad', headerTextX, 73);

      doc.fontSize(8).font('Helvetica').fillColor('#475569');
      doc.text('Yasy Cañy-Canindeyu.', headerTextX, 85);
      doc.text('arevalosarturo2@gmail.com  +595 984 508139', headerTextX, 96);

      // Bloque derecho: Recuadro del Recibo Oficial
      const receiptBoxX = 350;
      const receiptBoxY = 48;
      const receiptBoxW = 205;
      const receiptBoxH = 75;

      doc.rect(receiptBoxX, receiptBoxY, receiptBoxW, receiptBoxH)
        .lineWidth(1.2)
        .strokeColor(isVoided ? '#EF4444' : COMPANY_CONFIG.colors.primaryNavy)
        .fillAndStroke('#F8FAFC', isVoided ? '#FCA5A5' : COMPANY_CONFIG.colors.primaryNavy);

      doc.fontSize(9.5).font('Helvetica-Bold').fillColor(COMPANY_CONFIG.colors.primaryNavy)
        .text('RECIBO OFICIAL DE DINERO', receiptBoxX, receiptBoxY + 10, { width: receiptBoxW, align: 'center' });

      doc.fontSize(13).font('Helvetica-Bold').fillColor(isVoided ? '#B91C1C' : COMPANY_CONFIG.colors.primaryNavy)
        .text(`N° ${data.receiptNumber}`, receiptBoxX, receiptBoxY + 26, { width: receiptBoxW, align: 'center' });

      const formattedDate = new Date(data.issueDate).toLocaleDateString('es-PY', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

      doc.fontSize(8.5).font('Helvetica').fillColor('#475569')
        .text(`Fecha Emisión: ${formattedDate}`, receiptBoxX, receiptBoxY + 47, { width: receiptBoxW, align: 'center' });

      // Estado del Recibo
      const statusBadgeColor = isVoided ? '#DC2626' : '#16A34A';
      const statusBadgeText = isVoided ? 'ESTADO: ANULADO' : 'ESTADO: VÁLIDO';
      doc.fontSize(8).font('Helvetica-Bold').fillColor(statusBadgeColor)
        .text(statusBadgeText, receiptBoxX, receiptBoxY + 59, { width: receiptBoxW, align: 'center' });

      // Cuadro de Importe Destacado
      const amountBoxY = 132;
      doc.rect(40, amountBoxY, 515, 34).fillAndStroke('#F0F2FA', '#C5CEF2');
      const formattedNumber = data.currency === 'USD'
        ? `$ ${Number(data.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : `Gs. ${Math.round(Number(data.amount)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

      doc.fontSize(10).font('Helvetica-Bold').fillColor(COMPANY_CONFIG.colors.primaryNavy).text('IMPORTE TOTAL:', 55, amountBoxY + 11);
      doc.fontSize(15).font('Helvetica-Bold').fillColor(COMPANY_CONFIG.colors.primaryNavy).text(formattedNumber, 170, amountBoxY + 9, { align: 'left' });
      doc.fontSize(9).font('Helvetica-Oblique').fillColor('#475569').text(`Moneda: ${data.currency === 'USD' ? 'Dólares Americanos' : 'Guaraníes'}`, 400, amountBoxY + 12, { align: 'right', width: 140 });

      // Línea divisoria
      let currentY = 176;

      // Sección Datos del Cliente / Pagador
      doc.rect(40, currentY, 515, 20).fill(COMPANY_CONFIG.colors.primaryNavy);
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF').text('DATOS DE LA ENTIDAD / RECEPTOR', 50, currentY + 5);
      currentY += 28;

      // Tabla de Datos
      const col1 = 50;
      const col2 = 170;
      const col3 = 330;
      const col4 = 420;

      doc.fontSize(9).font('Helvetica-Bold').fillColor('#475569').text('Nombre / Razón Social:', col1, currentY);
      doc.font('Helvetica').fillColor('#0F172A').text(data.entityName, col2, currentY, { width: 340 });
      currentY += 18;

      doc.font('Helvetica-Bold').fillColor('#475569').text('RUC / N° Documento:', col1, currentY);
      doc.font('Helvetica').fillColor('#0F172A').text(data.entityDocNumber, col2, currentY);

      doc.font('Helvetica-Bold').fillColor('#475569').text('Tipo Entidad:', col3, currentY);
      doc.font('Helvetica').fillColor('#0F172A').text(data.entityType === 'CLIENT' ? 'Cliente' : 'Proveedor', col4, currentY);
      currentY += 18;

      if (data.entityAddress) {
        doc.font('Helvetica-Bold').fillColor('#475569').text('Dirección:', col1, currentY);
        doc.font('Helvetica').fillColor('#0F172A').text(data.entityAddress, col2, currentY, { width: 340 });
        currentY += 18;
      }

      if (data.entityPhone || data.entityEmail) {
        doc.font('Helvetica-Bold').fillColor('#475569').text('Contacto:', col1, currentY);
        doc.font('Helvetica').fillColor('#0F172A').text(`${data.entityPhone || 'N/A'} | ${data.entityEmail || 'N/A'}`, col2, currentY);
        currentY += 24;
      } else {
        currentY += 6;
      }

      // Sección Detalle del Recibo
      doc.rect(40, currentY, 515, 20).fill(COMPANY_CONFIG.colors.primaryNavy);
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF').text('DETALLE DE LA OPERACIÓN', 50, currentY + 5);
      currentY += 28;

      // La cantidad de (en letras)
      const letras = numeroALetras(data.amount, data.currency);
      doc.font('Helvetica-Bold').fillColor('#475569').text('La cantidad de:', col1, currentY);
      doc.font('Helvetica-Bold').fillColor(COMPANY_CONFIG.colors.primaryNavy).text(`*** ${letras} ***`, col2, currentY, { width: 375 });
      currentY += 32;

      // En concepto de
      doc.font('Helvetica-Bold').fillColor('#475569').text('En concepto de:', col1, currentY);
      doc.font('Helvetica').fillColor('#0F172A').text(data.concept, col2, currentY, { width: 375 });
      currentY += 36;

      // Forma de pago y Referencia
      const metodos: { [k: string]: string } = {
        CASH: 'Efectivo',
        TRANSFER: 'Transferencia Bancaria',
        CHEQUE: 'Cheque Bancario',
        CARD: 'Tarjeta de Débito / Crédito',
      };
      const metodoTexto = metodos[data.paymentMethod] || data.paymentMethod;

      doc.font('Helvetica-Bold').fillColor('#475569').text('Forma de Pago:', col1, currentY);
      doc.font('Helvetica').fillColor('#0F172A').text(metodoTexto, col2, currentY);

      if (data.referenceNumber) {
        doc.font('Helvetica-Bold').fillColor('#475569').text('N° Referencia / Cheque:', col3, currentY);
        doc.font('Helvetica').fillColor('#0F172A').text(data.referenceNumber, col4 + 20, currentY);
      }
      currentY += 22;

      if (data.categoryName) {
        doc.font('Helvetica-Bold').fillColor('#475569').text('Rubro Contable:', col1, currentY);
        doc.font('Helvetica').fillColor('#0F172A').text(data.categoryName, col2, currentY);
        currentY += 25;
      }

      // Sección de Firmas
      const signatureY = 580;
      doc.rect(40, signatureY, 515, 120).strokeColor('#E2E8F0').lineWidth(1).stroke();

      // Línea de firma 1: Emisor / Contador
      const sig1X = 75;
      const sigLineY = signatureY + 85;
      doc.lineCap('butt').lineWidth(1).strokeColor('#94A3B8').moveTo(sig1X, sigLineY).lineTo(sig1X + 180, sigLineY).stroke();
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(COMPANY_CONFIG.colors.primaryNavy).text('CP. Arturo Arévalos', sig1X, sigLineY + 6, { width: 180, align: 'center' });
      doc.fontSize(7.5).font('Helvetica').fillColor('#64748B').text('Asesoría Contable - Yasy Cañy', sig1X, sigLineY + 18, { width: 180, align: 'center' });

      // Línea de firma 2: Receptor / Entidad
      const sig2X = 330;
      doc.lineWidth(1).strokeColor('#94A3B8').moveTo(sig2X, sigLineY).lineTo(sig2X + 180, sigLineY).stroke();
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#334155').text('Conforme Receptor', sig2X, sigLineY + 6, { width: 180, align: 'center' });
      doc.fontSize(7.5).font('Helvetica').fillColor('#64748B').text('Firma / Sello de Recepción', sig2X, sigLineY + 18, { width: 180, align: 'center' });

      // Sello de seguridad / Hash simulado
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#475569')
        .text('COMPROBANTE VINCULADO AL LIBRO DIARIO ELECTRÓNICO', 40, signatureY + 10, { width: 515, align: 'center' });

      // Pie de Página Legal
      const footerY = 740;
      doc.rect(40, footerY, 515, 0.8).fill('#CBD5E1');
      doc.fontSize(7.5).font('Helvetica').fillColor('#64748B')
        .text('Este documento digital constituye un comprobante formal de operación contable. Emisión autorizada según normativas fiscales vigentes.', 40, footerY + 8, { width: 515, align: 'center' });
      doc.text(`Generado por: CP. Arturo Arévalos | Yasy Cañy-Canindeyu | Identificador Correlativo: ${data.receiptNumber}`, 40, footerY + 20, { width: 515, align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

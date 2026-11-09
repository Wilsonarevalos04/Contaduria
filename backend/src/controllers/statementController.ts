import { Request, Response } from 'express';
import { query } from '../config/db';
import { generateStatementPdf, StatementPdfData } from '../services/statementPdfService';

export async function getStatementData(
  startDateStr?: string,
  endDateStr?: string,
  entityId?: string,
  currencyParam?: string,
  paymentMethod?: string
) {
  // Fechas por defecto: mes actual
  const now = new Date();
  const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0];
  const defaultEnd = now.toISOString().split('T')[0];

  const startDate = startDateStr || defaultStart;
  const endDate = endDateStr || defaultEnd;
  const currency = currencyParam === 'USD' ? 'USD' : 'GS';
  const isAllEntities = !entityId || entityId === 'all';
  const isAllPayment = !paymentMethod || paymentMethod === 'all';

  // 1. Calcular Saldo Inicial (Todas las operaciones confirmadas previas a startDate)
  let initialBalanceClauses: string[] = [
    "status != 'CANCELLED'",
    `currency = $1`,
    `transaction_date < $2`,
  ];
  let initialBalanceParams: any[] = [currency, startDate];

  if (!isAllEntities) {
    initialBalanceParams.push(entityId);
    initialBalanceClauses.push(`entity_id = $${initialBalanceParams.length}`);
  }

  if (!isAllPayment) {
    initialBalanceParams.push(paymentMethod);
    initialBalanceClauses.push(`payment_method = $${initialBalanceParams.length}`);
  }

  const initialSql = `
    SELECT 
      COALESCE(SUM(CASE WHEN transaction_type = 'INCOME' THEN amount ELSE -amount END), 0) as initial_balance
    FROM transactions
    WHERE ${initialBalanceClauses.join(' AND ')}
  `;

  const initialRes = await query(initialSql, initialBalanceParams);
  const initialBalance = Number(initialRes.rows[0]?.initial_balance || 0);

  // 2. Obtener Movimientos dentro del Rango de Fechas (Cronológico ASC)
  let txClauses: string[] = [
    "t.status != 'CANCELLED'",
    `t.currency = $1`,
    `t.transaction_date >= $2`,
    `t.transaction_date <= $3`,
  ];
  let txParams: any[] = [currency, startDate, endDate];

  if (!isAllEntities) {
    txParams.push(entityId);
    txClauses.push(`t.entity_id = $${txParams.length}`);
  }

  if (!isAllPayment) {
    txParams.push(paymentMethod);
    txClauses.push(`t.payment_method = $${txParams.length}`);
  }

  const txSql = `
    SELECT 
      t.id,
      t.transaction_date,
      t.concept,
      t.reference_number,
      t.transaction_type,
      t.amount,
      t.currency,
      t.payment_method,
      t.status,
      t.created_at,
      e.id as entity_id,
      e.name as entity_name,
      e.document_number as entity_doc,
      e.entity_type,
      c.name as category_name,
      r.id as receipt_id,
      r.receipt_number,
      r.status as receipt_status
    FROM transactions t
    JOIN entities e ON t.entity_id = e.id
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN receipts r ON t.id = r.transaction_id
    WHERE ${txClauses.join(' AND ')}
    ORDER BY t.transaction_date ASC, t.created_at ASC
  `;

  const txRes = await query(txSql, txParams);

  // 3. Obtener datos de la entidad si se filtró por una específica
  let entityData: any = null;
  if (!isAllEntities) {
    const entRes = await query(
      'SELECT id, name, document_number, entity_type, email, phone, address FROM entities WHERE id = $1',
      [entityId]
    );
    if (entRes.rowCount && entRes.rowCount > 0) {
      entityData = entRes.rows[0];
    }
  }

  // 4. Calcular el Saldo Corriente (Running Balance) en cada movimiento
  let currentBalance = initialBalance;
  let totalCredits = 0; // Ingresos
  let totalDebits = 0; // Egresos

  const items = txRes.rows.map((row) => {
    const amount = Number(row.amount);
    const isIncome = row.transaction_type === 'INCOME';
    const debit = isIncome ? 0 : amount;
    const credit = isIncome ? amount : 0;

    if (isIncome) {
      currentBalance += amount;
      totalCredits += amount;
    } else {
      currentBalance -= amount;
      totalDebits += amount;
    }

    return {
      id: row.id,
      transaction_date: row.transaction_date,
      concept: row.concept,
      reference_number: row.reference_number,
      entity_id: row.entity_id,
      entity_name: row.entity_name,
      entity_doc: row.entity_doc,
      entity_type: row.entity_type,
      category_name: row.category_name,
      payment_method: row.payment_method,
      transaction_type: row.transaction_type,
      amount,
      currency: row.currency,
      debit,
      credit,
      running_balance: currentBalance,
      receipt_id: row.receipt_id,
      receipt_number: row.receipt_number,
      receipt_status: row.receipt_status,
    };
  });

  const finalBalance = currentBalance;
  const netChange = totalCredits - totalDebits;

  return {
    summary: {
      startDate,
      endDate,
      currency,
      initialBalance,
      totalCredits,
      totalDebits,
      netChange,
      finalBalance,
      transactionCount: items.length,
      entity: entityData,
      paymentMethod: isAllPayment ? 'ALL' : paymentMethod,
    },
    items,
  };
}

export async function getStatement(req: Request, res: Response) {
  try {
    const { startDate, endDate, entity_id, currency, payment_method } = req.query;
    const result = await getStatementData(
      startDate as string,
      endDate as string,
      entity_id as string,
      currency as string,
      payment_method as string
    );

    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Error fetching statement:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getStatementPdfStream(req: Request, res: Response) {
  try {
    const { startDate, endDate, entity_id, currency, payment_method, download } = req.query;
    const result = await getStatementData(
      startDate as string,
      endDate as string,
      entity_id as string,
      currency as string,
      payment_method as string
    );

    const pdfData: StatementPdfData = {
      startDate: result.summary.startDate,
      endDate: result.summary.endDate,
      currency: result.summary.currency,
      initialBalance: result.summary.initialBalance,
      totalCredits: result.summary.totalCredits,
      totalDebits: result.summary.totalDebits,
      netChange: result.summary.netChange,
      finalBalance: result.summary.finalBalance,
      transactionCount: result.summary.transactionCount,
      entity: result.summary.entity,
      items: result.items,
    };

    const pdfBuffer = await generateStatementPdf(pdfData);

    const isDownload = download === 'true';
    const filename = `extracto_${result.summary.startDate}_al_${result.summary.endDate}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `${isDownload ? 'attachment' : 'inline'}; filename="${filename}"`
    );
    res.setHeader('Content-Length', pdfBuffer.length);
    res.end(pdfBuffer);
  } catch (error: any) {
    console.error('Error generating statement PDF:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

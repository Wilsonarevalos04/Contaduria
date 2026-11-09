import { Request, Response } from 'express';
import { query } from '../config/db';
import { generateReceiptPdf, ReceiptData } from '../services/pdfService';

// Generar siguiente número correlativo ej: 001-001-0000001
export async function getNextReceiptNumber(): Promise<string> {
  const result = await query(`
    SELECT receipt_number 
    FROM receipts 
    WHERE receipt_number ~ '^001-001-[0-9]{7}$'
    ORDER BY receipt_number DESC 
    LIMIT 1
  `);

  if (result.rowCount === 0) {
    return '001-001-0000001';
  }

  const lastNumber = result.rows[0].receipt_number;
  const parts = lastNumber.split('-');
  const seq = parseInt(parts[2], 10);
  const nextSeq = (seq + 1).toString().padStart(7, '0');
  return `001-001-${nextSeq}`;
}

export async function getReceipts(req: Request, res: Response) {
  try {
    const { status, search, limit = 50, offset = 0 } = req.query;

    let sql = `
      SELECT 
        r.*,
        t.amount,
        t.currency,
        t.concept,
        t.payment_method,
        t.reference_number,
        t.transaction_date,
        t.transaction_type,
        e.id as entity_id,
        e.name as entity_name,
        e.document_number as entity_doc,
        e.entity_type,
        c.name as category_name,
        u.full_name as user_name
      FROM receipts r
      JOIN transactions t ON r.transaction_id = t.id
      JOIN entities e ON t.entity_id = e.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN users u ON t.user_id = u.id
    `;

    const conditions: string[] = [];
    const params: any[] = [];

    if (status && ['VALID', 'VOIDED'].includes(status as string)) {
      params.push(status);
      conditions.push(`r.status = $${params.length}`);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      params.push(`%${search.trim().toLowerCase()}%`);
      conditions.push(`(
        LOWER(r.receipt_number) LIKE $${params.length} 
        OR LOWER(e.name) LIKE $${params.length} 
        OR LOWER(e.document_number) LIKE $${params.length}
        OR LOWER(t.concept) LIKE $${params.length}
      )`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY r.issue_date DESC, r.created_at DESC';

    params.push(Number(limit));
    sql += ` LIMIT $${params.length}`;

    params.push(Number(offset));
    sql += ` OFFSET $${params.length}`;

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error('Error fetching receipts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getReceiptById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const sql = `
      SELECT 
        r.*,
        t.amount,
        t.currency,
        t.concept,
        t.payment_method,
        t.reference_number,
        t.transaction_date,
        t.transaction_type,
        e.id as entity_id,
        e.name as entity_name,
        e.document_number as entity_doc,
        e.email as entity_email,
        e.phone as entity_phone,
        e.address as entity_address,
        e.entity_type,
        c.name as category_name,
        u.full_name as user_name
      FROM receipts r
      JOIN transactions t ON r.transaction_id = t.id
      JOIN entities e ON t.entity_id = e.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE r.id::text = $1 OR r.receipt_number = $1 OR r.transaction_id::text = $1
    `;
    const result = await query(sql, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Recibo no encontrado' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Error fetching receipt by id:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createReceiptForTransaction(req: Request, res: Response) {
  try {
    const { transaction_id } = req.body;

    if (!transaction_id) {
      return res.status(400).json({ success: false, message: 'ID de transacción requerido' });
    }

    // Verificar si ya tiene recibo
    const existing = await query('SELECT * FROM receipts WHERE transaction_id = $1', [transaction_id]);
    if (existing.rowCount && existing.rowCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Esta transacción ya tiene un recibo emitido',
        data: existing.rows[0],
      });
    }

    const nextNumber = await getNextReceiptNumber();
    const insertRes = await query(`
      INSERT INTO receipts (transaction_id, receipt_number, status)
      VALUES ($1, $2, 'VALID')
      RETURNING *
    `, [transaction_id, nextNumber]);

    res.status(201).json({ success: true, data: insertRes.rows[0] });
  } catch (error: any) {
    console.error('Error creating receipt:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function voidReceipt(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await query(`
      UPDATE receipts 
      SET status = 'VOIDED' 
      WHERE id::text = $1 OR receipt_number = $1
      RETURNING *
    `, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Recibo no encontrado' });
    }

    res.json({ success: true, message: 'Recibo anulado correctamente', data: result.rows[0] });
  } catch (error: any) {
    console.error('Error voiding receipt:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getReceiptPdfStream(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const download = req.query.download === 'true';

    const sql = `
      SELECT 
        r.*,
        t.amount,
        t.currency,
        t.concept,
        t.payment_method,
        t.reference_number,
        t.transaction_date,
        t.transaction_type,
        e.name as entity_name,
        e.document_number as entity_doc,
        e.email as entity_email,
        e.phone as entity_phone,
        e.address as entity_address,
        e.entity_type,
        c.name as category_name,
        u.full_name as user_name
      FROM receipts r
      JOIN transactions t ON r.transaction_id = t.id
      JOIN entities e ON t.entity_id = e.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE r.id::text = $1 OR r.receipt_number = $1 OR r.transaction_id::text = $1
    `;

    const result = await query(sql, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Recibo no encontrado' });
    }

    const row = result.rows[0];
    const receiptData: ReceiptData = {
      receiptNumber: row.receipt_number,
      issueDate: row.issue_date,
      status: row.status,
      entityName: row.entity_name,
      entityDocNumber: row.entity_doc,
      entityType: row.entity_type,
      entityAddress: row.entity_address,
      entityPhone: row.entity_phone,
      entityEmail: row.entity_email,
      amount: Number(row.amount),
      currency: row.currency || 'GS',
      concept: row.concept,
      paymentMethod: row.payment_method,
      referenceNumber: row.reference_number,
      categoryName: row.category_name,
      userName: row.user_name,
    };

    const pdfBuffer = await generateReceiptPdf(receiptData);

    const disposition = download ? 'attachment' : 'inline';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `${disposition}; filename="recibo-${row.receipt_number}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.end(pdfBuffer);
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

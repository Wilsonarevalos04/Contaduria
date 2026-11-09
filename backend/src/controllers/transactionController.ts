import { Request, Response } from 'express';
import { query, pool } from '../config/db';
import { getNextReceiptNumber } from './receiptController';

export async function getTransactions(req: Request, res: Response) {
  try {
    const {
      type,
      entity_id,
      category_id,
      status,
      startDate,
      endDate,
      search,
      currency,
      limit = 100,
      offset = 0,
    } = req.query;

    let whereClauses: string[] = [];
    let params: any[] = [];

    if (type && ['INCOME', 'EXPENSE'].includes(type as string)) {
      params.push(type);
      whereClauses.push(`t.transaction_type = $${params.length}`);
    }

    if (entity_id && typeof entity_id === 'string' && entity_id !== 'all') {
      params.push(entity_id);
      whereClauses.push(`t.entity_id = $${params.length}`);
    }

    if (category_id && typeof category_id === 'string' && category_id !== 'all') {
      params.push(category_id);
      whereClauses.push(`t.category_id = $${params.length}`);
    }

    if (status && ['PENDING', 'COMPLETED', 'CANCELLED'].includes(status as string)) {
      params.push(status);
      whereClauses.push(`t.status = $${params.length}`);
    }

    if (currency && ['GS', 'USD'].includes(currency as string)) {
      params.push(currency);
      whereClauses.push(`t.currency = $${params.length}`);
    }

    if (startDate) {
      params.push(startDate);
      whereClauses.push(`t.transaction_date >= $${params.length}`);
    }

    if (endDate) {
      params.push(endDate);
      whereClauses.push(`t.transaction_date <= $${params.length}`);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      params.push(`%${search.trim().toLowerCase()}%`);
      whereClauses.push(`(
        LOWER(t.concept) LIKE $${params.length} 
        OR LOWER(COALESCE(t.reference_number, '')) LIKE $${params.length}
        OR LOWER(e.name) LIKE $${params.length}
        OR LOWER(e.document_number) LIKE $${params.length}
      )`);
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Consulta de lista
    const listSql = `
      SELECT 
        t.*,
        e.name as entity_name,
        e.document_number as entity_doc,
        e.entity_type,
        c.name as category_name,
        u.full_name as user_name,
        r.id as receipt_id,
        r.receipt_number,
        r.status as receipt_status
      FROM transactions t
      JOIN entities e ON t.entity_id = e.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN receipts r ON t.id = r.transaction_id
      ${whereString}
      ORDER BY t.transaction_date DESC, t.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    // Totales calculados para los filtros actuales
    const totalsSql = `
      SELECT 
        COALESCE(SUM(CASE WHEN t.transaction_type = 'INCOME' AND t.status != 'CANCELLED' THEN t.amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN t.transaction_type = 'EXPENSE' AND t.status != 'CANCELLED' THEN t.amount ELSE 0 END), 0) as total_expense,
        COUNT(t.id) as total_count
      FROM transactions t
      JOIN entities e ON t.entity_id = e.id
      ${whereString}
    `;

    const listResult = await query(listSql, [...params, Number(limit), Number(offset)]);
    const totalsResult = await query(totalsSql, params);

    const totalIncome = Number(totalsResult.rows[0].total_income);
    const totalExpense = Number(totalsResult.rows[0].total_expense);
    const balance = totalIncome - totalExpense;

    res.json({
      success: true,
      data: listResult.rows,
      summary: {
        totalIncome,
        totalExpense,
        balance,
        totalCount: parseInt(totalsResult.rows[0].total_count, 10),
      },
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getTransactionById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const sql = `
      SELECT 
        t.*,
        e.name as entity_name,
        e.document_number as entity_doc,
        e.entity_type,
        c.name as category_name,
        u.full_name as user_name,
        r.id as receipt_id,
        r.receipt_number,
        r.status as receipt_status
      FROM transactions t
      JOIN entities e ON t.entity_id = e.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN receipts r ON t.id = r.transaction_id
      WHERE t.id = $1
    `;
    const result = await query(sql, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Transacción no encontrada' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Error fetching transaction by id:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createTransaction(req: Request, res: Response) {
  const client = await pool.connect();
  try {
    const {
      user_id,
      entity_id,
      category_id,
      transaction_type,
      amount,
      currency = 'GS',
      payment_method,
      concept,
      reference_number,
      transaction_date,
      status = 'COMPLETED',
      generate_receipt = false,
    } = req.body;

    if (!entity_id || !transaction_type || !amount || !payment_method || !concept) {
      return res.status(400).json({
        success: false,
        message: 'Entidad, tipo de operación, monto, método de pago y concepto son requeridos',
      });
    }

    if (!['INCOME', 'EXPENSE'].includes(transaction_type)) {
      return res.status(400).json({ success: false, message: 'Tipo de operación inválido' });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'El monto debe ser mayor a 0' });
    }

    await client.query('BEGIN');

    // Obtener un usuario por defecto si no se especificó
    let targetUserId = user_id;
    if (!targetUserId) {
      const uRes = await client.query('SELECT id FROM users LIMIT 1');
      if (uRes.rowCount && uRes.rowCount > 0) {
        targetUserId = uRes.rows[0].id;
      } else {
        throw new Error('No hay usuarios registrados en el sistema');
      }
    }

    const txSql = `
      INSERT INTO transactions (
        user_id, entity_id, category_id, transaction_type, 
        amount, currency, payment_method, concept, 
        reference_number, transaction_date, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10, CURRENT_DATE), $11)
      RETURNING *
    `;

    const txRes = await client.query(txSql, [
      targetUserId,
      entity_id,
      category_id || null,
      transaction_type,
      amount,
      currency,
      payment_method,
      concept.trim(),
      reference_number ? reference_number.trim() : null,
      transaction_date || null,
      status,
    ]);

    const createdTx = txRes.rows[0];
    let createdReceipt = null;

    if (generate_receipt) {
      const nextReceiptNumber = await getNextReceiptNumber();
      const rcRes = await client.query(`
        INSERT INTO receipts (transaction_id, receipt_number, status)
        VALUES ($1, $2, 'VALID')
        RETURNING *
      `, [createdTx.id, nextReceiptNumber]);
      createdReceipt = rcRes.rows[0];
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: {
        ...createdTx,
        receipt: createdReceipt,
      },
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error creating transaction:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
}

export async function updateTransaction(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      entity_id,
      category_id,
      transaction_type,
      amount,
      currency,
      payment_method,
      concept,
      reference_number,
      transaction_date,
      status,
    } = req.body;

    const sql = `
      UPDATE transactions
      SET
        entity_id = COALESCE($1, entity_id),
        category_id = $2,
        transaction_type = COALESCE($3, transaction_type),
        amount = COALESCE($4, amount),
        currency = COALESCE($5, currency),
        payment_method = COALESCE($6, payment_method),
        concept = COALESCE($7, concept),
        reference_number = $8,
        transaction_date = COALESCE($9, transaction_date),
        status = COALESCE($10, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `;

    const result = await query(sql, [
      entity_id,
      category_id !== undefined ? category_id : null,
      transaction_type,
      amount,
      currency,
      payment_method,
      concept ? concept.trim() : null,
      reference_number ? reference_number.trim() : null,
      transaction_date,
      status,
      id,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Transacción no encontrada' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteTransaction(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await query('DELETE FROM transactions WHERE id = $1', [id]);
    res.json({ success: true, message: 'Transacción eliminada con éxito' });
  } catch (error: any) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

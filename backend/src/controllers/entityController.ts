import { Request, Response } from 'express';
import { query } from '../config/db';

export async function getEntities(req: Request, res: Response) {
  try {
    const { type, search } = req.query;
    let sql = `
      SELECT 
        e.*,
        COUNT(t.id)::int AS total_transactions,
        COALESCE(SUM(CASE WHEN t.transaction_type = 'INCOME' THEN t.amount ELSE 0 END), 0)::numeric AS total_income,
        COALESCE(SUM(CASE WHEN t.transaction_type = 'EXPENSE' THEN t.amount ELSE 0 END), 0)::numeric AS total_expense
      FROM entities e
      LEFT JOIN transactions t ON e.id = t.entity_id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (type && (type === 'CLIENT' || type === 'SUPPLIER')) {
      params.push(type);
      conditions.push(`e.entity_type = $${params.length}`);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      params.push(`%${search.trim().toLowerCase()}%`);
      conditions.push(`(LOWER(e.name) LIKE $${params.length} OR LOWER(e.document_number) LIKE $${params.length} OR LOWER(COALESCE(e.email, '')) LIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' GROUP BY e.id ORDER BY e.name ASC';

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error('Error fetching entities:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getEntityById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const entityRes = await query('SELECT * FROM entities WHERE id = $1', [id]);
    if (entityRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Entidad no encontrada' });
    }

    const txRes = await query(`
      SELECT t.*, c.name as category_name, r.id as receipt_id, r.receipt_number
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN receipts r ON t.id = r.transaction_id
      WHERE t.entity_id = $1
      ORDER BY t.transaction_date DESC, t.created_at DESC
    `, [id]);

    res.json({
      success: true,
      data: {
        ...entityRes.rows[0],
        transactions: txRes.rows,
      },
    });
  } catch (error: any) {
    console.error('Error fetching entity by id:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createEntity(req: Request, res: Response) {
  try {
    const { entity_type, name, document_number, email, phone, address } = req.body;

    if (!entity_type || !name || !document_number) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de entidad, nombre y número de documento son obligatorios',
      });
    }

    if (!['CLIENT', 'SUPPLIER'].includes(entity_type)) {
      return res.status(400).json({
        success: false,
        message: "El tipo de entidad debe ser 'CLIENT' o 'SUPPLIER'",
      });
    }

    // Comprobar si ya existe con ese número de documento
    const existCheck = await query(
      'SELECT id, name FROM entities WHERE document_number = $1 AND entity_type = $2',
      [document_number.trim(), entity_type]
    );

    if (existCheck.rowCount && existCheck.rowCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Ya existe un ${entity_type === 'CLIENT' ? 'cliente' : 'proveedor'} con el documento ${document_number}`,
      });
    }

    const insertSql = `
      INSERT INTO entities (entity_type, name, document_number, email, phone, address)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await query(insertSql, [
      entity_type,
      name.trim(),
      document_number.trim(),
      email ? email.trim() : null,
      phone ? phone.trim() : null,
      address ? address.trim() : null,
    ]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Error creating entity:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateEntity(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { entity_type, name, document_number, email, phone, address } = req.body;

    const check = await query('SELECT id FROM entities WHERE id = $1', [id]);
    if (check.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Entidad no encontrada' });
    }

    const updateSql = `
      UPDATE entities
      SET 
        entity_type = COALESCE($1, entity_type),
        name = COALESCE($2, name),
        document_number = COALESCE($3, document_number),
        email = $4,
        phone = $5,
        address = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;
    const result = await query(updateSql, [
      entity_type,
      name ? name.trim() : null,
      document_number ? document_number.trim() : null,
      email !== undefined ? (email ? email.trim() : null) : null,
      phone !== undefined ? (phone ? phone.trim() : null) : null,
      address !== undefined ? (address ? address.trim() : null) : null,
      id,
    ]);

    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Error updating entity:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteEntity(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Verificar si tiene transacciones vinculadas
    const txCount = await query('SELECT count(*) as count FROM transactions WHERE entity_id = $1', [id]);
    if (parseInt(txCount.rows[0].count, 10) > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar la entidad porque tiene transacciones registradas en el Libro Diario.',
      });
    }

    await query('DELETE FROM entities WHERE id = $1', [id]);
    res.json({ success: true, message: 'Entidad eliminada correctamente' });
  } catch (error: any) {
    console.error('Error deleting entity:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

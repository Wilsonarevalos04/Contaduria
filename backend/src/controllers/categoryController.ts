import { Request, Response } from 'express';
import { query } from '../config/db';

export async function getCategories(req: Request, res: Response) {
  try {
    const { type } = req.query;
    let sql = 'SELECT * FROM categories';
    const params: any[] = [];

    if (type && ['INCOME', 'EXPENSE'].includes(type as string)) {
      params.push(type);
      sql += ' WHERE transaction_type = $1';
    }

    sql += ' ORDER BY name ASC';
    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createCategory(req: Request, res: Response) {
  try {
    const { name, transaction_type, description } = req.body;

    if (!name || !transaction_type) {
      return res.status(400).json({
        success: false,
        message: 'El nombre y el tipo de operación (INCOME o EXPENSE) son requeridos',
      });
    }

    if (!['INCOME', 'EXPENSE'].includes(transaction_type)) {
      return res.status(400).json({
        success: false,
        message: "El tipo de operación debe ser 'INCOME' o 'EXPENSE'",
      });
    }

    const check = await query(
      'SELECT id FROM categories WHERE LOWER(name) = LOWER($1) AND transaction_type = $2',
      [name.trim(), transaction_type]
    );
    if (check.rowCount && check.rowCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una categoría con ese nombre para este tipo de operación',
      });
    }

    const resInsert = await query(
      `INSERT INTO categories (name, transaction_type, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name.trim(), transaction_type, description ? description.trim() : null]
    );

    res.status(201).json({ success: true, data: resInsert.rows[0] });
  } catch (error: any) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

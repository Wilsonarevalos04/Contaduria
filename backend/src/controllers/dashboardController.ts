import { Request, Response } from 'express';
import { query } from '../config/db';

export async function getDashboardStats(req: Request, res: Response) {
  try {
    const { startDate, endDate, entity_id } = req.query;

    let filterClauses: string[] = ["status != 'CANCELLED'"];
    let params: any[] = [];

    if (startDate) {
      params.push(startDate);
      filterClauses.push(`transaction_date >= $${params.length}`);
    }
    if (endDate) {
      params.push(endDate);
      filterClauses.push(`transaction_date <= $${params.length}`);
    }
    if (entity_id && entity_id !== 'all') {
      params.push(entity_id);
      filterClauses.push(`entity_id = $${params.length}`);
    }

    const whereStr = 'WHERE ' + filterClauses.join(' AND ');

    // 1. KPI Totales
    const kpiSql = `
      SELECT
        COALESCE(SUM(CASE WHEN transaction_type = 'INCOME' THEN amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN transaction_type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS total_expense,
        COUNT(id) AS total_transactions
      FROM transactions
      ${whereStr}
    `;
    const kpiRes = await query(kpiSql, params);
    const totalIncome = Number(kpiRes.rows[0].total_income);
    const totalExpense = Number(kpiRes.rows[0].total_expense);
    const netBalance = totalIncome - totalExpense;

    // 2. Conteo de entidades y recibos
    const entitiesCountRes = await query(`
      SELECT 
        COUNT(CASE WHEN entity_type = 'CLIENT' THEN 1 END) AS client_count,
        COUNT(CASE WHEN entity_type = 'SUPPLIER' THEN 1 END) AS supplier_count
      FROM entities
    `);

    const receiptsCountRes = await query(`
      SELECT 
        COUNT(CASE WHEN status = 'VALID' THEN 1 END) AS valid_receipts,
        COUNT(CASE WHEN status = 'VOIDED' THEN 1 END) AS voided_receipts
      FROM receipts
    `);

    // 3. Flujo Mensual (Cash Flow) de los últimos 6 meses
    const monthlySql = `
      SELECT 
        TO_CHAR(transaction_date, 'YYYY-MM') AS month,
        COALESCE(SUM(CASE WHEN transaction_type = 'INCOME' THEN amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN transaction_type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS expense
      FROM transactions
      WHERE status != 'CANCELLED'
      GROUP BY TO_CHAR(transaction_date, 'YYYY-MM')
      ORDER BY month ASC
      LIMIT 12
    `;
    const monthlyRes = await query(monthlySql);

    // 4. Desglose por Categorías
    const catExpenseSql = `
      SELECT 
        COALESCE(c.name, 'Sin Categoría') AS category,
        SUM(t.amount) AS total
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.transaction_type = 'EXPENSE' AND t.status != 'CANCELLED'
      GROUP BY c.name
      ORDER BY total DESC
      LIMIT 6
    `;
    const catIncomeSql = `
      SELECT 
        COALESCE(c.name, 'Sin Categoría') AS category,
        SUM(t.amount) AS total
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.transaction_type = 'INCOME' AND t.status != 'CANCELLED'
      GROUP BY c.name
      ORDER BY total DESC
      LIMIT 6
    `;

    const catExpenseRes = await query(catExpenseSql);
    const catIncomeRes = await query(catIncomeSql);

    // 5. Transacciones Recientes
    const recentTxSql = `
      SELECT 
        t.*,
        e.name as entity_name,
        e.entity_type,
        c.name as category_name,
        r.id as receipt_id,
        r.receipt_number,
        r.status as receipt_status
      FROM transactions t
      JOIN entities e ON t.entity_id = e.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN receipts r ON t.id = r.transaction_id
      ORDER BY t.transaction_date DESC, t.created_at DESC
      LIMIT 6
    `;
    const recentTxRes = await query(recentTxSql);

    res.json({
      success: true,
      data: {
        kpis: {
          totalIncome,
          totalExpense,
          netBalance,
          totalTransactions: parseInt(kpiRes.rows[0].total_transactions, 10),
          clientCount: parseInt(entitiesCountRes.rows[0].client_count, 10),
          supplierCount: parseInt(entitiesCountRes.rows[0].supplier_count, 10),
          validReceipts: parseInt(receiptsCountRes.rows[0].valid_receipts, 10),
          voidedReceipts: parseInt(receiptsCountRes.rows[0].voided_receipts, 10),
        },
        cashFlow: monthlyRes.rows.map((r) => ({
          month: r.month,
          ingresos: Number(r.income),
          egresos: Number(r.expense),
          balance: Number(r.income) - Number(r.expense),
        })),
        categoryBreakdown: {
          expenses: catExpenseRes.rows.map((r) => ({
            name: r.category,
            value: Number(r.total),
          })),
          incomes: catIncomeRes.rows.map((r) => ({
            name: r.category,
            value: Number(r.total),
          })),
        },
        recentTransactions: recentTxRes.rows,
      },
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

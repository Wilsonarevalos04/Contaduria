import { Router } from 'express';
import {
  getEntities,
  getEntityById,
  createEntity,
  updateEntity,
  deleteEntity,
} from '../controllers/entityController';
import { getCategories, createCategory } from '../controllers/categoryController';
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionController';
import {
  getReceipts,
  getReceiptById,
  createReceiptForTransaction,
  voidReceipt,
  getReceiptPdfStream,
} from '../controllers/receiptController';
import { getStatement, getStatementPdfStream } from '../controllers/statementController';
import { getDashboardStats } from '../controllers/dashboardController';
import { query } from '../config/db';

const router = Router();

// Health check
router.get('/health', async (_req, res) => {
  try {
    const dbRes = await query('SELECT NOW() as time, version() as version');
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        serverTime: dbRes.rows[0].time,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Base de datos no conectada',
      error: error.message,
    });
  }
});

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Entidades (Clientes / Proveedores)
router.get('/entities', getEntities);
router.get('/entities/:id', getEntityById);
router.post('/entities', createEntity);
router.put('/entities/:id', updateEntity);
router.delete('/entities/:id', deleteEntity);

// Categorías
router.get('/categories', getCategories);
router.post('/categories', createCategory);

// Transacciones (Libro Diario)
router.get('/transactions', getTransactions);
router.get('/transactions/:id', getTransactionById);
router.post('/transactions', createTransaction);
router.put('/transactions/:id', updateTransaction);
router.delete('/transactions/:id', deleteTransaction);

// Recibos Oficiales
router.get('/receipts', getReceipts);
router.get('/receipts/:id', getReceiptById);
router.post('/receipts/generate', createReceiptForTransaction);
router.post('/receipts/:id/void', voidReceipt);
router.get('/receipts/:id/pdf', getReceiptPdfStream);

// Extracto de Cuenta Bancario / Contable
router.get('/statement', getStatement);
router.get('/statement/pdf', getStatementPdfStream);

export default router;

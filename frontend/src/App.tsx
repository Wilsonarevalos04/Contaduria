import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, NavTab } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { DashboardView } from './components/Dashboard/DashboardView';
import { LibroDiarioView } from './components/Transactions/LibroDiarioView';
import { EntitiesView } from './components/Entities/EntitiesView';
import { ReceiptsView } from './components/Receipts/ReceiptsView';
import { StatementView } from './components/Statement/StatementView';
import { TransactionModal } from './components/Transactions/TransactionModal';
import { EntityModal } from './components/Entities/EntityModal';
import { EntityDetailModal } from './components/Entities/EntityDetailModal';
import { ReceiptModal } from './components/Receipts/ReceiptModal';
import { ToastContainer, ToastMessage } from './components/Common/Toast';
import { api } from './api/client';
import {
  DashboardStats,
  Entity,
  Category,
  Transaction,
  Receipt,
  TransactionType,
  EntityType,
} from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [loading, setLoading] = useState(true);

  // Estados de datos
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionSummary, setTransactionSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    totalCount: 0,
  });
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  // Filtros del Libro Diario
  const [txFilters, setTxFilters] = useState<{
    type?: TransactionType;
    entity_id?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }>({
    search: '',
    entity_id: 'all',
  });

  // Notificaciones
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };
  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Estados de modales
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState<TransactionType>('INCOME');

  const [isEntityModalOpen, setIsEntityModalOpen] = useState(false);
  const [entityToEdit, setEntityToEdit] = useState<Entity | null>(null);
  const [defaultEntityType, setDefaultEntityType] = useState<EntityType>('CLIENT');

  const [detailEntityId, setDetailEntityId] = useState<string | null>(null);
  const [viewingReceiptId, setViewingReceiptId] = useState<string | null>(null);

  // Carga global de datos
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [dashRes, entRes, catRes, txRes, rcRes] = await Promise.all([
        api.getDashboard(),
        api.getEntities(),
        api.getCategories(),
        api.getTransactions(txFilters),
        api.getReceipts(),
      ]);

      setDashboardStats(dashRes.data);
      setEntities(entRes.data);
      setCategories(catRes.data);
      setTransactions(txRes.data);
      setTransactionSummary(txRes.summary);
      setReceipts(rcRes.data);
    } catch (error: any) {
      console.error('Error fetching application data:', error);
      addToast('error', 'Error al cargar datos', error.message);
    } finally {
      setLoading(false);
    }
  }, [txFilters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Manejadores
  const handleOpenNewTx = (type: 'INCOME' | 'EXPENSE') => {
    setTxModalType(type);
    setIsTxModalOpen(true);
  };

  const handleTxSuccess = (tx: any) => {
    addToast(
      'success',
      'Operación registrada con éxito',
      `${tx.transaction_type === 'INCOME' ? 'Ingreso' : 'Egreso'} por ${tx.amount} ${tx.currency}`
    );
    if (tx.receipt) {
      addToast('info', `Recibo ${tx.receipt.receipt_number} emitido automáticamente`);
      setViewingReceiptId(tx.receipt.id);
    }
    loadData();
  };

  const handleOpenNewEntity = (type: EntityType = 'CLIENT') => {
    setEntityToEdit(null);
    setDefaultEntityType(type);
    setIsEntityModalOpen(true);
  };

  const handleEditEntity = (entity: Entity) => {
    setEntityToEdit(entity);
    setIsEntityModalOpen(true);
  };

  const handleEntitySuccess = (entity: Entity) => {
    addToast('success', 'Entidad guardada', `${entity.name} (RUC: ${entity.document_number})`);
    loadData();
  };

  // Títulos dinámicos de cabecera
  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Panel Financiero & Flujo de Caja',
      subtitle: 'Métricas generales del estudio contable',
    },
    transactions: {
      title: 'Libro Diario de Ingresos y Egresos',
      subtitle: 'Registro cronológico y control de movimientos',
    },
    statement: {
      title: 'Extracto de Operaciones & Bancario',
      subtitle: 'Histórico de movimientos con saldo anterior y acumulado en tiempo real',
    },
    entities: {
      title: 'Directorio de Clientes y Proveedores',
      subtitle: 'Información fiscal, RUC y estado de cuentas',
    },
    receipts: {
      title: 'Recibos Oficiales Digitales',
      subtitle: 'Numeración correlativa legal y archivos PDF',
    },
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Barra lateral */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openNewTxModal={() => handleOpenNewTx('INCOME')}
      />

      {/* Área principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          title={titles[activeTab].title}
          subtitle={titles[activeTab].subtitle}
          netBalance={dashboardStats?.kpis.netBalance}
          onNewTransaction={handleOpenNewTx}
          onRefresh={loadData}
          loading={loading}
        />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={dashboardStats}
              loading={loading}
              onOpenNewTx={handleOpenNewTx}
              onViewReceipt={(id) => setViewingReceiptId(id)}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'transactions' && (
            <LibroDiarioView
              transactions={transactions}
              summary={transactionSummary}
              loading={loading}
              onRefresh={loadData}
              onOpenNewTx={handleOpenNewTx}
              onViewReceipt={(id) => setViewingReceiptId(id)}
              entities={entities}
              categories={categories}
              filters={txFilters}
              setFilters={setTxFilters}
            />
          )}

          {activeTab === 'statement' && (
            <StatementView
              entities={entities}
              onViewReceipt={(id) => setViewingReceiptId(id)}
            />
          )}

          {activeTab === 'entities' && (
            <EntitiesView
              entities={entities}
              loading={loading}
              onRefresh={loadData}
              onOpenNewEntityModal={handleOpenNewEntity}
              onEditEntity={handleEditEntity}
              onViewEntityDetail={(id) => setDetailEntityId(id)}
            />
          )}

          {activeTab === 'receipts' && (
            <ReceiptsView
              receipts={receipts}
              loading={loading}
              onRefresh={loadData}
              onViewReceipt={(id) => setViewingReceiptId(id)}
            />
          )}
        </main>
      </div>

      {/* Modales */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSuccess={handleTxSuccess}
        initialType={txModalType}
        entities={entities}
        categories={categories}
        onOpenNewEntityModal={() => handleOpenNewEntity(txModalType === 'INCOME' ? 'CLIENT' : 'SUPPLIER')}
      />

      <EntityModal
        isOpen={isEntityModalOpen}
        onClose={() => setIsEntityModalOpen(false)}
        onSuccess={handleEntitySuccess}
        entityToEdit={entityToEdit}
        defaultType={defaultEntityType}
      />

      <EntityDetailModal
        entityId={detailEntityId}
        onClose={() => setDetailEntityId(null)}
        onViewReceipt={(id) => setViewingReceiptId(id)}
      />

      <ReceiptModal
        receiptId={viewingReceiptId}
        onClose={() => setViewingReceiptId(null)}
        onVoidSuccess={() => {
          addToast('info', 'El recibo ha sido anulado');
          loadData();
        }}
      />

      {/* Notificaciones */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;

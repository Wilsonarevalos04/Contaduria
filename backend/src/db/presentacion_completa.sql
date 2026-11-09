-- ==============================================================================
-- SISTEMA DE GESTIÓN CONTABLE Y RECIBOS
-- SCRIPT DE PRESENTACIÓN: DDL + ÍNDICES + DATOS DE DEMOSTRACIÓN (SEEDS)
-- MOTOR: PostgreSQL 14+
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: users (Contadores y Administradores)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'ACCOUNTANT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA: entities (Clientes y Proveedores)
CREATE TABLE IF NOT EXISTS entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('CLIENT', 'SUPPLIER')),
    name VARCHAR(200) NOT NULL,
    document_number VARCHAR(50) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA: categories (Rubros Contables de Ingreso y Gasto)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('INCOME', 'EXPENSE')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABLA: transactions (Libro Diario / Operaciones Financieras)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE RESTRICT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('INCOME', 'EXPENSE')),
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) DEFAULT 'GS',
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('CASH', 'TRANSFER', 'CHEQUE', 'CARD')),
    
    concept TEXT NOT NULL,
    reference_number VARCHAR(100),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    status VARCHAR(20) DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLA: receipts (Emisión y Control de Recibos Correlativos)
CREATE TABLE IF NOT EXISTS receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID UNIQUE NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    issue_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    pdf_url TEXT,
    status VARCHAR(20) DEFAULT 'VALID' CHECK (status IN ('VALID', 'VOIDED')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. ÍNDICES DE ALTO RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_entities_doc_number ON entities(document_number);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_entity ON transactions(entity_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_receipts_number ON receipts(receipt_number);

-- ==============================================================================
-- CARGA DE DATOS DE DEMOSTRACIÓN (SEEDS REALISTAS PARA EXPOSICIÓN)
-- ==============================================================================

-- Usuario Administrador / Contador
INSERT INTO users (id, full_name, email, password_hash, role)
VALUES ('a0000000-0000-0000-0000-000000000001', 'Wilson Contador', 'contador@contaduria.com', 'admin123', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Rubros Contables (Ingresos y Egresos)
INSERT INTO categories (id, name, transaction_type, description) VALUES 
('b0000000-0000-0000-0000-000000000001', 'Servicios Contables', 'INCOME', 'Honorarios por liquidación de impuestos y balance general'),
('b0000000-0000-0000-0000-000000000002', 'Auditoría', 'INCOME', 'Servicios de auditoría externa e interna de balances'),
('b0000000-0000-0000-0000-000000000003', 'Asesoría Fiscal', 'INCOME', 'Planificación tributaria y consultoría'),
('b0000000-0000-0000-0000-000000000004', 'Insumos de Oficina', 'EXPENSE', 'Compra de papel, tóner, carpetas y útiles'),
('b0000000-0000-0000-0000-000000000005', 'Servicios Básicos e Internet', 'EXPENSE', 'Energía eléctrica, agua y conectividad')
ON CONFLICT DO NOTHING;

-- Clientes y Proveedores (Entidades)
INSERT INTO entities (id, entity_type, name, document_number, email, phone, address) VALUES 
('c0000000-0000-0000-0000-000000000001', 'CLIENT', 'Inversiones del Este S.A.', '80012345-6', 'contacto@inversioneseste.com', '0981-123456', 'Avda. España 1420, Asunción'),
('c0000000-0000-0000-0000-000000000002', 'CLIENT', 'Comercial San Roque S.R.L.', '80098765-4', 'admin@sanroque.com.py', '0971-654321', 'Mcal. Estigarribia 850, San Lorenzo'),
('c0000000-0000-0000-0000-000000000003', 'SUPPLIER', 'Papelería Central S.A.', '80034567-8', 'ventas@papeleriacentral.com', '021-445566', 'Palma 560, Asunción'),
('c0000000-0000-0000-0000-000000000004', 'SUPPLIER', 'Telecomunicaciones & Fibra S.A.', '80011223-9', 'soporte@telecom.com.py', '021-118800', 'Alberdi esq. Oliva, Asunción')
ON CONFLICT DO NOTHING;

-- Asientos del Libro Diario (Transacciones)
INSERT INTO transactions (id, user_id, entity_id, category_id, transaction_type, amount, currency, payment_method, concept, reference_number, transaction_date, status) VALUES 
('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'INCOME', 2500000.00, 'GS', 'TRANSFER', 'Honorarios contables correspondientes al mes en curso', 'TRF-98214', CURRENT_DATE, 'COMPLETED'),
('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'INCOME', 1800000.00, 'GS', 'CHEQUE', 'Servicio de revisión y auditoría preliminar de balances', 'CHQ-55421', CURRENT_DATE, 'COMPLETED'),
('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000004', 'EXPENSE', 450000.00, 'GS', 'CASH', 'Compra de resmas de papel continuo y carpetas fiscales', 'FAC-001-002-8819', CURRENT_DATE, 'COMPLETED')
ON CONFLICT DO NOTHING;

-- Recibos Correlativos Asociados
INSERT INTO receipts (id, transaction_id, receipt_number, status) VALUES 
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', '001-001-0000001', 'VALID'),
('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', '001-001-0000002', 'VALID')
ON CONFLICT DO NOTHING;

-- Fin del script de presentación

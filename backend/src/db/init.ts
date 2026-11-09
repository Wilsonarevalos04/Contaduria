import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const adminUrl = process.env.ADMIN_DB_URL || 'postgresql://postgres:1234@localhost:5432/postgres';
const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/contaduria';

export async function initializeDatabase() {
  console.log('🔄 Iniciando verificación y configuración de PostgreSQL...');

  // 1. Conectar a la base de datos de administración ('postgres') para verificar si 'contaduria' existe
  const adminClient = new Client({ connectionString: adminUrl });
  try {
    await adminClient.connect();
    const checkDbRes = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = 'contaduria'"
    );

    if (checkDbRes.rowCount === 0) {
      console.log("📁 Creando base de datos 'contaduria'...");
      await adminClient.query('CREATE DATABASE contaduria');
      console.log("✅ Base de datos 'contaduria' creada con éxito.");
    } else {
      console.log("✅ Base de datos 'contaduria' ya existe.");
    }
  } catch (err: any) {
    console.warn('⚠️ Nota sobre admin client:', err.message);
  } finally {
    await adminClient.end().catch(() => {});
  }

  // 2. Conectar directamente a 'contaduria' para aplicar esquema e índices
  const dbClient = new Client({ connectionString: dbUrl });
  try {
    await dbClient.connect();
    console.log("🔌 Conectado a la base de datos 'contaduria'.");

    let schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      schemaPath = path.resolve(__dirname, '../../src/db/schema.sql');
    }
    if (!fs.existsSync(schemaPath)) {
      schemaPath = path.resolve(__dirname, '../src/db/schema.sql');
    }
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    await dbClient.query(schemaSql);
    console.log('✅ Esquema DDL e índices aplicados correctamente.');

    // 3. Insertar usuario inicial si no existe
    const userCheck = await dbClient.query('SELECT id FROM users LIMIT 1');
    let defaultUserId: string;

    if (userCheck.rowCount === 0) {
      console.log('👤 Creando usuario administrador/contador inicial...');
      const userRes = await dbClient.query(`
        INSERT INTO users (full_name, email, password_hash, role)
        VALUES ('CP. Arturo Arévalos', 'arevalosarturo2@gmail.com', 'admin123', 'ADMIN')
        RETURNING id
      `);
      defaultUserId = userRes.rows[0].id;
      console.log('✅ Usuario inicial creado:', defaultUserId);
    } else {
      defaultUserId = userCheck.rows[0].id;
      await dbClient.query(`
        UPDATE users 
        SET full_name = 'CP. Arturo Arévalos', email = 'arevalosarturo2@gmail.com'
        WHERE id = $1
      `, [defaultUserId]);
      console.log('👤 Usuario administrador verificado y sincronizado: CP. Arturo Arévalos (arevalosarturo2@gmail.com).');
    }

    // 4. Insertar categorías contables si están vacías
    const catCheck = await dbClient.query('SELECT count(*) as count FROM categories');
    if (parseInt(catCheck.rows[0].count, 10) === 0) {
      console.log('📑 Sembrando categorías contables iniciales...');
      await dbClient.query(`
        INSERT INTO categories (name, transaction_type, description) VALUES 
        ('Servicios Contables', 'INCOME', 'Honorarios por liquidación de impuestos y contabilidad general'),
        ('Auditoría', 'INCOME', 'Servicios de auditoría externa e interna'),
        ('Asesoría Fiscal', 'INCOME', 'Planificación tributaria y consultoría'),
        ('Insumos de Oficina', 'EXPENSE', 'Compra de papel, tinta, carpetas y suministros'),
        ('Pago de Impuestos', 'EXPENSE', 'Liquidación de IVA, Renta, etc.'),
        ('Servicios Básicos e Internet', 'EXPENSE', 'Energía eléctrica, agua, telefonía y fibra óptica'),
        ('Software y Licencias', 'EXPENSE', 'Suscripciones contables y herramientas digitales'),
        ('Alquiler de Oficina', 'EXPENSE', 'Arrendamiento de espacio comercial')
      `);
      console.log('✅ Categorías contables sembradas.');
    }

    // 5. Entidades y transacciones se mantienen limpias para ingreso real desde cero.
    console.log('✅ Base de datos verificada y lista para cargar datos desde cero.');

    console.log('🚀 Base de datos inicializada y lista para operar.');
  } catch (err: any) {
    console.error('❌ Error durante la inicialización de la base de datos:', err);
    throw err;
  } finally {
    await dbClient.end().catch(() => {});
  }
}

if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Proceso de base de datos finalizado correctamente.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fallo en el proceso:', err);
      process.exit(1);
    });
}

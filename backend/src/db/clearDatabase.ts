import { Client } from 'pg';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/contaduria';

async function clearDatabase() {
  console.log('🧹 Conectando a la base de datos para limpiar registros...');
  const client = new Client({ connectionString: dbUrl });

  try {
    await client.connect();
    console.log('🔌 Conexión establecida.');

    // 1. Truncar tablas de operaciones y entidades
    console.log('🗑️ Vaciando tablas: receipts, transactions, entities...');
    await client.query('TRUNCATE TABLE receipts, transactions, entities RESTART IDENTITY CASCADE;');

    // 2. Actualizar o asegurar usuario contador para Arturo Arévalos
    const userCheck = await client.query('SELECT id FROM users LIMIT 1');
    if (userCheck.rowCount === 0) {
      await client.query(`
        INSERT INTO users (full_name, email, password_hash, role)
        VALUES ('CP. Arturo Arévalos', 'arevalosarturo2@gmail.com', 'admin123', 'ADMIN')
      `);
      console.log('👤 Usuario CP. Arturo Arévalos creado como administrador activo.');
    } else {
      await client.query(`
        UPDATE users 
        SET full_name = 'CP. Arturo Arévalos', email = 'arevalosarturo2@gmail.com';
      `);
      console.log('👤 Usuario actualizado con el nombre: CP. Arturo Arévalos (arevalosarturo2@gmail.com).');
    }

    // 3. Verificar recuentos
    const entitiesCount = await client.query('SELECT COUNT(*) FROM entities');
    const transactionsCount = await client.query('SELECT COUNT(*) FROM transactions');
    const receiptsCount = await client.query('SELECT COUNT(*) FROM receipts');
    const categoriesCount = await client.query('SELECT COUNT(*) FROM categories');
    const usersCount = await client.query('SELECT COUNT(*) FROM users');

    console.log('\n📊 ESTADO ACTUAL DE LA BASE DE DATOS:');
    console.log(`- Recibos (receipts): ${receiptsCount.rows[0].count}`);
    console.log(`- Transacciones (transactions): ${transactionsCount.rows[0].count}`);
    console.log(`- Entidades (entities - Clientes/Proveedores): ${entitiesCount.rows[0].count}`);
    console.log(`- Categorías contables (categories): ${categoriesCount.rows[0].count}`);
    console.log(`- Usuarios contables activos (users): ${usersCount.rows[0].count}`);
    console.log('\n✨ ¡Base de datos vaciada con éxito! Lista para ingresar datos desde cero.');
  } catch (error) {
    console.error('❌ Error vaciando la base de datos:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

clearDatabase();

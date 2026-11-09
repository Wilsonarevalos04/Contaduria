import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import apiRouter from './routes/api';
import { initializeDatabase } from './db/init';

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Montar endpoints API
app.use('/api', apiRouter);

// Servir frontend compilado en producción (dist)
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
const altFrontendDist = path.resolve(__dirname, '../frontend/dist');

const activeDist = fs.existsSync(frontendDist)
  ? frontendDist
  : fs.existsSync(altFrontendDist)
  ? altFrontendDist
  : null;

if (activeDist) {
  console.log(`🌐 Sirviendo Frontend estático desde: ${activeDist}`);
  app.use(express.static(activeDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(activeDist, 'index.html'));
  });
} else {
  // Ruta raíz fallback si no se ha generado la build del frontend
  app.get('/', (_req, res) => {
    res.json({
      app: 'Sistema de Gestión Contable y Recibos API',
      version: '1.0.0',
      status: 'ONLINE',
      docs: '/api/health',
    });
  });
}

async function startServer() {
  try {
    console.log('🚀 Iniciando Sistema de Gestión Contable...');
    // Inicializar base de datos automáticamente al arrancar
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`✨ Servidor Backend ejecutándose en: http://localhost:${PORT}`);
      console.log(`📡 Endpoints API disponibles en: http://localhost:${PORT}/api`);
      console.log(`📑 Health check: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });
  } catch (error: any) {
    console.error('❌ Error fatal al iniciar el servidor:', error.message);
    // Dejar corriendo Express para que el usuario pueda ver el error en health check si falla DB
    app.listen(PORT, () => {
      console.log(`⚠️ Servidor levantado en http://localhost:${PORT} con advertencias de conexión.`);
    });
  }
}

startServer();

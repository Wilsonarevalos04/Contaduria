# Sistema de Gestión Contable y Recibos 

Aplicación web integral para el registro, control contable y emisión de recibos oficiales en formato PDF con numeración correlativa legal.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript, PDFKit.
- **Base de Datos**: PostgreSQL 17 (con extensión `uuid-ossp`, índices y relaciones estrictas).

---

## 🚀 Puesta en Marcha Rápida

### 1. Variables de Entorno
El archivo [backend/.env](file:///c:/Users/wilso/OneDrive/Escritorio/Contaduria/backend/.env) ya está configurado con tus credenciales:
```env
PORT=4000
DATABASE_URL=postgresql://postgres:1234@localhost:5432/contaduria
ADMIN_DB_URL=postgresql://postgres:1234@localhost:5432/postgres
```

### 2. Iniciar la Aplicación
Desde la carpeta raíz del proyecto, ejecuta:
```bash
npm run dev
```
Esto iniciará simultáneamente:
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:4000](http://localhost:4000)

---

## 📂 Módulos de la Aplicación

1. **Panel Principal (Dashboard)**:
   - Resumen visual con Saldo Neto Actual en Caja, Total de Ingresos y Egresos.
   - Gráfica mensual de Flujo de Caja.
   - Desglose porcentual de gastos por rubro contable.
   - Acceso rápido a los últimos movimientos y descarga directa de recibos.

2. **Libro Diario (Ingresos y Egresos)**:
   - Registro ultra-rápido estilo *Treinta* con pestañas diferenciadas para Cobros y Pagos.
   - Soporte para Guaraníes (`GS`) y Dólares (`USD`).
   - Filtros en tiempo real por tipo, rango de fechas, entidad o rubro.
   - Opción para emitir recibo oficial en PDF al momento de registrar.

3. **Directorio de Entidades (Clientes y Proveedores)**:
   - Registro de datos fiscales: Nombre/Razón Social, RUC / Cédula, teléfono, email y dirección.
   - Vista de detalle con historial completo de transacciones por cliente o proveedor.

4. **Motor de Recibos Oficiales**:
   - Generación automática con numeración correlativa secuencial (`001-001-0000001`, `001-001-0000002`, etc.).
   - Membrete formal con datos del Estudio Contable y RUC.
   - Conversión automática de montos a letras en español (ej: `*** UN MILLÓN DOSCIENTOS MIL GUARANÍES ***`).
   - Visor de PDF integrado con opciones de **Imprimir**, **Descargar** y **Anular**.

5. **Extracto de Cuenta y Operaciones (Estilo Bancario)**:
   - Conciliación y estado de cuenta con cálculo automático de Saldo Anterior (Apertura).
   - Movimientos cronológicos con Saldo Acumulado (Running Balance) en cada operación.
   - Filtros por fechas rápidas, entidad, moneda (GS / USD) y método de pago.
   - Exportación de Extracto Oficial en formato PDF para clientes o auditoría interna.

---

## 💻 Despliegue Local para Cliente (1-Clic)

Para correr la aplicación en la computadora del cliente sin requerir hosting ni terminales abiertas:
- `iniciar_sistema.bat`: Levanta el servidor local y abre la ventana en modo aplicación.
- `crear_acceso_directo.bat`: Crea un acceso directo en el Escritorio.
- `respaldar_bd.bat`: Genera una copia de seguridad timestamped de la base de datos PostgreSQL en `backups/`.
- `instalar_sistema.bat`: Asistente de instalación de dependencias y compilación inicial.

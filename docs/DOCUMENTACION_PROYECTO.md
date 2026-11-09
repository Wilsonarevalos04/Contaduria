# DOCUMENTACIÓN DE PROYECTO TECNOLÓGICO
### Plantilla oficial de seguimiento — Trabajo Práctico Integrador

---

## 1. Ficha del Proyecto

* **Título del proyecto:** Sistema Integral de Gestión Contable, Flujo de Caja y Emisión de Recibos Oficiales (Caso: Estudio Contable CP. Arturo Arévalos)
* **Nombre del repositorio (GitHub):** `Contaduria`
* **URL del repositorio:** [https://github.com/Wilsonarevalos04/Contaduria](https://github.com/Wilsonarevalos04/Contaduria)
* **Área(s) / disciplina(s) involucradas:** Desarrollo Web Fullstack, Arquitectura de Bases de Datos Relacionales, Ingeniería de Software, Generación de Documentos Digitales Legales, Automatización y Despliegue en Entornos Locales.
* **Docente(s) agregado(s) como colaborador/es:** *(Completar con el nombre y usuario de GitHub de tu profesor/a)*

### Integrantes y roles:

| Nombre completo | Usuario GitHub | Correo | Rol / área principal |
| :--- | :--- | :--- | :--- |
| **Wilson Arévalos** | `@Wilsonarevalos04` | `wjarevalos@fctunca.edu.py` | Líder de Proyecto / Desarrollador Fullstack & Base de Datos |
| **Areco** | `@Areco-Github` | *(Completar correo)* | Desarrollador Colaborador / Frontend & QA |

---

## 2. Introducción

El presente proyecto consiste en el diseño, desarrollo e implementación de una solución tecnológica integral de gestión financiera y contable, orientada a estudios contables independientes, profesionales de la contabilidad y pequeñas y medianas empresas (PYMES). La necesidad surge a partir de una problemática real identificada en el ejercicio contable diario: la dependencia de registros manuales dispersos en hojas de cálculo (Excel) y talonarios de recibos físicos en papel, lo cual suele ocasionar desfasajes en el control de caja, extravío de comprobantes, errores en el cálculo de saldos y demoras críticas al momento de conciliar ingresos y egresos frente a los clientes.

Para dar respuesta a esta situación, se desarrolló un software autónomo inspirado en la agilidad de herramientas modernas (estilo *Treinta*), pero adaptado al marco fiscal, moneda (Guaraníes y Dólares) y requerimientos documentales oficiales. Al equipo le interesa este proyecto porque combina la resolución de un problema práctico de alto impacto para un cliente real (Estudio Contable CP. Arturo Arévalos, radicado en Yasy Cañy, Departamento de Canindeyú) con el dominio de un stack tecnológico corporativo contemporáneo y la resolución de un reto clave: permitir que el sistema funcione en la propia computadora del cliente con despliegue local de 1 solo clic y costo cero de infraestructura cloud.

---

## 3. Objetivos

### 3.1. Objetivo general
Desarrollar e implementar un sistema web local para la gestión de ingresos, egresos, conciliación de operaciones bancarias/contables y emisión correlativa de recibos oficiales en formato PDF, garantizando integridad transaccional, facilidad de uso y autonomía operativa para el usuario sin costos recurrentes de hosting.

### 3.2. Objetivos específicos
1. **Diseñar** una base de datos relacional normalizada en PostgreSQL que asegure la consistencia transaccional (ACID), auditoría mediante UUIDs y soporte para múltiples monedas (Guaraníes `GS` y Dólares `USD`).
2. **Implementar** una interfaz de usuario reactiva, intuitiva y accesible construida con React, TypeScript y Tailwind CSS, provista de un panel de control financiero en tiempo real (KPIs de caja, gráficos de flujo de fondos y desglose de gastos).
3. **Construir** una API REST robusta en Node.js y Express con módulos desacoplados para la administración de clientes/proveedores, libro diario y clasificación por rubros contables.
4. **Desarrollar** un motor de generación dinámica de documentos vectoriales en PDF (usando PDFKit) capaz de emitir recibos numerados correlativamente con montos expresados automáticamente en palabras y membrete corporativo legal.
5. **Programar** un módulo de Extracto de Cuenta y Operaciones que efectúe conciliaciones cronológicas con cálculo dinámico de Saldo Anterior (Apertura) y Saldo Acumulado (*Running Balance*).
6. **Empaquetar** la aplicación mediante scripts automatizados en Windows (`.bat` y PowerShell) que posibiliten la ejecución unificada del sistema en un único puerto, acceso directo de escritorio y respaldos periódicos con 1 solo clic.

---

## 4. Justificación y Análisis de Viabilidad

### 4.1. Justificación
Este proyecto reviste una alta importancia práctica y académica:
* **Aporte al usuario / cliente:** Elimina el gasto en talonarios físicos impresos, automatiza el cálculo de saldos en tiempo real, agiliza la entrega de comprobantes oficiales a los contribuyentes vía PDF y brinda trazabilidad total de cada guaraní que entra o sale del estudio.
* **Aporte al grupo y a la carrera:** Permite aplicar conceptos avanzados de ingeniería de software: modelado relacional riguroso, arquitectura cliente-servidor desacoplada, tipado estricto con TypeScript, seguridad transaccional, procesamiento de documentos binarios en backend y estrategias de despliegue *on-premise* sin servidor externo.

### 4.2. Viabilidad técnica
El grupo posee los fundamentos de programación, desarrollo web y bases de datos adquiridos en la carrera, complementados con la documentación técnica de las librerías empleadas.
* **Lenguaje unificado:** TypeScript en todo el ciclo de vida (Frontend y Backend), lo que reduce la carga cognitiva y previene inconsistencias de tipos.
* **Stack Tecnológico:**
  * Frontend: React 18, Vite 6, Tailwind CSS, Lucide Icons.
  * Backend: Node.js, Express, TypeScript, PDFKit, `pg` (node-postgres).
  * Base de datos: PostgreSQL 17 (extensión nativa `uuid-ossp`).
  * Despliegue: Express Static Server + Batch Scripts Windows.

### 4.3. Viabilidad de tiempo y recursos
El proyecto es completamente viable y ya cuenta con su arquitectura base y prototipo funcional completado dentro del calendario académico.
* **Recursos externos:** No se requieren servicios cloud de pago, servidores VPS externos ni APIs de terceros aranceladas.
* **Hardware:** Se ejecuta sobre hardware estándar de oficina (PC con Windows 10/11, 4 GB de RAM o superior y PostgreSQL instalado localmente).

### 4.4. Riesgos identificados

| Riesgo | Impacto | Mitigación propuesta |
| :--- | :--- | :--- |
| **Pérdida de datos por fallo físico en la PC del cliente** | **Alto** | Se desarrolló el script automatizado `respaldar_bd.bat`, que con un solo clic genera copias de seguridad de PostgreSQL con marca de tiempo en la carpeta `backups/`, listas para sincronizarse a un pendrive o unidad externa. |
| **Dificultad del usuario no técnico para encender el sistema** | **Medio** | Se unificó el frontend y backend en un único puerto (`4000`) y se crearon scripts de inicio (`iniciar_sistema.bat` y `crear_acceso_directo.bat`) que abren la aplicación en modo ventana limpia (Edge/Chrome `--app`) simulando un software de escritorio nativo. |
| **Fallas en la numeración correlativa de recibos por concurrencia** | **Alto** | Implementación de transacciones a nivel de base de datos y algoritmos de consulta de último correlativo formal (`001-001-XXXXXXX`) con estados inmutables y política de anulación controlada (*Void* con marca de agua). |
| **Desfasaje en cálculos de saldo al filtrar por fechas** | **Medio** | Algoritmo contable bancario que computa el Saldo Inicial considerando todas las operaciones previas a la fecha de inicio, sumando y restando débitos y créditos secuencialmente. |

---

## 5. Alcance y Limitaciones

### Qué incluye el proyecto (Entregables y Funcionalidades):
* **Dashboard Financiero:** Métricas clave (Ingresos, Egresos, Saldo en Caja), gráfico evolutivo de flujo de fondos y distribución de egresos por categoría.
* **Libro Diario Multidivisa:** Registro de operaciones clasificadas por Ingreso/Egreso, categoría, comprobante y medio de pago (Efectivo, Transferencia, Cheque, Tarjeta), en Guaraníes (`GS`) o Dólares (`USD`).
* **Directorio de Clientes y Proveedores:** Registro fiscal con RUC/Cédula, datos de contacto y estado de cuenta individual con desglose de transacciones.
* **Generación de Recibos Oficiales en PDF:** Emisión con numeración legal de 7 dígitos, conversión de cifras numéricas a texto formal en guaraníes/dólares, membrete corporativo y opciones de previsualización, descarga o anulación con marca de agua.
* **Extracto de Cuenta y Conciliación Bancaria:** Filtros avanzados por fecha, entidad, moneda y medio de pago, con cálculo de Saldo Anterior y Saldo Acumulado línea por línea, exportable a PDF con espacio para firmas.
* **Auto-configuración de Base de Datos:** Verificación y creación de base de datos, tablas e índices al inicializar la aplicación.
* **Suite de Scripts de Despliegue Local:** Instalación, creación de acceso directo en el escritorio y backups en 1 clic.

### Limitaciones (Fuera de alcance para este curso):
* Facturación electrónica directa integrada a los servidores en tiempo real de la DNIT/Sifen (se mantiene dentro del alcance de recibo oficial de dinero y control interno contable).
* Pasarela de pagos online con tarjetas de crédito en la nube (el registro es de cobros y pagos percibidos en el estudio).
* Autenticación multi-tenant SaaS con múltiples estudios contables independientes en la misma base de datos (diseñado como sistema mono-tenant dedicado para el cliente).

---

## 6. Áreas de Trabajo y Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA DEL SISTEMA                 │
└─────────────────────────────────────────────────────────────┘

       [ Navegador Web / Cliente Local (Modo App) ]
                            │
                      HTTP / REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│            Servidor Backend Unificado (Node.js/Express)     │
│                     Puerto: 4000                            │
├──────────────────────────────┬──────────────────────────────┤
│  Servicio de Archivos        │  Controladores REST (/api)   │
│  Estáticos (React Dist)      │  - Dashboard & KPIs          │
│                              │  - Transacciones (Libro D.)  │
│  Motor de Reportes PDFKit    │  - Clientes / Proveedores    │
│  - Recibos Oficiales         │  - Recibos & Numeración      │
│  - Extractos Bancarios       │  - Extracto de Cuenta        │
└──────────────┬───────────────┴──────────────┬───────────────┘
               │                              │
          Lectura Asset                  Pool Conexiones
         (Logos/Membrete)                 (node-postgres)
               │                              │
               ▼                              ▼
      [ Sistema Archivos ]         [ Motor PostgreSQL 17 ]
      (backups/, pdfs/, assets)    (BD 'contaduria' con UUIDs)
```

### División de áreas de trabajo:

| Área | Qué abarca en este proyecto | Responsable(s) |
| :--- | :--- | :--- |
| **Modelado y Base de Datos** | Diseño del diagrama entidad-relación, scripts DDL (`schema.sql`), triggers, constraints, funciones de inicialización y pooling con PostgreSQL. | Wilson Arévalos |
| **Arquitectura Backend & API** | Creación de endpoints Express, middleware, lógica contable de saldos, controladores y conversión de números a letras. | Wilson Arévalos |
| **Servicio de Documentación PDF** | Programación del layout vectorial con PDFKit, cálculo de coordenadas, inserción de membretes, paginación y sellos de anulación. | Wilson Arévalos |
| **Frontend & Experiencia de Usuario** | Componentes React, pantallas modales, filtrado dinámico, Tailwind CSS, maquetación del Extracto y visualización de comprobantes. | Wilson Arévalos / Areco |
| **QA, Pruebas y Despliegue** | Pruebas funcionales de libro diario, validación de extractos, confección de scripts `.bat` y documentación técnica del repositorio. | Wilson Arévalos / Areco |

---

## 7. Guía del Repositorio

### 7.1. Estructura de carpetas

```text
Contaduria/
├── backend/                  # Servidor API y lógica de negocio
│   ├── src/
│   │   ├── assets/           # Logotipos y banners oficiales para membrete
│   │   ├── config/           # Configuración de base de datos y datos del estudio
│   │   ├── controllers/      # Controladores de la API REST
│   │   ├── db/               # Esquema SQL (schema.sql), scripts de init y seed
│   │   ├── routes/           # Definición de rutas (/api)
│   │   ├── services/         # Generadores de PDF (recibos y extractos)
│   │   └── server.ts         # Punto de entrada del servidor Express unificado
│   ├── .env.example          # Plantilla de variables de entorno
│   ├── package.json          # Dependencias y scripts de backend
│   └── tsconfig.json         # Configuración del compilador TypeScript
├── frontend/                 # Interfaz de usuario (Single Page Application)
│   ├── public/               # Iconos y recursos estáticos
│   ├── src/
│   │   ├── api/              # Cliente HTTP para consumo de la API
│   │   ├── components/       # Componentes modulares (Dashboard, Libro Diario,
│   │   │                     # Extracto, Recibos, Entidades, Modales)
│   │   ├── types/            # Definiciones e interfaces TypeScript
│   │   ├── App.tsx           # Contenedor principal y enrutamiento
│   │   └── main.tsx          # Punto de montaje de React
│   ├── package.json          # Dependencias de frontend
│   ├── tailwind.config.js    # Configuración de estilos Tailwind
│   └── vite.config.ts        # Configuración de Vite
├── docs/                     # Documentación oficial del proyecto
│   └── DOCUMENTACION_PROYECTO.md
├── .gitignore                # Reglas de exclusión para Git
├── iniciar_sistema.bat       # Script lanzador del sistema en modo aplicación
├── crear_acceso_directo.bat  # Script para generar icono en el Escritorio
├── respaldar_bd.bat          # Script de backup automatizado de PostgreSQL
├── instalar_sistema.bat      # Script de instalación inicial desatendida
├── package.json              # Scripts raíz del workspace
└── README.md                 # Portada descriptiva del repositorio
```

### 7.2. Cómo clonar y ejecutar en desarrollo

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Wilsonarevalos04/Contaduria.git
   cd Contaduria
   ```

2. **Instalar dependencias:**
   ```bash
   npm run install:all
   ```

3. **Configurar la base de datos:**
   Crear el archivo `backend/.env` tomando como base `backend/.env.example`:
   ```env
   PORT=4000
   DATABASE_URL=postgresql://postgres:1234@localhost:5432/contaduria
   ADMIN_DB_URL=postgresql://postgres:1234@localhost:5432/postgres
   ```

4. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```
   * Frontend: `http://localhost:5173`
   * Backend API: `http://localhost:4000`

5. **Compilar y ejecutar en modo producción local unificado:**
   ```bash
   npm run build
   npm run start
   ```
   * Aplicación completa en: `http://localhost:4000`

### 7.3. Convención de ramas y commits
* **Rama principal:** `main` (código estable probado y listo para entrega).
* **Ramas de funcionalidad:** `feature/<nombre-funcionalidad>` o `fix/<nombre-arreglo>`.
* **Convención de commits:** Basada en *Conventional Commits*:
  * `feat:` Nueva funcionalidad añadida.
  * `fix:` Corrección de errores.
  * `docs:` Cambios o adiciones en la documentación.
  * `refactor:` Optimización del código sin alterar su comportamiento.
  * `chore:` Ajustes en configuración, dependencias o scripts auxiliares.

---

## 8. Bitácora de Avances por Clase

| Clase / Fecha | Actividad realizada | Área | Responsable(s) | Commit / enlace | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Clase 1**<br>*(11/09/2026)* | Relevamiento de requerimientos con el cliente. Definición del modelo de datos inicial (tablas `users`, `entities`, `categories`, `transactions`). Creación del backend base en Express. | Base de Datos / Backend | Wilson Arévalos | `53e621f` | Completo |
| **Clase 2**<br>*(17/09/2026)* | Implementación del Libro Diario interactivo en React + Tailwind. Soporte de operaciones de Ingreso y Egreso en Guaraníes y Dólares. | Frontend | Wilson Arévalos | `53e621f` | Completo |
| **Clase 3**<br>*(18/09/2026)* | Desarrollo del módulo de Recibos Oficiales con PDFKit: membrete oficial con logotipo, numeración correlativa y algoritmo conversor de números a letras. | Backend / PDF | Wilson Arévalos | `53e621f` | Completo |
| **Clase 4**<br>*(26/09/2026)* | Creación del Dashboard con KPIs y gráficos de flujo de fondos. Desarrollo de la arquitectura de servidor unificado (Express sirve React en producción) y scripts `.bat`. | Arquitectura / Despliegue | Wilson Arévalos | `53e621f` | Completo |
| **Clase 5**<br>*(26/09/2026)* | Implementación completa del módulo de Extracto de Operaciones y Estado de Cuenta Bancario: cálculo de saldo anterior, saldo acumulado y descarga de PDF formal. | Fullstack / PDF | Wilson Arévalos | `53e621f` | Completo |
| **Clase 6**<br>*(09/11/2026)* | Configuración del repositorio en GitHub, resolución de credenciales, subida de la rama `main` y adición del colaborador `@Areco-Github`. | DevOps / Git | Wilson Arévalos | `fe3982f` | Completo |
| **Clase 7**<br>*(09/11/2026)* | Redacción y estructuración de la Documentación Oficial de Proyecto Tecnológico y preparación de la entrega. | Documentación | Wilson Arévalos / Areco | `docs/` | Completo |

---

## 9. Cronograma Tentativo

| Etapa | Semana / Clase estimada | Entregable asociado |
| :--- | :--- | :--- |
| **Etapa 1: Investigación y Relevamiento** | Semanas 1 a 2 | Documento de requerimientos, diseño del modelo entidad-relación y repositorio inicial. |
| **Etapa 2: Desarrollo del Core Contable** | Semanas 3 a 5 | API REST funcional, esquema PostgreSQL aplicado y Libro Diario operativo en frontend. |
| **Etapa 3: Motor de Recibos y Reportes** | Semanas 6 a 7 | Generador de PDFs con membrete legal, numeración correlativa y anulación con marca de agua. |
| **Etapa 4: Extracto Bancario y Conciliación** | Semanas 8 a 9 | Pantalla de extracto con filtros, saldo de apertura, saldo corriente y exportación en PDF. |
| **Etapa 5: Empaquetado y Pruebas Locales** | Semanas 10 a 11 | Scripts de despliegue local de 1 solo clic (`.bat`), backups automáticos y pruebas de usuario. |
| **Etapa 6: Entrega Final y Defensa** | Semanas 12 a 14 | Repositorio documentado en GitHub, manual técnico, presentación en vivo y entrega final integradora. |

---

## 10. Referencias

* **Facebook Open Source.** (2024). *React: A JavaScript library for building user interfaces* (v18.3). https://react.dev/
* **Node.js Foundation.** (2024). *Node.js v22 Documentation*. https://nodejs.org/docs/
* **PostgreSQL Global Development Group.** (2024). *PostgreSQL 17.0 Documentation*. https://www.postgresql.org/docs/17/
* **StrongLoop / Express Community.** (2024). *Express 4.x - Fast, unopinionated, minimalist web framework for Node.js*. https://expressjs.com/
* **Tailwind Labs.** (2024). *Tailwind CSS Documentation (v3.4)*. https://tailwindcss.com/docs
* **Vite Team.** (2024). *Vite: Next Generation Frontend Tooling*. https://vitejs.dev/
* **Follett, D. [devongovett].** (2024). *PDFKit: A JavaScript PDF generation library for Node and the browser*. https://pdfkit.org/
* **Brianc.** (2024). *node-postgres (pg): Non-blocking PostgreSQL client for Node.js*. https://node-postgres.com/

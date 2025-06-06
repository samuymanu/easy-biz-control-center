
# Sistema Administrativo de Escritorio

Sistema completo de gestión administrativo para Windows desarrollado con React + Electron (frontend) y Node.js + SQLite (backend).

## 🚀 Características

### Módulos Principales
- **Dashboard**: Panel de control con KPIs y gráficos en tiempo real
- **Gestión de Inventario**: Control completo de productos, stock y movimientos
- **Gestión de Ventas**: Procesamiento de pedidos y gestión de clientes
- **Reportes y Análisis**: Gráficos detallados y exportación de reportes
- **Configuración**: Administración de usuarios y configuraciones del sistema

### Tecnologías
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + SQLite
- **Gráficos**: Recharts
- **Base de Datos**: SQLite (archivo local)

## 📦 Instalación y Configuración

### Requisitos Previos
- Node.js 16 o superior
- npm o yarn

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd sistema-administrativo
```

### 2. Configurar el Backend
```bash
cd backend
npm install
npm run init-db  # Inicializar base de datos SQLite
npm run dev      # Iniciar servidor en modo desarrollo
```

El backend se ejecutará en `http://localhost:3001`

### 3. Configurar el Frontend
```bash
# En otra terminal, desde la raíz del proyecto
npm install
npm run dev      # Iniciar aplicación React
```

El frontend se ejecutará en `http://localhost:8080`

## 🗄️ Base de Datos

### Estructura de la Base de Datos SQLite
- **users**: Usuarios del sistema
- **products**: Productos del inventario
- **categories**: Categorías de productos
- **suppliers**: Proveedores
- **customers**: Clientes
- **sales**: Ventas realizadas
- **sale_details**: Detalles de cada venta
- **inventory_movements**: Movimientos de stock
- **system_config**: Configuraciones del sistema

### Ubicación de la Base de Datos
- **Archivo**: `backend/database/sistema.db`
- **Schema**: `src/database/schema.sql`

## 🔐 Autenticación

### Credenciales por Defecto
- **Usuario**: admin
- **Contraseña**: admin

## 🌐 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión

### Productos
- `GET /api/products` - Listar productos
- `POST /api/products` - Crear producto
- `PUT /api/products/:id` - Actualizar producto

### Clientes
- `GET /api/customers` - Listar clientes
- `POST /api/customers` - Crear cliente

### Ventas
- `GET /api/sales` - Listar ventas
- `POST /api/sales` - Crear venta

### Inventario
- `POST /api/inventory/movement` - Registrar movimiento de stock

### Dashboard
- `GET /api/dashboard/stats` - Estadísticas del dashboard

## 🔧 Configuración para Producción

### 1. Variables de Entorno
Crear archivo `.env` en el directorio backend:
```env
PORT=3001
NODE_ENV=production
DB_PATH=./database/sistema.db
```

### 2. Construcción para Producción
```bash
# Frontend
npm run build

# Backend
cd backend
npm start
```

### 3. Deployment en Red LAN

#### Configuración del Servidor (PC Principal)
1. Instalar Node.js en la PC servidor
2. Copiar el directorio `backend` a la PC servidor
3. Ejecutar `npm install` y `npm start`
4. Configurar firewall para permitir puerto 3001
5. Obtener IP local de la PC servidor

#### Configuración de Clientes
1. Actualizar la URL del API en el frontend para apuntar a la IP del servidor
2. Distribuir la aplicación Electron a las PCs cliente

## 📊 Funcionalidades Detalladas

### Dashboard
- KPIs de ventas mensuales
- Valor total del inventario
- Alertas de stock bajo
- Gráficos de tendencias de ventas
- Top productos más vendidos

### Inventario
- Alta/baja/modificación de productos
- Control de stock en tiempo real
- Gestión de categorías y proveedores
- Movimientos de entrada y salida
- Alertas de reabastecimiento

### Ventas
- Procesamiento de pedidos
- Gestión de clientes
- Múltiples métodos de pago
- Cálculo automático de impuestos
- Historial de transacciones

### Reportes
- Reportes de ventas por período
- Análisis de inventario
- Top clientes
- Exportación a PDF y CSV
- Gráficos interactivos

## 🛠️ Desarrollo

### Estructura del Proyecto
```
sistema-administrativo/
├── src/                    # Frontend React
│   ├── components/        # Componentes React
│   ├── pages/            # Páginas principales
│   ├── database/         # Schema de BD
│   └── ...
├── backend/              # Backend Node.js
│   ├── server.js        # Servidor principal
│   ├── database/        # Archivos SQLite
│   └── scripts/         # Scripts de utilidad
└── README.md
```

### Scripts Disponibles
```bash
# Frontend
npm run dev          # Desarrollo
npm run build        # Construcción
npm run preview      # Vista previa

# Backend
npm run dev          # Desarrollo con nodemon
npm start            # Producción
npm run init-db      # Inicializar BD
```

## 🔄 Funcionalidades Futuras (Roadmap)

- [ ] Integración con código de barras
- [ ] Módulo de compras a proveedores
- [ ] Sistema de roles y permisos avanzado
- [ ] Reportes avanzados con filtros personalizados
- [ ] Backup automático de base de datos
- [ ] Integración con impresoras de tickets
- [ ] API para integración con sistemas externos
- [ ] Módulo de contabilidad básica

## 📞 Soporte

Para soporte técnico o consultas sobre el sistema, contactar al equipo de desarrollo.

---

**Sistema Administrativo v1.0** - Desarrollado para gestión empresarial eficiente

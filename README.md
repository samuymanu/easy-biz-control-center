
# Sistema Administrativo de Escritorio

Sistema administrativo completo desarrollado con React + Vite (frontend), Node.js + SQLite (backend) y Electron (aplicación de escritorio). Diseñado para gestión de inventario, ventas, reportes y configuración empresarial.

## 🚀 Características

### Módulos Principales
- **Dashboard**: Panel de control con métricas en tiempo real
- **Inventario**: Gestión completa de productos, stock y movimientos
- **Ventas**: Procesamiento de ventas y gestión de clientes
- **Reportes**: Análisis y reportes con gráficos interactivos
- **Configuración**: Administración de usuarios, configuración del sistema y respaldos

### Tecnologías
- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Node.js, Express, SQLite
- **Desktop**: Electron
- **Gráficos**: Recharts
- **Autenticación**: JWT

## 📋 Requisitos del Sistema

- Node.js 16 o superior
- npm o yarn
- Sistema operativo: Windows, macOS o Linux

## 🛠️ Instalación y Configuración

### 1. Clonar e Instalar Dependencias

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd sistema-administrativo

# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd backend
npm install
cd ..
```

### 2. Configurar Base de Datos

```bash
# Desde la carpeta backend, inicializar la base de datos
cd backend
npm run init-db
cd ..
```

### 3. Modo Desarrollo

#### Opción A: Desarrollo Web (Recomendado para desarrollo)

```bash
# Terminal 1: Iniciar backend
cd backend
npm run dev

# Terminal 2: Iniciar frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

#### Opción B: Desarrollo con Electron

```bash
# Terminal 1: Iniciar backend
cd backend
npm start

# Terminal 2: Iniciar frontend
npm run dev

# Terminal 3: Iniciar Electron (después de que el frontend esté corriendo)
npm run electron-dev
```

### 4. Construcción para Producción

```bash
# Construir la aplicación web
npm run build

# Para construir la aplicación de escritorio (requiere dependencias adicionales)
npm install electron electron-builder --save-dev
npm run build-electron
```

## 👤 Credenciales por Defecto

- **Usuario**: admin
- **Contraseña**: admin

## 🗄️ Estructura de la Base de Datos

La base de datos SQLite incluye las siguientes tablas principales:

- `users` - Usuarios del sistema
- `products` - Productos del inventario
- `categories` - Categorías de productos
- `suppliers` - Proveedores
- `customers` - Clientes
- `sales` - Registro de ventas
- `sale_details` - Detalles de las ventas
- `inventory_movements` - Movimientos de inventario
- `system_config` - Configuración del sistema

## 🔧 API Backend

El servidor backend expone las siguientes rutas principales:

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario (admin)

### Productos
- `GET /api/products` - Listar productos
- `POST /api/products` - Crear producto
- `PUT /api/products/:id` - Actualizar producto

### Ventas
- `GET /api/sales` - Listar ventas
- `POST /api/sales` - Crear venta

### Clientes
- `GET /api/customers` - Listar clientes
- `POST /api/customers` - Crear cliente

### Reportes
- `GET /api/reports/sales` - Reporte de ventas
- `GET /api/reports/products` - Reporte de productos
- `GET /api/dashboard/stats` - Estadísticas del dashboard

### Configuración
- `GET /api/config` - Obtener configuración
- `POST /api/config` - Guardar configuración

### Respaldos
- `POST /api/backup/create` - Crear respaldo
- `GET /api/backup/list` - Listar respaldos

## 🚀 Funcionalidades Principales

### Gestión de Inventario
- ✅ CRUD completo de productos
- ✅ Control de stock en tiempo real
- ✅ Alertas de stock bajo
- ✅ Movimientos de inventario
- ✅ Categorías y proveedores

### Gestión de Ventas
- ✅ Procesamiento de ventas
- ✅ Gestión de clientes
- ✅ Múltiples métodos de pago
- ✅ Historial de transacciones

### Reportes y Análisis
- ✅ Dashboard con métricas en tiempo real
- ✅ Gráficos interactivos
- ✅ Reportes por período
- ✅ Exportación a CSV
- ✅ Análisis de inventario

### Configuración del Sistema
- ✅ Gestión de usuarios
- ✅ Configuración general
- ✅ Respaldos automáticos
- ✅ Configuración de impuestos

## 🔒 Seguridad

- Autenticación JWT
- Encriptación de contraseñas con bcrypt
- Validación de datos en backend
- Control de acceso por roles
- Tokens con expiración

## 🌐 Red LAN

El sistema está diseñado para funcionar en red LAN:

1. **Servidor**: Ejecutar el backend en una PC central
2. **Clientes**: Conectar múltiples clientes a la IP del servidor
3. **Configuración**: Cambiar la URL de la API en el frontend para apuntar a la IP del servidor

### Configuración para Red LAN

En el archivo `src/hooks/useApi.ts`, cambiar:
```typescript
const API_BASE_URL = 'http://[IP-DEL-SERVIDOR]:3001/api';
```

## 📝 Próximas Características

- [ ] Facturación electrónica
- [ ] Integración con códigos de barras
- [ ] Módulo de compras
- [ ] Notificaciones push
- [ ] Sincronización en la nube
- [ ] Aplicación móvil

## 🛠️ Desarrollo

### Scripts Disponibles

```bash
# Frontend
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción
npm run preview      # Vista previa de producción

# Backend
npm start            # Iniciar servidor
npm run dev          # Servidor con nodemon
npm run init-db      # Inicializar base de datos

# Electron
npm run electron-dev # Desarrollo con Electron
npm run build-electron # Construir aplicación de escritorio
```

### Estructura del Proyecto

```
sistema-administrativo/
├── src/                    # Frontend React
│   ├── components/         # Componentes React
│   ├── hooks/             # Hooks personalizados
│   ├── pages/             # Páginas principales
│   └── database/          # Schema de base de datos
├── backend/               # Servidor Node.js
│   ├── database/          # Base de datos SQLite
│   ├── scripts/           # Scripts de utilidad
│   └── server.js          # Servidor principal
├── public/                # Archivos estáticos
└── package.json           # Dependencias del proyecto
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para la funcionalidad
3. Commit los cambios
4. Push a la rama
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 📞 Soporte

Para soporte técnico o consultas:
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo

---

**Nota**: Este sistema está diseñado para uso empresarial interno. Asegúrese de configurar adecuadamente la seguridad antes de usar en producción.

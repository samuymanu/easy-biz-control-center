const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'sistema-admin-secret-key-2024';

// Middleware
app.use(cors());
app.use(express.json());

// Crear directorio de base de datos si no existe
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Configuración de base de datos SQLite
const dbPath = path.join(dbDir, 'sistema.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
    } else {
        console.log('Conectado a la base de datos SQLite');
        initializeDatabase();
    }
});

// Middleware para verificar JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' });
        }
        req.user = user;
        next();
    });
};

// Inicializar base de datos con el schema
function initializeDatabase() {
    const schemaPath = path.join(__dirname, '..', 'src', 'database', 'schema.sql');
    
    try {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
        
        db.serialize(() => {
            statements.forEach((statement, index) => {
                db.run(statement, (err) => {
                    if (err) {
                        console.error(`Error ejecutando statement ${index + 1}:`, err);
                    } else {
                        console.log(`Statement ${index + 1} ejecutado correctamente`);
                    }
                });
            });
            
            // Crear usuario admin por defecto después de que las tablas estén creadas
            setTimeout(() => {
                createDefaultAdmin();
            }, 1000);
        });
        
        console.log('Base de datos inicializada correctamente');
    } catch (error) {
        console.error('Error leyendo el archivo schema.sql:', error);
    }
}

// Función para crear el usuario admin por defecto
function createDefaultAdmin() {
    // Primero verificar si ya existe un usuario admin
    db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, row) => {
        if (err) {
            console.error('Error verificando usuario admin:', err);
            return;
        }
        
        if (!row) {
            // No existe, crear el usuario admin
            const hashedPassword = bcrypt.hashSync('admin', 10);
            db.run(
                'INSERT INTO users (username, password_hash, email, full_name, role) VALUES (?, ?, ?, ?, ?)',
                ['admin', hashedPassword, 'admin@sistema.com', 'Administrador', 'admin'],
                function(err) {
                    if (err) {
                        console.error('Error creando usuario admin:', err);
                    } else {
                        console.log('✓ Usuario administrador creado correctamente');
                        console.log('  Usuario: admin');
                        console.log('  Contraseña: admin');
                    }
                }
            );
        } else {
            console.log('✓ Usuario administrador ya existe');
            console.log('  Usuario: admin');
            console.log('  Contraseña: admin');
        }
    });
}

// AUTH ROUTES
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    db.get(
        'SELECT * FROM users WHERE username = ? AND is_active = 1',
        [username],
        (err, row) => {
            if (err) {
                res.status(500).json({ error: 'Error interno del servidor' });
                return;
            }
            
            if (row && bcrypt.compareSync(password, row.password_hash)) {
                const token = jwt.sign(
                    { id: row.id, username: row.username, role: row.role },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );
                
                res.json({
                    success: true,
                    token,
                    user: {
                        id: row.id,
                        username: row.username,
                        email: row.email,
                        fullName: row.full_name,
                        role: row.role
                    }
                });
            } else {
                res.status(401).json({ error: 'Credenciales inválidas' });
            }
        }
    );
});

app.post('/api/auth/register', authenticateToken, (req, res) => {
    const { username, password, email, fullName, role } = req.body;
    
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Permisos insuficientes' });
    }
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    db.run(
        'INSERT INTO users (username, password_hash, email, full_name, role) VALUES (?, ?, ?, ?, ?)',
        [username, hashedPassword, email, fullName, role || 'user'],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    res.status(400).json({ error: 'Usuario o email ya existe' });
                } else {
                    res.status(500).json({ error: 'Error al crear usuario' });
                }
                return;
            }
            res.json({ id: this.lastID, message: 'Usuario creado correctamente' });
        }
    );
});

// USERS ROUTES
app.get('/api/users', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Permisos insuficientes' });
    }
    
    db.all(
        'SELECT id, username, email, full_name, role, is_active, created_at FROM users ORDER BY created_at DESC',
        [],
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: 'Error al obtener usuarios' });
                return;
            }
            res.json(rows);
        }
    );
});

app.put('/api/users/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Permisos insuficientes' });
    }
    
    const { id } = req.params;
    const { username, email, fullName, role, isActive } = req.body;
    
    db.run(
        'UPDATE users SET username = ?, email = ?, full_name = ?, role = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [username, email, fullName, role, isActive, id],
        function(err) {
            if (err) {
                res.status(500).json({ error: 'Error al actualizar usuario' });
                return;
            }
            res.json({ message: 'Usuario actualizado correctamente' });
        }
    );
});

app.delete('/api/users/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Permisos insuficientes' });
    }
    
    const { id } = req.params;
    
    db.run(
        'UPDATE users SET is_active = 0 WHERE id = ?',
        [id],
        function(err) {
            if (err) {
                res.status(500).json({ error: 'Error al eliminar usuario' });
                return;
            }
            res.json({ message: 'Usuario eliminado correctamente' });
        }
    );
});

// PRODUCTS ROUTES
app.get('/api/products', authenticateToken, (req, res) => {
    const query = `
        SELECT p.*, c.name as category_name, s.name as supplier_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE p.is_active = 1
        ORDER BY p.created_at DESC
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Error al obtener productos' });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    const {
        sku, name, description, category_id, supplier_id,
        cost_price, sale_price, current_stock, minimum_stock
    } = req.body;
    
    const query = `
        INSERT INTO products (
            sku, name, description, category_id, supplier_id,
            cost_price, sale_price, current_stock, minimum_stock
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(query, [
        sku, name, description, category_id, supplier_id,
        cost_price, sale_price, current_stock, minimum_stock
    ], function(err) {
        if (err) {
            res.status(500).json({ error: 'Error al crear producto' });
            return;
        }
        res.status(201).json({ message: 'Producto creado correctamente' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

app.put('/api/products/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const {
        sku, name, description, category_id, supplier_id,
        cost_price, sale_price, current_stock, minimum_stock
    } = req.body;
    
    const query = `
        UPDATE products SET
            sku = ?, name = ?, description = ?, category_id = ?, supplier_id = ?,
            cost_price = ?, sale_price = ?, current_stock = ?, minimum_stock = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    
    db.run(query, [
        sku, name, description, category_id, supplier_id,
        cost_price, sale_price, current_stock, minimum_stock, id
    ], function(err) {
        if (err) {
            res.status(500).json({ error: 'Error al actualizar producto' });
            return;
        }
        res.json({ message: 'Producto actualizado correctamente' });
    });
});

// CUSTOMERS ROUTES
app.get('/api/customers', authenticateToken, (req, res) => {
    db.all(
        'SELECT * FROM customers WHERE is_active = 1 ORDER BY created_at DESC',
        [],
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: 'Error al obtener clientes' });
                return;
            }
            res.json(rows);
        }
    );
});

app.post('/api/customers', authenticateToken, (req, res) => {
    const { name, email, phone, address, tax_id } = req.body;
    
    db.run(
        'INSERT INTO customers (name, email, phone, address, tax_id) VALUES (?, ?, ?, ?, ?)',
        [name, email, phone, address, tax_id],
        function(err) {
            if (err) {
                res.status(500).json({ error: 'Error al crear cliente' });
                return;
            }
            res.json({ id: this.lastID, message: 'Cliente creado correctamente' });
        }
    );
});

// SALES ROUTES
app.get('/api/sales', authenticateToken, (req, res) => {
    const query = `
        SELECT s.*, c.name as customer_name
        FROM sales s
        LEFT JOIN customers c ON s.customer_id = c.id
        ORDER BY s.created_at DESC
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Error al obtener ventas' });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/sales', authenticateToken, (req, res) => {
    const {
        customer_id, subtotal, tax_amount, total_amount,
        payment_method, items
    } = req.body;
    
    const sale_number = `SALE-${Date.now()}`;
    
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        db.run(
            `INSERT INTO sales (
                sale_number, customer_id, sale_date, subtotal,
                tax_amount, total_amount, payment_method, user_id
            ) VALUES (?, ?, DATE('now'), ?, ?, ?, ?, ?)`,
            [sale_number, customer_id, subtotal, tax_amount, total_amount, payment_method, req.user.id],
            function(err) {
                if (err) {
                    db.run('ROLLBACK');
                    res.status(500).json({ error: 'Error al crear venta' });
                    return;
                }
                
                const sale_id = this.lastID;
                
                const stmt = db.prepare(`
                    INSERT INTO sale_details (sale_id, product_id, quantity, unit_price, line_total)
                    VALUES (?, ?, ?, ?, ?)
                `);
                
                items.forEach(item => {
                    stmt.run([sale_id, item.product_id, item.quantity, item.unit_price, item.line_total]);
                });
                
                stmt.finalize();
                
                db.run('COMMIT', (err) => {
                    if (err) {
                        res.status(500).json({ error: 'Error al finalizar venta' });
                    } else {
                        res.json({ id: sale_id, sale_number, message: 'Venta creada correctamente' });
                    }
                });
            }
        );
    });
});

// INVENTORY MOVEMENTS ROUTES
app.get('/api/inventory/movements', authenticateToken, (req, res) => {
    const query = `
        SELECT im.*, p.name as product_name, u.username
        FROM inventory_movements im
        LEFT JOIN products p ON im.product_id = p.id
        LEFT JOIN users u ON im.user_id = u.id
        ORDER BY im.created_at DESC
        LIMIT 100
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Error al obtener movimientos' });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/inventory/movement', authenticateToken, (req, res) => {
    const { product_id, movement_type, quantity, reason } = req.body;
    
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        db.run(
            `INSERT INTO inventory_movements (
                product_id, movement_type, quantity, reason, user_id
            ) VALUES (?, ?, ?, ?, ?)`,
            [product_id, movement_type, quantity, reason, req.user.id],
            function(err) {
                if (err) {
                    db.run('ROLLBACK');
                    res.status(500).json({ error: 'Error al registrar movimiento' });
                    return;
                }
                
                const stockChange = movement_type === 'entrada' ? quantity : -quantity;
                
                db.run(
                    'UPDATE products SET current_stock = current_stock + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [stockChange, product_id],
                    function(err) {
                        if (err) {
                            db.run('ROLLBACK');
                            res.status(500).json({ error: 'Error al actualizar stock' });
                        } else {
                            db.run('COMMIT');
                            res.json({ message: 'Movimiento registrado correctamente' });
                        }
                    }
                );
            }
        );
    });
});

// CATEGORIES ROUTES
app.get('/api/categories', authenticateToken, (req, res) => {
    db.all('SELECT * FROM categories ORDER BY name', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Error al obtener categorías' });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/categories', authenticateToken, (req, res) => {
    const { name, description } = req.body;
    
    db.run(
        'INSERT INTO categories (name, description) VALUES (?, ?)',
        [name, description],
        function(err) {
            if (err) {
                res.status(500).json({ error: 'Error al crear categoría' });
                return;
            }
            res.json({ id: this.lastID, message: 'Categoría creada correctamente' });
        }
    );
});

// SUPPLIERS ROUTES
app.get('/api/suppliers', authenticateToken, (req, res) => {
    db.all(
        'SELECT * FROM suppliers WHERE is_active = 1 ORDER BY name',
        [],
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: 'Error al obtener proveedores' });
                return;
            }
            res.json(rows);
        }
    );
});

app.post('/api/suppliers', authenticateToken, (req, res) => {
    const { name, contact_person, email, phone, address, tax_id } = req.body;
    
    db.run(
        'INSERT INTO suppliers (name, contact_person, email, phone, address, tax_id) VALUES (?, ?, ?, ?, ?, ?)',
        [name, contact_person, email, phone, address, tax_id],
        function(err) {
            if (err) {
                res.status(500).json({ error: 'Error al crear proveedor' });
                return;
            }
            res.json({ id: this.lastID, message: 'Proveedor creado correctamente' });
        }
    );
});

// SYSTEM CONFIG ROUTES
app.get('/api/config', authenticateToken, (req, res) => {
    db.all('SELECT * FROM system_config', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Error al obtener configuración' });
            return;
        }
        
        const config = {};
        rows.forEach(row => {
            config[row.config_key] = row.config_value;
        });
        
        res.json(config);
    });
});

app.post('/api/config', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Permisos insuficientes' });
    }
    
    const { config_key, config_value } = req.body;
    
    db.run(
        'INSERT OR REPLACE INTO system_config (config_key, config_value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
        [config_key, config_value],
        function(err) {
            if (err) {
                res.status(500).json({ error: 'Error al guardar configuración' });
                return;
            }
            res.json({ message: 'Configuración guardada correctamente' });
        }
    );
});

// REPORTS ROUTES
app.get('/api/reports/sales', authenticateToken, (req, res) => {
    const { from_date, to_date } = req.query;
    
    let query = `
        SELECT 
            DATE(s.sale_date) as date,
            SUM(s.total_amount) as total_sales,
            COUNT(*) as sales_count
        FROM sales s
        WHERE 1=1
    `;
    
    const params = [];
    
    if (from_date) {
        query += ' AND s.sale_date >= ?';
        params.push(from_date);
    }
    
    if (to_date) {
        query += ' AND s.sale_date <= ?';
        params.push(to_date);
    }
    
    query += ' GROUP BY DATE(s.sale_date) ORDER BY s.sale_date DESC';
    
    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Error al generar reporte de ventas' });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/reports/products', authenticateToken, (req, res) => {
    const query = `
        SELECT 
            p.name,
            p.current_stock,
            p.minimum_stock,
            p.cost_price * p.current_stock as stock_value,
            CASE 
                WHEN p.current_stock <= p.minimum_stock THEN 'Bajo'
                WHEN p.current_stock <= p.minimum_stock * 1.5 THEN 'Medio'
                ELSE 'Normal'
            END as stock_status
        FROM products p
        WHERE p.is_active = 1
        ORDER BY p.current_stock ASC
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Error al generar reporte de productos' });
            return;
        }
        res.json(rows);
    });
});

// BACKUP ROUTES
app.post('/api/backup/create', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Permisos insuficientes' });
    }
    
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup-${timestamp}.db`);
    
    try {
        fs.copyFileSync(dbPath, backupPath);
        res.json({ message: 'Respaldo creado correctamente', backup_file: `backup-${timestamp}.db` });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear respaldo' });
    }
});

app.get('/api/backup/list', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Permisos insuficientes' });
    }
    
    const backupDir = path.join(__dirname, 'backups');
    
    if (!fs.existsSync(backupDir)) {
        return res.json([]);
    }
    
    try {
        const files = fs.readdirSync(backupDir)
            .filter(file => file.endsWith('.db'))
            .map(file => {
                const stats = fs.statSync(path.join(backupDir, file));
                return {
                    filename: file,
                    created_at: stats.birthtime,
                    size: stats.size
                };
            })
            .sort((a, b) => b.created_at - a.created_at);
        
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: 'Error al listar respaldos' });
    }
});

// DASHBOARD STATS
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
    const stats = {};
    let completedQueries = 0;
    const totalQueries = 4;
    
    const sendResponse = () => {
        completedQueries++;
        if (completedQueries === totalQueries) {
            res.json(stats);
        }
    };
    
    // Ventas del mes
    db.get(
        `SELECT SUM(total_amount) as monthly_sales, COUNT(*) as sales_count
         FROM sales WHERE strftime('%Y-%m', sale_date) = strftime('%Y-%m', 'now')`,
        [],
        (err, row) => {
            if (!err) {
                stats.monthly_sales = row.monthly_sales || 0;
                stats.sales_count = row.sales_count || 0;
            }
            sendResponse();
        }
    );
    
    // Total productos en stock
    db.get(
        'SELECT SUM(current_stock) as total_stock, COUNT(*) as product_count FROM products WHERE is_active = 1',
        [],
        (err, row) => {
            if (!err) {
                stats.total_stock = row.total_stock || 0;
                stats.product_count = row.product_count || 0;
            }
            sendResponse();
        }
    );
    
    // Valor del inventario
    db.get(
        'SELECT SUM(current_stock * cost_price) as inventory_value FROM products WHERE is_active = 1',
        [],
        (err, row) => {
            if (!err) {
                stats.inventory_value = row.inventory_value || 0;
            }
            sendResponse();
        }
    );
    
    // Productos con stock bajo
    db.get(
        'SELECT COUNT(*) as low_stock_count FROM products WHERE current_stock <= minimum_stock AND is_active = 1',
        [],
        (err, row) => {
            if (!err) {
                stats.low_stock_count = row.low_stock_count || 0;
            }
            sendResponse();
        }
    );
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        database: 'Connected',
        version: '1.0.0'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor backend ejecutándose en puerto ${PORT}`);
    console.log(`Base de datos SQLite ubicada en: ${dbPath}`);
    console.log(`API disponible en: http://localhost:${PORT}/api`);
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
    console.log('\nCerrando servidor...');
    db.close((err) => {
        if (err) {
            console.error('Error al cerrar la base de datos:', err);
        } else {
            console.log('Base de datos cerrada correctamente');
        }
        process.exit(0);
    });
});

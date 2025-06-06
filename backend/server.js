
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

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

// Inicializar base de datos con el schema
function initializeDatabase() {
    const schemaPath = path.join(__dirname, '..', 'src', 'database', 'schema.sql');
    
    try {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        // Dividir el schema en declaraciones individuales
        const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
        
        statements.forEach((statement, index) => {
            db.run(statement, (err) => {
                if (err) {
                    console.error(`Error ejecutando statement ${index + 1}:`, err);
                } else {
                    console.log(`Statement ${index + 1} ejecutado correctamente`);
                }
            });
        });
        
        console.log('Base de datos inicializada correctamente');
    } catch (error) {
        console.error('Error leyendo el archivo schema.sql:', error);
    }
}

// Rutas de API

// AUTH ROUTES
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    db.get(
        'SELECT * FROM users WHERE username = ? AND password_hash = ? AND is_active = 1',
        [username, password],
        (err, row) => {
            if (err) {
                res.status(500).json({ error: 'Error interno del servidor' });
                return;
            }
            
            if (row) {
                res.json({
                    success: true,
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

// PRODUCTS ROUTES
app.get('/api/products', (req, res) => {
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

app.post('/api/products', (req, res) => {
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
        res.json({ id: this.lastID, message: 'Producto creado correctamente' });
    });
});

app.put('/api/products/:id', (req, res) => {
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
app.get('/api/customers', (req, res) => {
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

app.post('/api/customers', (req, res) => {
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
app.get('/api/sales', (req, res) => {
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

app.post('/api/sales', (req, res) => {
    const {
        customer_id, subtotal, tax_amount, total_amount,
        payment_method, items
    } = req.body;
    
    // Generar número de venta
    const sale_number = `SALE-${Date.now()}`;
    
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // Insertar venta
        db.run(
            `INSERT INTO sales (
                sale_number, customer_id, sale_date, subtotal,
                tax_amount, total_amount, payment_method
            ) VALUES (?, ?, DATE('now'), ?, ?, ?, ?)`,
            [sale_number, customer_id, subtotal, tax_amount, total_amount, payment_method],
            function(err) {
                if (err) {
                    db.run('ROLLBACK');
                    res.status(500).json({ error: 'Error al crear venta' });
                    return;
                }
                
                const sale_id = this.lastID;
                
                // Insertar detalles de venta
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
app.post('/api/inventory/movement', (req, res) => {
    const { product_id, movement_type, quantity, reason, user_id } = req.body;
    
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // Insertar movimiento
        db.run(
            `INSERT INTO inventory_movements (
                product_id, movement_type, quantity, reason, user_id
            ) VALUES (?, ?, ?, ?, ?)`,
            [product_id, movement_type, quantity, reason, user_id],
            function(err) {
                if (err) {
                    db.run('ROLLBACK');
                    res.status(500).json({ error: 'Error al registrar movimiento' });
                    return;
                }
                
                // Actualizar stock del producto
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
app.get('/api/categories', (req, res) => {
    db.all('SELECT * FROM categories ORDER BY name', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Error al obtener categorías' });
            return;
        }
        res.json(rows);
    });
});

// SUPPLIERS ROUTES
app.get('/api/suppliers', (req, res) => {
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

// DASHBOARD STATS
app.get('/api/dashboard/stats', (req, res) => {
    const stats = {};
    
    db.serialize(() => {
        // Total de ventas del mes
        db.get(
            `SELECT SUM(total_amount) as monthly_sales, COUNT(*) as sales_count
             FROM sales WHERE strftime('%Y-%m', sale_date) = strftime('%Y-%m', 'now')`,
            [],
            (err, row) => {
                if (!err) {
                    stats.monthly_sales = row.monthly_sales || 0;
                    stats.sales_count = row.sales_count || 0;
                }
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
                
                // Enviar todas las estadísticas
                res.json(stats);
            }
        );
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        database: 'Connected' 
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor backend ejecutándose en puerto ${PORT}`);
    console.log(`Base de datos SQLite ubicada en: ${dbPath}`);
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

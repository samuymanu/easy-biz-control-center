
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Crear directorio de base de datos si no existe
const dbDir = path.join(__dirname, '..', 'database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'sistema.db');
const db = new sqlite3.Database(dbPath);

console.log('Inicializando base de datos...');

// Leer y ejecutar el schema
const schemaPath = path.join(__dirname, '..', '..', 'src', 'database', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Dividir en statements individuales
const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);

db.serialize(() => {
    statements.forEach((statement, index) => {
        db.run(statement, (err) => {
            if (err) {
                console.error(`Error ejecutando statement ${index + 1}:`, err);
            } else {
                console.log(`✓ Statement ${index + 1} ejecutado correctamente`);
            }
        });
    });
});

db.close((err) => {
    if (err) {
        console.error('Error al cerrar la base de datos:', err);
    } else {
        console.log('✓ Base de datos inicializada correctamente');
        console.log(`✓ Archivo de base de datos: ${dbPath}`);
    }
});

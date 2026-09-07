require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function initDb() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  };

  const connection = await mysql.createConnection({
    ...dbConfig,
    multipleStatements: true,
  });
  const schemaPath = path.join(__dirname, '../database/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  await connection.query(schema);
  console.log('Database initialized successfully.');
  await connection.end();
}

initDb().catch((error) => {
  console.error('Database initialization failed:', error.message);
  process.exit(1);
});

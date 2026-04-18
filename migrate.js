const fs = require('fs');
const { Client } = require('pg');

async function run() {
  const connectionString = 'postgresql://inventra_db_user:wbB31eKDgUIdBfWcUhtMw6PPbfMvOfzv@dpg-d7hr22tckfvc73ep4khg-a.oregon-postgres.render.com/inventra_db';
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Render Database!');
    
    const sql = fs.readFileSync('database/init.sql', 'utf8');
    console.log('Running tables initialization...');
    
    await client.query(sql);
    console.log('Database successfully populated!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();

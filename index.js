const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const port = 3000;

const pool = new Pool ({
  user: 'postgres',
  host: 'localhost',
  database: 'empresa',
  password: 'admin',
  port: 5432,
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM departamento');
    const rows = result.rows;
    res.render('login_page', { data: rows });
  } catch (error) {
    console.error('Erro ao executar a consulta SQL:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor iniciado em http://localhost:${port}`);
});

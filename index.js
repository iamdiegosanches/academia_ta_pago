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

app.get('/create-user', (req, res) => {
  try {
    res.render('register_page');
  } catch (error) {
    console.error('Ocorreu um erro inesperado:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

app.get('/edit-weight', (req, res) => {
  try {
    res.render('edit_weight');
  } catch (error) {
    console.error('Ocorreu um erro inesperado:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

app.get('/total-weight', (req, res) => {
  try {
    res.render('total_weight');
  } catch (error) {
    console.error('Ocorreu um erro inesperado:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor iniciado em http://localhost:${port}`);
});

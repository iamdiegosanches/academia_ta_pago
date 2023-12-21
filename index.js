const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use('/public', express.static(`${process.cwd()}/public`));


app.get('/', (req, res) => {
  res.render('login_page');
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor iniciado em http://localhost:${port}`);
});

const express = require('express');
const path = require('path');
const controller = require('./src/controller');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 3000;


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/public', express.static(`${process.cwd()}/public`));

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

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

app.get('/', (req, res) => {
  res.render('login');
});


app.get('/addEquipment', async (req, res) => {
  try {
      const trainers = await controller.getAllTrainers(req, res);
      res.render('add_equipment', { trainers: trainers });
  } catch (error) {
      console.log(error);
  }
});


app.get('/updateEquipment/:id', async (req, res)=>{
  const data = await controller.getEquipmentById(req, res);
  const trainers = await controller.getAllTrainers(req, res);
  res.render('edit_equipment', {equip: data, trainers: trainers});
});

app.post('/updateEquipment/:id', async (req, res)=>{
  try{
      controller.updateEquipment(req, res);
  }
  catch(error){
      console.error('Error updating equipment:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/deleteEquipment/:id', async (req, res)=>{
  try {
      controller.removeEquipment(req, res);
  } catch (error) {
      console.log(error);
  }
}); 


app.get('/admDashboard', async (req, res) => {
  try {
      const equipmentsPromise = await controller.getAllEquipments(req, res);
      const trainersPromise = await controller.getAllTrainers(req, res);
      const qtdTrainers = await controller.qtdTrainers();
      const qtdClients = await controller.qtdClients();

      const [equipments, trainers] = await Promise.all([equipmentsPromise, trainersPromise]);

      const simplifiedTrainer = trainers.map(trainers => {
          return {
              email: trainers.email,
              cpf: trainers.cpf,
              nome: trainers.nome,
              data: formatDate(trainers.data),
              senha: trainers.senha,
              salario: trainers.salario,
          };
      });

      res.render('admDashboard', { equipments: equipments, trainers: simplifiedTrainer, qtdTrainers: qtdTrainers, qtdClients: qtdClients});
  } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
  }
});

app.get('/addTrainer', (req, res) => {
  res.render('add_trainer');
});

app.post('/addTrainer', (req, res) => {
  try {
      controller.addTrainer(req, res);
  } catch (error) {
      console.log('Error in adding Trainer');
      console.log(error);
  }
});


app.get('/updateTrainer/:email', async (req, res)=>{
  const data = await controller.getTrainerByEmail(req, res);
  res.render('edit_trainer', {trainer: data});
});

app.post('/updateTrainer/:email', async (req, res)=>{
  try{
      controller.updateTrainer(req, res);
  }
  catch(error){
      console.error('Error updating equipment:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/deleteTrainer/:email', async (req, res)=>{
  try {
      const validation = controller.countEquipByTrainer(req, res);
      // Queria fazer uma parte para enviar uma mensagem para o adm confirmar se quer mesmo excluir
      controller.removeTrainer(req, res);
  } catch (error) {
      console.log(error);
  }
});


// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado em http://localhost:${PORT}`);
});

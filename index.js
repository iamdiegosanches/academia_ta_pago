const express = require('express');
const path = require('path');
const controller = require('./src/controller');
const authMiddleware = require('./middlewares/authmiddleware');
const app = express();
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwtSecret = process.env.JWT_SECRET;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

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

app.get('/edit-weight', async (req, res) => {
  try {
    const email = controller.getTokenEmailID(req);
    const isClient = await controller.getClientByEmail(email);
    res.render('edit_weight', { client: isClient });
  } catch (error) {
    console.error('Ocorreu um erro inesperado:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

// ToDo: testar essa funcionalidade
app.post('/edit-weight', authMiddleware(['client']), async (req, res) => {
  try {
    controller.updateWeight(req, res);
    res.redirect('/clientDashboard');
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
});

app.get('/total-weight', authMiddleware(['client']) , async (req, res) => {
  try {
    const email = controller.getTokenEmailID(req);
    const isClient = await controller.getClientByEmail(email);
    const totalWeightData = await controller.getTWeight(req, res);
    res.render('total_weight', { totalWeightData: totalWeightData, client:isClient });
  } catch (error) {
    console.error('Ocorreu um erro inesperado:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

app.get('/', (req, res) => {
  res.render('login');
});

// ToDo: Adicionar a logica para o admin 
app.post('/', async (req, res) => {
  const { email, password } = req.body;
  try {
    const client = await controller.getClientByEmail(email);
    const adm_user = process.env.DB_USER;
    if (!client) {
      const trainer = await controller.getTrainerByEmail(email)
      if(!trainer) {
        if ((adm_user + '@tapago.com') === email) {
          const adm_password = process.env.DB_PASSWORD;
          if (password === adm_password) {
            const token = jwt.sign({ userId: email, role: 'adm' }, jwtSecret);
            res.cookie('token', token, { httpOnly: true });
            res.redirect('/admDashboard');
          }
        } else {
          return res.status(500).send('Falha no login'); // ToDo: tratar isso melhor
        }
      } else {
        if (password === trainer.senha) {
          const token = jwt.sign({ userId: email, role: 'trainer' }, jwtSecret);
          res.cookie('token', token, { httpOnly: true });
          res.redirect(`/trainerDashboard`); 
        } else {
          return res.status(500).send('Senha invalida'); // ToDo: melhorar tratamento para a falha de senha
        }
      }
      // ToDo: testar
    } else {
      if (password === client.senha) { // ToDo: criptografia
        const token = jwt.sign({ userId: email, role: 'client' }, jwtSecret);
        res.cookie('token', token, { httpOnly: true });
        res.redirect(`/clientDashboard`);
      } else {
        return res.status(500).send('Senha invalida'); // ToDo: tratar isso melhor
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send('Erro interno do servidor');
  }
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
      const qtdEquip = await controller.qtdEquipments();
      const clientes = await controller.getAllClients();

      const simplifiedClient = clientes.map(clientes => {
        return {
          email: clientes.email,
          cpf: clientes.cpf,
          nome: clientes.nome,
          data: formatDate(clientes.data),
          senha: clientes.senha,
          objetivo: clientes.objetivo,
        };
      });

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

      res.render('admDashboard', { equipments: equipments, trainers: simplifiedTrainer, qtdTrainers: qtdTrainers, qtdClients: qtdClients, clients: simplifiedClient, qtdEquip: qtdEquip });
  } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
  }
});

app.get('/addClient', (req, res) => {
  res.render('add_client');
});

app.post('/addClient', (req, res) => {
  try {
      controller.addClient(req, res);
  } catch (error) {
      console.log('Error in adding Client');
      console.log(error);
  }
});

app.get('/updateClient/:email', async (req, res)=>{
  try {
    const data = await controller.getClientByEmail(req.params.email);
    res.render('edit_client', {client: data});
  } catch (error) {
    console.log(error);
  }
});

app.post('/updateClient/:email', async (req, res)=>{
  try{
      controller.updateClient(req, res);
  }
  catch(error){
      console.error('Error updating client:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/deleteClient/:email', async (req, res)=>{
  try {
      // Queria fazer uma parte para enviar uma mensagem para o adm confirmar se quer mesmo excluir
      controller.removeClient(req, res);
  } catch (error) {
      console.log(error);
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
  try {
    const data = await controller.getTrainerByEmail(req.params.email);
    res.render('edit_trainer', {trainer: data});
  } catch (error) {
    console.log(error);
  }
});

app.post('/updateTrainer/:email', async (req, res)=>{
  try{
      controller.updateTrainer(req, res);
  }
  catch(error){
      console.error('Error updating trainer:', error);
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

app.get('/trainerDashboard', async (req, res) => {
  try {
      const email = controller.getTokenEmailID(req);
      const isTrainer = controller.getTrainerByEmail(email);
      if (isTrainer){
          const equip = await controller.getEquipmentByPersonal(req, res);
          if (equip.length == 0) {
              const clientsUseEquip = [];
              res.render('trainerDashboard', { equip: equip, clients: clientsUseEquip });
          } else {
              const data = new Date();
              const clientsUseEquip = await controller.getClientsUseEquip(req, res, equip[0].id, data);
              res.render('trainerDashboard', { equip: equip, clients: clientsUseEquip });
          }
      } else {
          res.status(500).send("Trainer not exists");
      }
  } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
  }
});

app.get('/trainerDashboard/:filter', async (req, res) => {
  try {
      const email = controller.getTokenEmailID(req);
      const isTrainer = await controller.getTrainerByEmail(email);
      if (isTrainer) {
          const equip = await controller.getEquipmentByPersonal(req, res);
          let data;

          switch (req.params.filter) {
              case 'today':
                  data = await controller.getClientsUseEquip(req, res, equip[0].id, new Date());
                  break;
              case 'yesterday':
                  let yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  data = await controller.getClientsUseEquip(req, res, equip[0].id, yesterday);
                  break;
              case 'thisMonth':
                  data = await controller.getClientsUseEquipThisMonth(req, res, equip[0].id, new Date());
                  break;
              case 'mostUsed':
                  data = await controller.getClientsUseEquipMostThisYear(req, res, equip[0].id, new Date());
                  break;
          }

          res.render('card_client', { clients: data });
      } else {
          res.status(500).send("Trainer not exists");
      }
  } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
  }
});

app.get('/registrarUso/:id', async (req, res) => {
  try {
      const equipId = req.params.id;
      const clientes = await controller.getAllClients();
      res.render('registrar_Uso', {equipId: equipId, clientes: clientes});
  } catch (error) {
      console.log(error);
      res.status(500).send('Internal Server Error');
  }
});

app.post('/registrarUso/:id', (req, res) => {
  try {
      controller.registrarUso(req, res);
  } catch (error) {
      console.log(error);
  }
});

app.get('/clientDashboard', async (req, res) => {
  try {
    const email = controller.getTokenEmailID(req);
    const isClient = await controller.getClientByEmail(email);
    if (isClient){
        const dataDB = await controller.getEquipmentsUsedToday(email, new Date());
        const total_weight = await controller.getTotalWeightForSpecificMonth(email, new Date());
        res.render('clientDashboard', {equipment: dataDB, email: email, client: isClient, weight: total_weight } );
      } else {
        res.status(500).send("O cliente não existe!");
    }
} catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
}
});

app.get('/clientDashboard/:filter', async (req, res) => {
  try {
    const email = controller.getTokenEmailID(req);
    const isClient = await controller.getClientByEmail(email);
    if (isClient) {
      let data;
      switch (req.params.filter) {
          case 'today':
              data = await controller.getEquipmentsUsedToday(email, new Date());
              break;
          case 'month':
              data = await controller.getEquipmentUsedMonth(email, new Date());
              break;
          case 'mostUsed':
              data = await controller.getEquipmentMostUsed(email, new Date());
              break;
      }
      res.render('card_data', {data: data });
    } else {
      res.status(500).send("Client not exists");
    }
  }catch (error) {
    console.log(error);
  }
});

app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado em http://localhost:${PORT}`);
});

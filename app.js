const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configuração do Sequelize para MySQL
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  dialectModule: require('mysql2'),
  logging: false,
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados foi estabelecida com sucesso.');
  } catch (error) {
    console.error('Erro ao conectar-se ao banco de dados:', error);
    process.exit(1);
  }
})();

// Configuração do EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'frontend', 'public')));
app.use(express.urlencoded({ extended: true }));

// Modelo do Usuário
const User = sequelize.define('User', {
  telefone: { type: DataTypes.STRING, allowNull: false },
  nome: { type: DataTypes.STRING, allowNull: false },
  data_nascimento: { type: DataTypes.DATEONLY, allowNull: false },
  tipo: { type: DataTypes.STRING, allowNull: false },
  peso: { type: DataTypes.FLOAT, allowNull: true },
  altura: { type: DataTypes.FLOAT, allowNull: true },
  alergias: { type: DataTypes.STRING, allowNull: true },
  informacoes: { type: DataTypes.TEXT, allowNull: true },
});

(async () => {
  try {
    await sequelize.sync();
    console.log('Banco de dados sincronizado com sucesso.');
  } catch (error) {
    console.error('Erro ao sincronizar o banco de dados:', error);
  }
})();

// Rotas
app.get('/', async (req, res) => {
  const usuario = await User.findOne();
  res.render('index', { usuario });
});

app.get('/cadastro', (req, res) => {
  res.render('cadastro');
});

app.post('/usuario', async (req, res) => {
  try {
    const { telefone, nome, data_nascimento, tipo, peso, altura, alergias, informacoes } = req.body;

    if (!telefone || !nome || !data_nascimento || !tipo) {
      return res.status(400).send('Dados obrigatórios não fornecidos.');
    }

    const usuario = await User.create({
      telefone,
      nome,
      data_nascimento,
      tipo,
      peso: peso ? parseFloat(peso.replace(',', '.')) : null,
      altura: altura ? parseFloat(altura.replace(',', '.')) : null,
      alergias,
      informacoes,
    });

    res.redirect('/');
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).send('Erro ao processar o cadastro.');
  }
});

app.get('/local', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'public', 'local.html'));
});

let users = [];

io.on('connection', (socket) => {
  console.log(`Usuário conectado: ${socket.id}`);
  socket.emit('todos-usuarios', users);

  socket.on('enviar-localizacao', (data) => {
    console.log('Localização recebida:', data);
    let user = users.find((u) => u.id === data.id);
    if (user) {
      user.location = data.location;
    } else {
      users.push({ id: data.id, location: data.location });
    }
    io.emit('todos-usuarios', users);
  });

  socket.on('disconnect', () => {
    console.log(`Usuário desconectado: ${socket.id}`);
    users = users.filter((u) => u.id !== socket.id);
    io.emit('todos-usuarios', users);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em localhost:${PORT}`);
});
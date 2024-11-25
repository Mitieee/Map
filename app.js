const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do Sequelize para MySQL
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  dialect: 'mysql',
});

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

// Sincronizar o Banco de Dados
sequelize.sync();

// Rotas
app.get('/', (req, res) => {
  res.render('index', { usuario: null });
});

app.get('/cadastro', (req, res) => {
  res.render('cadastro');
});

app.post('/usuario', async (req, res) => {
  try {
    const { telefone, nome, data_nascimento, tipo, peso, altura, alergias, informacoes } = req.body;

    const usuario = await User.create({
      telefone,
      nome,
      data_nascimento,
      tipo,
      peso: peso.replace(',', '.'),
      altura: altura.replace(',', '.'),
      alergias,
      informacoes,
    });

    res.render('index', { usuario });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao processar o cadastro.');
  }
});

// Iniciar Servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

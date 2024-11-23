import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'frontend', 'public')));

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
});

const Usuario = sequelize.define(
  'Usuario',
  {
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    telefone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    data_nascimento: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    tipo_sanguineo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    peso: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    altura: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
  },
  {
    tableName: 'usuarios',
    timestamps: true,
  }
);

sequelize.sync();

app.get('/', (req, res) => {
  res.render('index', { usuario: null });
});

app.get('/cadastro', (req, res) => {
  res.render('cadastro');
});

app.post('/cadastro', async (req, res) => {
  const { nome, telefone, data_nascimento, tipo, peso, altura } = req.body;

  try {
    const novoUsuario = await Usuario.create({
      nome,
      telefone,
      data_nascimento,
      tipo_sanguineo: tipo,
      peso,
      altura,
    });

    res.render('index', { usuario: novoUsuario });
  } catch (error) {
    console.error('Erro ao salvar usuário:', error);
    res.status(500).send('Erro ao salvar usuário.');
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`[SUCESSO] Servidor rodando na porta ${PORT}`);
});

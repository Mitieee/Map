import { Sequelize } from "@sequelize/core";
import { MySqlDialect } from "@sequelize/mysql";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize({
  dialect: MySqlDialect,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
});

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "frontend", "public")));

let users = [];
let usuario = null;

app.get("/", (req, res) => {
  if (usuario) {
    res.render("index", { usuario: usuario });
  } else {
    res.render("index", { usuario: null });
  }
});

app.get("/cadastro", (req, res) => {
  res.render("cadastro");
});

app.post("/cadastro", (req, res) => {
  usuario = {
    nome: req.body.nome,
    data_nascimento: req.body.data_nascimento,
    tipo: req.body.tipo,
    peso: req.body.peso,
    altura: req.body.altura,
  };

  res.render("index", { usuario: usuario });
});

io.on("connection", (socket) => {
  socket.emit("todos-usuarios", users);

  socket.on("enviar-localizacao", (data) => {
    console.log("Localização recebida:", data);
    let user = users.find((u) => u.id === data.id);
    if (user) {
      user.location = data.location;
    } else {
      users.push({ id: data.id, location: data.location });
    }
    io.emit("todos-usuarios", users);
  });

  socket.on("disconnect", () => {
    users = users.filter((u) => u.id !== socket.id);
    io.emit("todos-usuarios", users);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`[SUCESSO] Servidor rodando na porta ${PORT}`);
});
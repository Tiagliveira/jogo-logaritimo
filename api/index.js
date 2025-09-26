const express = require("express");
const path = require("path");
const User = require("./mongo");
const cors = require("cors");
require("dotenv").config();


const app = express();
app.use(express.json());
app.use(cors({
  origin: "https://tiagliveira.github.io", // seu frontend
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use("/assets", express.static(path.join(__dirname, "../assets")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://tiagliveira.github.io");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// 📌 Cadastro de novo jogador
app.post("/cadastro", async (req, res) => {
  const { id, avatar } = req.body;
  if (!id || typeof id !== "string" || id.trim() === "") {
    return res.status(400).send("ID inválido");
  }

  const idLimpo = id.trim();
  try {
    const existe = await User.findOne({ id: idLimpo });
    if (existe) return res.status(409).send("Usuário já existe");

    const novo = new User({ id: idLimpo, avatar });
    await novo.save();
    res.send("Cadastro realizado com sucesso");
  } catch (err) {
    console.error("Erro ao cadastrar:", err.message);
    res.status(500).send("Erro ao cadastrar");
  }
});

// 📌 Login
app.post("/login", async (req, res) => {
  const { id } = req.body;
  if (!id || typeof id !== "string" || id.trim() === "") {
    return res.status(400).send("ID inválido");
  }

  try {
    const usuario = await User.findOne({ id: id.trim() });
    if (!usuario) return res.status(404).send("Usuário não encontrado");

    res.json({
      mensagem: `Login bem-sucedido para ${usuario.id}`,
      dados: {
        id: usuario.id,
        avatar: usuario.avatar,
        nivel: usuario.nivel,
        vidas: usuario.vidas,
        historico: usuario.historico,
      },
    });
  } catch (err) {
    res.status(500).send("Erro ao buscar usuário");
  }
});

// 📌 Salvar histórico
app.post("/salvar-historico", async (req, res) => {
  const { id, historico } = req.body;
  if (!id || !Array.isArray(historico)) {
    return res.status(400).send("Dados inválidos");
  }

  try {
    await User.updateOne({ id: id.trim() }, { historico });
    res.send("Histórico salvo com sucesso");
  } catch (err) {
    res.status(500).send("Erro ao salvar histórico");
  }
});

// 📌 Verificar ID
app.post("/verificar-id", async (req, res) => {
  const { id } = req.body;
  try {
    const existe = await User.findOne({ id: id.trim() });
    res.send({ existe: !!existe });
  } catch (err) {
    res.status(500).send("Erro interno");
  }
});

// 📌 Ranking


// 📌 Atualizar ranking
app.post("/atualizar-ranking", async (req, res) => {
  const { id, novoNivel, vidas } = req.body;
  try {
    const usuario = await User.findOne({ id });
    const nivelMaximoAtual = usuario?.nivelMaximo || 1;

    if (novoNivel > nivelMaximoAtual) {
      await User.updateOne(
        { id },
        { nivel: novoNivel, nivelMaximo: novoNivel, vidas }
      );
      res.send("Nível, nível máximo e vidas atualizados!");
    } else {
      await User.updateOne({ id }, { nivel: novoNivel, vidas });
      res.send("Nível e vidas atualizados!");
    }
  } catch (err) {
    res.status(500).send("Erro ao atualizar nível");
  }
});

// 📌 Atualizar nível
app.post("/atualizar-nivel", async (req, res) => {
  const { id, nivelAtual, vidas } = req.body;
  try {
    const usuario = await User.findOne({ id });
    const nivelMaximo = usuario?.nivelMaximo || 1;

    if (nivelAtual > nivelMaximo) {
      await User.updateOne(
        { id },
        { nivel: nivelAtual, nivelMaximo: nivelAtual, vidas }
      );
      res.send("✅ Nível e nível máximo atualizados!");
    } else {
      await User.updateOne({ id }, { nivel: nivelAtual, vidas });
      res.send("✅ Nível atualizado!");
    }
  } catch (err) {
    res.status(500).send("Erro ao atualizar nível");
  }
});

// 📌 Reiniciar nível
app.post("/reiniciar-nivel", async (req, res) => {
  const { id } = req.body;
  try {
    await User.updateOne({ id }, { nivel: 1, vidas: 3 });
    res.send("✅ Nível reiniciado para 1 e vidas restauradas para 3");
  } catch (err) {
    res.status(500).send("Erro ao reiniciar nível");
  }
});

// 📦 Exporta como função serverless para Vercel
const serverless = require("serverless-http");
module.exports = serverless(app);
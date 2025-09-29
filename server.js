const express = require("express");
const path = require("path");
const cors = require("cors");
const db = require("./database");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors()); // ou use seu allowCORS manual

app.use(express.static(path.join(__dirname, "assets")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "assets", "index.html"));
});

// 🔧 Trata requisições OPTIONS (pré-flight)
app.options("*", (req, res) => {
  res.status(200).end();
});

// 📌 Cadastro de novo jogador
app.post("/cadastro", (req, res) => {
  const { id, avatar } = req.body;
  if (!id || typeof id !== "string" || id.trim() === "")
    return res.status(400).send("ID inválido");

  const idLimpo = id.trim();
  db.get(`SELECT id FROM jogadores WHERE id = ?`, [idLimpo], (err, row) => {
    if (row) return res.status(409).send("Usuário já existe");

    db.run(
      `INSERT INTO jogadores (id, avatar) VALUES (?, ?)`,
      [idLimpo, avatar],
      (err) => {
        if (err) return res.status(500).send("Erro ao cadastrar");
        res.send("Cadastro realizado com sucesso");
      }
    );
  });
});

// 📌 Login
app.post("/login", (req, res) => {
  const { id } = req.body;
  if (!id || typeof id !== "string" || id.trim() === "")
    return res.status(400).send("ID inválido");

  db.get(`SELECT * FROM jogadores WHERE id = ?`, [id.trim()], (err, usuario) => {
    if (!usuario) return res.status(404).send("Usuário não encontrado");

    res.json({
      mensagem: `Login bem-sucedido para ${usuario.id}`,
      dados: {
        id: usuario.id,
        avatar: usuario.avatar,
        nivel: usuario.nivel,
        vidas: usuario.vidas,
        historico: JSON.parse(usuario.historico || "[]"),
      },
    });
  });
});

// 📌 Salvar histórico
app.post("/salvar-historico", (req, res) => {
  const { id, historico } = req.body;
  if (!id || !Array.isArray(historico))
    return res.status(400).send("Dados inválidos");

  db.run(
    `UPDATE jogadores SET historico = ? WHERE id = ?`,
    [JSON.stringify(historico), id.trim()],
    (err) => {
      if (err) return res.status(500).send("Erro ao salvar histórico");
      res.send("Histórico salvo com sucesso");
    }
  );
});

// 📌 Verificar ID
app.post("/verificar-id", (req, res) => {
  const { id } = req.body;
  db.get(`SELECT id FROM jogadores WHERE id = ?`, [id.trim()], (err, row) => {
    res.send({ existe: !!row });
  });
});

// 📌 Atualizar ranking
app.post("/atualizar-ranking", (req, res) => {
  const { id, novoNivel, vidas } = req.body;
  db.get(`SELECT nivelMaximo FROM jogadores WHERE id = ?`, [id], (err, row) => {
    const nivelMaximoAtual = row?.nivelMaximo || 1;
    const atualiza = novoNivel > nivelMaximoAtual
      ? `UPDATE jogadores SET nivel = ?, nivelMaximo = ?, vidas = ? WHERE id = ?`
      : `UPDATE jogadores SET nivel = ?, vidas = ? WHERE id = ?`;

    const params = novoNivel > nivelMaximoAtual
      ? [novoNivel, novoNivel, vidas, id]
      : [novoNivel, vidas, id];

    db.run(atualiza, params, (err) => {
      if (err) return res.status(500).send("Erro ao atualizar nível");
      res.send("Dados atualizados!");
    });
  });
});

// 📌 Atualizar nível
app.post("/atualizar-nivel", (req, res) => {
  const { id, nivelAtual, vidas } = req.body;
  db.get(`SELECT nivelMaximo FROM jogadores WHERE id = ?`, [id], (err, row) => {
    const nivelMaximo = row?.nivelMaximo || 1;
    const atualiza = nivelAtual > nivelMaximo
      ? `UPDATE jogadores SET nivel = ?, nivelMaximo = ?, vidas = ? WHERE id = ?`
      : `UPDATE jogadores SET nivel = ?, vidas = ? WHERE id = ?`;

    const params = nivelAtual > nivelMaximo
      ? [nivelAtual, nivelAtual, vidas, id]
      : [nivelAtual, vidas, id];

    db.run(atualiza, params, (err) => {
      if (err) return res.status(500).send("Erro ao atualizar nível");
      res.send("✅ Nível atualizado!");
    });
  });
});

// 📌 Reiniciar nível
app.post("/reiniciar-nivel", (req, res) => {
  const { id } = req.body;
  db.run(
    `UPDATE jogadores SET nivel = 1, vidas = 3 WHERE id = ?`,
    [id],
    (err) => {
      if (err) return res.status(500).send("Erro ao reiniciar nível");
      res.send("✅ Nível reiniciado para 1 e vidas restauradas para 3");
    }
  );
});

// 📦 Exporta como função serverless para Vercel
app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
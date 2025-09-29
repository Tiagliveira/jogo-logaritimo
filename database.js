const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./jogo.db");

// Criação da tabela
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS jogadores (
      id TEXT PRIMARY KEY,
      avatar TEXT,
      nivel INTEGER DEFAULT 1,
      nivelMaximo INTEGER DEFAULT 1,
      vidas INTEGER DEFAULT 3,
      historico TEXT
    )
  `);
});

module.exports = db;
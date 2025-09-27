const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  avatar: String,
  nivel: { type: Number, default: 1 },
  nivelMaximo: { type: Number, default: 1 },
  vidas: { type: Number, default: 3 },
  historico: { type: Array, default: [] },
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema, "users");
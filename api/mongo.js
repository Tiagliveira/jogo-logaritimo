const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  nivel: { type: Number, default: 1 },
  nivelMaximo: { type: Number, default: 1 },
  vidas: { type: Number, default: 3 },
  historico: { type: [String], default: [] },
  avatar: String,
});

const User = mongoose.model("User", userSchema);
module.exports = User;
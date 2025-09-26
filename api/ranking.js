const mongoose = require("mongoose");
const User = require("./mongo");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "https://tiagliveira.github.io");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method !== "GET") {
    return res.status(405).send("Método não permitido");
  }

  try {
    const ranking = await User.find({}, "id nivelMaximo avatar")
      .sort({ nivelMaximo: -1 })
      .limit(10);
    res.status(200).json(ranking);
  } catch (err) {
    res.status(500).send("Erro ao buscar ranking");
  }
};
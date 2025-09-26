const express = require("express");
const app = require("./api/index"); // ou o nome do seu arquivo principal
app.listen(3000, () => console.log("Servidor rodando em http://localhost:3000"));
const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Middleware para interpretar JSON no body das requisições
app.use(express.json());

const filePath = './database.json';

// Função para carregar os dados do arquivo JSON
const loadData = () => {
  const data = fs.readFileSync(filePath);
  return JSON.parse(data);
};

// Função para salvar os dados no arquivo JSON
const saveData = (data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Rota GET para buscar todos os usuários
app.get('/users', (req, res) => {
  const data = loadData();
  console.log("aqui");
  console.log(data);
  res.json(data.users);
});

// Rota POST para adicionar um novo usuário
app.post('/users', (req, res) => {
  const data = loadData();
  const newUser = req.body;  // O corpo da requisição deve conter { id, name }

  console.log("aqui");
  console.log(newUser);
  // Adiciona o novo usuário
  data.users.push(newUser);
  saveData(data);

  res.status(201).json({ message: 'User added', user: newUser });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

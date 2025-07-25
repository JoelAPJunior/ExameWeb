const express = require('express');
const fs = require('fs');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;
const DB_FILE = './tarefas.json';

app.use(cors());
app.use(express.json());

// 📌 Mapeamento de categoria para CO₂ (em kg)
const impactoCO2 = {
  "Ir de carro": 2.5,
  "Plantar uma árvore": -5.0,
  "Reunião online": 0.2,
  "Transporte público": 1.0,
  "Caminhada": 0,
  "Outro": 0.5
};

// 📁 Funções utilitárias
function lerTarefas() {
  if (!fs.existsSync(DB_FILE)) return [];
  const data = fs.readFileSync(DB_FILE);
  return JSON.parse(data);
}

function salvarTarefas(tarefas) {
  fs.writeFileSync(DB_FILE, JSON.stringify(tarefas, null, 2));
}

// 📥 POST /tarefas
app.post('/tarefas', (req, res) => {
  const { nome, categoria, data, descricao, usuario } = req.body;

  if (!nome || !categoria || !data || !usuario) {
    return res.status(400).json({ erro: 'Campos obrigatórios faltando.' });
  }

  const co2 = impactoCO2[categoria] ?? 0.5;

  const nova = {
    id: uuidv4(),
    nome,
    categoria,
    data,
    descricao,
    usuario,
    co2
  };

  const tarefas = lerTarefas();
  tarefas.push(nova);
  salvarTarefas(tarefas);

  res.status(201).json(nova);
});

// 📤 GET /tarefas
app.get('/tarefas', (req, res) => {
  const { data, categoria, usuario } = req.query;

  let tarefas = lerTarefas();

  if (usuario) {
    tarefas = tarefas.filter(t => t.usuario === usuario);
  }

  if (data) {
    tarefas = tarefas.filter(t => t.data === data);
  }

  if (categoria) {
    tarefas = tarefas.filter(t => t.categoria === categoria);
  }

  const totalCO2 = tarefas.reduce((acc, t) => acc + (t.co2 || 0), 0);

  res.json({ tarefas, totalCO2 });
});

// 🗑️ DELETE /tarefas/:id
app.delete('/tarefas/:id', (req, res) => {
  const { id } = req.params;
  let tarefas = lerTarefas();

  const existe = tarefas.some(t => t.id === id);
  if (!existe) {
    return res.status(404).json({ erro: 'Tarefa não encontrada.' });
  }

  tarefas = tarefas.filter(t => t.id !== id);
  salvarTarefas(tarefas);

  res.status(204).send();
});

// 🚀 Inicia servidor
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});

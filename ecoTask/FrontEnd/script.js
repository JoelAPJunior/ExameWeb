const form = document.getElementById('tarefaForm');
const tarefasDiv = document.getElementById('tarefas');
const totalCO2 = document.getElementById('totalCO2');

const API_URL = 'http://localhost:3000/tarefas';

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const categoria = document.getElementById('categoria').value;
  const data = document.getElementById('data').value;
  const descricao = document.getElementById('descricao').value.trim();

  if (!nome || !categoria || !data) {
    alert('Preencha todos os campos obrigatórios.');
    return;
  }

  const tarefa = { nome, categoria, data, descricao };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tarefa)
    });

    if (!res.ok) throw new Error('Erro ao cadastrar');

    form.reset();
    carregarTarefas();
  } catch (error) {
    alert('Erro ao salvar tarefa: ' + error.message);
  }
});

async function carregarTarefas() {
  const hoje = new Date().toISOString().split('T')[0];

  try {
    const res = await fetch(`${API_URL}?data=${hoje}`);
    const data = await res.json();

    tarefasDiv.innerHTML = '';
    data.tarefas.forEach(t => {
      const div = document.createElement('div');
      div.className = 'tarefa';
      div.innerHTML = `
        <strong>${t.nome}</strong> (${t.categoria})<br/>
        <small>${t.descricao || ''}</small><br/>
        <button onclick="deletarTarefa('${t.id}')">🗑️ Excluir</button>
      `;
      tarefasDiv.appendChild(div);
    });

    totalCO2.textContent = `Pegada de carbono total do dia: ${data.totalCO2.toFixed(2)} kg de CO₂`;

  } catch (error) {
    tarefasDiv.innerHTML = '<p>Erro ao carregar tarefas.</p>';
  }
}

async function deletarTarefa(id) {
  if (!confirm('Deseja realmente excluir esta tarefa?')) return;

  try {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    carregarTarefas();
  } catch (err) {
    alert('Erro ao excluir tarefa.');
  }
}

// Carregar ao iniciar
carregarTarefas();

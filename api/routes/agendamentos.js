
import express from 'express';
import conexao from '../database.js';

const router = express.Router();

// LISTAR AGENDAMENTOS
router.get('/', async (req, res) => {
  try {
    const [dados] = await conexao.query(`
      SELECT
        a.id,
        a.pet_id,
        a.servico_id,
        a.data_hora,
        a.status,
        a.observacoes,
        p.nome AS nome_pet,
        p.especie,
        s.nome AS servico,
        s.preco AS valor,
        DATE_FORMAT(a.data_hora, '%Y-%m-%d') AS data,
        DATE_FORMAT(a.data_hora, '%H:%i') AS horario
      FROM agendamentos a
      LEFT JOIN pets p ON p.id = a.pet_id
      LEFT JOIN servicos s ON s.id = a.servico_id
      ORDER BY a.data_hora
    `);

    res.json(dados);
  } catch (erro) {
    console.error('Erro ao listar agendamentos:', erro.message);
    res.status(500).json({
      mensagem: 'Erro ao consultar os agendamentos.',
      erro: erro.message
    });
  }
});

// LISTAR PETS DISPONÍVEIS PARA SELEÇÃO
router.get('/pets', async (req, res) => {
  try {
    const [pets] = await conexao.query(
      'SELECT id, nome, especie FROM pets ORDER BY nome'
    );
    res.json(pets);
  } catch (erro) {
    res.status(500).json({
      mensagem: 'Erro ao consultar os pets.',
      erro: erro.message
    });
  }
});

// LISTAR SERVIÇOS DISPONÍVEIS PARA SELEÇÃO
router.get('/servicos', async (req, res) => {
  try {
    const [servicos] = await conexao.query(
      'SELECT id, nome, preco, duracao_min FROM servicos ORDER BY nome'
    );
    res.json(servicos);
  } catch (erro) {
    res.status(500).json({
      mensagem: 'Erro ao consultar os serviços.',
      erro: erro.message
    });
  }
});

// CONSULTAR AGENDAMENTO POR ID
router.get('/:id', async (req, res) => {
  try {
    const [dados] = await conexao.execute(
      'SELECT * FROM agendamentos WHERE id = ?',
      [req.params.id]
    );

    if (dados.length === 0) {
      return res.status(404).json({
        mensagem: 'Agendamento não encontrado.'
      });
    }

    res.json(dados[0]);
  } catch (erro) {
    res.status(500).json({
      mensagem: 'Erro ao consultar o agendamento.',
      erro: erro.message
    });
  }
});

// CADASTRAR AGENDAMENTO
router.post('/', async (req, res) => {
  try {
    const { pet_id, servico_id, data, horario, data_hora, status, observacoes } = req.body;

    const dataHora = data_hora || (
      data && horario ? `${data} ${horario}:00` : null
    );

    if (!pet_id || !servico_id || !dataHora) {
      return res.status(400).json({
        mensagem: 'Selecione o pet, o serviço, a data e o horário.'
      });
    }

    const [resultado] = await conexao.execute(
      `INSERT INTO agendamentos
       (pet_id, servico_id, data_hora, status, observacoes)
       VALUES (?, ?, ?, ?, ?)`,
      [pet_id, servico_id, dataHora, status || 'agendado', observacoes || null]
    );

    res.status(201).json({
      mensagem: 'Agendamento cadastrado com sucesso!',
      id: resultado.insertId
    });
  } catch (erro) {
    console.error('Erro ao cadastrar agendamento:', erro.message);
    res.status(500).json({
      mensagem: 'Erro ao cadastrar o agendamento.',
      erro: erro.message
    });
  }
});

// EDITAR AGENDAMENTO
router.put('/:id', async (req, res) => {
  try {
    const { pet_id, servico_id, data, horario, data_hora, status, observacoes } = req.body;

    const dataHora = data_hora || (
      data && horario ? `${data} ${horario}:00` : null
    );

    if (!pet_id || !servico_id || !dataHora) {
      return res.status(400).json({
        mensagem: 'Selecione o pet, o serviço, a data e o horário.'
      });
    }

    const [resultado] = await conexao.execute(
      `UPDATE agendamentos
       SET pet_id = ?, servico_id = ?, data_hora = ?,
           status = ?, observacoes = ?
       WHERE id = ?`,
      [pet_id, servico_id, dataHora, status || 'agendado', observacoes || null, req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensagem: 'Agendamento não encontrado.'
      });
    }

    res.json({
      mensagem: 'Agendamento atualizado com sucesso!'
    });
  } catch (erro) {
    console.error('Erro ao atualizar agendamento:', erro.message);
    res.status(500).json({
      mensagem: 'Erro ao atualizar o agendamento.',
      erro: erro.message
    });
  }
});

// EXCLUIR AGENDAMENTO
router.delete('/:id', async (req, res) => {
  try {
    const [resultado] = await conexao.execute(
      'DELETE FROM agendamentos WHERE id = ?',
      [req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensagem: 'Agendamento não encontrado.'
      });
    }

    res.json({
      mensagem: 'Agendamento excluído com sucesso!'
    });
  } catch (erro) {
    res.status(500).json({
      mensagem: 'Erro ao excluir o agendamento.',
      erro: erro.message
    });
  }
});

export default router;

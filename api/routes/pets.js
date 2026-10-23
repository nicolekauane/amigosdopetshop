
import express from 'express';
import conexao from '../database.js';

const router = express.Router();

// ===============================
// LISTAR PETS
// ===============================

router.get('/', async (req, res) => {
  try {
    const [pets] = await conexao.query(
      `SELECT
        id,
        nome,
        especie,
        raca,
        data_nascimento,
        peso_atual
      FROM pets
      ORDER BY id DESC`
    );

    res.json(
      pets.map((pet) => ({
        ...pet,
        nome_pet: pet.nome,
      }))
    );
  } catch (erro) {
    console.error('Erro ao listar pets:', erro.message);

    res.status(500).json({
      mensagem: 'Erro ao listar os pets.',
    });
  }
});

// ===============================
// CADASTRAR PET
// ===============================

router.post('/', async (req, res) => {
  try {
    const {
      nome,
      nome_pet,
      especie,
      raca,
      data_nascimento,
      peso_atual,
    } = req.body;

    const nomeFinal = String(nome || nome_pet || '').trim();

    if (!nomeFinal || !especie) {
      return res.status(400).json({
        mensagem: 'Preencha o nome do pet e a espécie.',
      });
    }

    const peso = peso_atual === '' || peso_atual == null
      ? null
      : Number(peso_atual);

    if (peso !== null && (!Number.isFinite(peso) || peso < 0)) {
      return res.status(400).json({
        mensagem: 'Informe um peso válido.',
      });
    }

    const nascimento = data_nascimento || null;

    if (
      nascimento &&
      !/^\d{4}-\d{2}-\d{2}$/.test(nascimento)
    ) {
      return res.status(400).json({
        mensagem: 'A data de nascimento deve estar no formato AAAA-MM-DD.',
      });
    }

    const [resultado] = await conexao.query(
      `INSERT INTO pets
        (nome, especie, raca, data_nascimento, peso_atual)
       VALUES (?, ?, ?, ?, ?)`,
      [
        nomeFinal,
        especie,
        raca || null,
        nascimento,
        peso,
      ]
    );

    res.status(201).json({
      mensagem: 'Pet cadastrado com sucesso!',
      id: resultado.insertId,
    });
  } catch (erro) {
    console.error('Erro ao cadastrar pet:', erro.message);

    res.status(500).json({
      mensagem: 'Erro ao cadastrar o pet.',
    });
  }
});

// ===============================
// EDITAR PET
// ===============================

router.put('/:id', async (req, res) => {
  try {
    const {
      nome,
      nome_pet,
      especie,
      raca,
      data_nascimento,
      peso_atual,
    } = req.body;

    const { id } = req.params;
    const nomeFinal = String(nome || nome_pet || '').trim();

    if (!nomeFinal || !especie) {
      return res.status(400).json({
        mensagem: 'Preencha o nome do pet e a espécie.',
      });
    }

    const peso = peso_atual === '' || peso_atual == null
      ? null
      : Number(peso_atual);

    if (peso !== null && (!Number.isFinite(peso) || peso < 0)) {
      return res.status(400).json({
        mensagem: 'Informe um peso válido.',
      });
    }

    const nascimento = data_nascimento || null;

    if (
      nascimento &&
      !/^\d{4}-\d{2}-\d{2}$/.test(nascimento)
    ) {
      return res.status(400).json({
        mensagem: 'A data de nascimento deve estar no formato AAAA-MM-DD.',
      });
    }

    const [resultado] = await conexao.query(
      `UPDATE pets
       SET nome = ?,
           especie = ?,
           raca = ?,
           data_nascimento = ?,
           peso_atual = ?
       WHERE id = ?`,
      [
        nomeFinal,
        especie,
        raca || null,
        nascimento,
        peso,
        id,
      ]
    );

    if (resultado.affectedRows === 0) {
      const [existentes] = await conexao.query(
        'SELECT id FROM pets WHERE id = ?',
        [id]
      );

      if (existentes.length === 0) {
        return res.status(404).json({
          mensagem: 'Pet não encontrado.',
        });
      }
    }

    res.json({
      mensagem: 'Pet atualizado com sucesso!',
    });
  } catch (erro) {
    console.error('Erro ao editar pet:', erro.message);

    res.status(500).json({
      mensagem: 'Erro ao editar o pet.',
    });
  }
});

// ===============================
// EXCLUIR PET
// ===============================

router.delete('/:id', async (req, res) => {
  try {
    const [resultado] = await conexao.query(
      'DELETE FROM pets WHERE id = ?',
      [req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensagem: 'Pet não encontrado.',
      });
    }

    res.json({
      mensagem: 'Pet excluído com sucesso!',
    });
  } catch (erro) {
    console.error('Erro ao excluir pet:', erro.message);

    res.status(500).json({
      mensagem:
        'Não foi possível excluir o pet. Verifique se existe algum agendamento vinculado a ele.',
    });
  }
});

export default router;

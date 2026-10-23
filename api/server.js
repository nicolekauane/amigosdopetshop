
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import conexao from './database.js';
import agendamentosRoutes from './routes/agendamentos.js';
import petsRoutes from './routes/pets.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rota inicial
app.get('/', (req, res) => {
  res.json({
    mensagem: 'API do Amigos do Pet Shop funcionando!'
  });
});

// Testar conexão com o MySQL
app.get('/teste-banco', async (req, res) => {
  try {
    const [resultado] = await conexao.query(
      'SELECT 1 AS conectado'
    );

    res.json({
      mensagem: 'Conexão com o MySQL funcionando!',
      banco: resultado[0]
    });
  } catch (erro) {
    console.error('Erro ao conectar ao MySQL:', erro.message);

    res.status(500).json({
      mensagem: 'Não foi possível conectar ao banco de dados.'
    });
  }
});

// Registrar as rotas dos agendamentos
app.use('/agendamentos', agendamentosRoutes);
app.use('/pets', petsRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(
    `API do Amigos do Pet Shop rodando na porta ${PORT}`
  );
});
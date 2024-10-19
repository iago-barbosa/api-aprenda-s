const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());



const readDatabase = () => {
  const data = fs.readFileSync('database.json');
  return JSON.parse(data);
};

const writeDatabase = (data) => {
  fs.writeFileSync('database.json', JSON.stringify(data, null, 2));
};

const convertImageToBase64 = (filePath) => {
  try {
    const image = fs.readFileSync(filePath);
    return `data:image/jpeg;base64,${image.toString('base64')}`;
  } catch (err) {
    console.error(`Erro ao converter a imagem: ${filePath}`, err);
    return "";
  }
};


// POST - Realizar login do usuário (retornar o objeto do usuário)
app.post('/login', (req, res) => {
  const db = readDatabase();
  const { email, senha } = req.body;
  
  const usuario = db.alunos.find(aluno => aluno.email === email && aluno.senha === senha);
  
  if (usuario) {
    res.status(200).json(usuario);
  } else {
    res.status(404).json({ message: 'Usuário não encontrado ou senha incorreta' });
  }
});

// GET - Lista Alunos
app.get('/alunos', (req, res) => {
  const db = readDatabase();
  const alunos = db.alunos;

  res.status(200).json(alunos);
})

// POST - Adicionar novo usuário
app.post('/alunos', (req, res) => {
  const db = readDatabase();
  const novoAluno = req.body;
  novoAluno.id = db.alunos.length + 1;

  db.alunos.push(novoAluno);
  writeDatabase(db);
  
  res.status(201).json({ message: 'Aluno adicionado com sucesso', aluno: novoAluno });
});

// PUT - Atualizar informações do usuário
app.put('/alunos/:id', (req, res) => {
  const { id } = req.params;
  const dadosAtualizados = req.body;
  const db = readDatabase();

  const alunoIndex = db.alunos.findIndex(aluno => aluno.id == id);
  
  if (alunoIndex !== -1) {
    db.alunos[alunoIndex] = { ...db.alunos[alunoIndex], ...dadosAtualizados };
    writeDatabase(db);
    res.status(200).json({ message: 'Informações atualizadas com sucesso', aluno: db.alunos[alunoIndex] });
  } else {
    res.status(404).json({ message: 'Aluno não encontrado' });
  }
});

// GET - Retornar as disciplinas do curso do usuário logado
app.get('/disciplinas-usuario/:id', (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  
  const aluno = db.alunos.find(aluno => aluno.id == id);
  
  if (aluno) {
    const curso = db.cursos.find(curso => curso.nome_curso === aluno.curso);
    if (curso) {
      res.status(200).json(curso.disciplinas);
    } else {
      res.status(404).json({ message: 'Curso não encontrado' });
    }
  } else {
    res.status(404).json({ message: 'Aluno não encontrado' });
  }
});

// GET - Retornar todas as disciplinas de todos os cursos
app.get('/disciplinas', (req, res) => {
  const db = readDatabase();
  const todasDisciplinas = db.cursos.flatMap(curso => curso.disciplinas);
  
  res.status(200).json(todasDisciplinas);
});

// GET - Retornar todos os cursos
app.get('/cursos', (req, res) => {
  const db = readDatabase();

  res.status(200).json(db.cursos)
});

// GET - Retornar todos os dados de ranking
app.get('/ranking', (req, res) => {
  const db = readDatabase();
  res.status(200).json(db.ranking);
});

// GET - Retornar os dados de ranking referente aos alunos do mesmo curso do usuário logado
app.get('/ranking-curso/:id', (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  
  const aluno = db.alunos.find(aluno => aluno.id == id);
  
  if (aluno) {
    const rankingCurso = db.ranking.filter(entry => {
      const alunoRank = db.alunos.find(a => a.nome_completo === entry.aluno);
      return alunoRank && alunoRank.curso === aluno.curso;
    });
    res.status(200).json(rankingCurso);
  } else {
    res.status(404).json({ message: 'Aluno não encontrado' });
  }
});

// GET - Retornar apenas os dados de ranking referente aos 10 primeiros colocados do mesmo curso do usuário logado
app.get('/ranking-top10/:id', (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  
  const aluno = db.alunos.find(aluno => aluno.id == id);
  
  if (aluno) {
    const rankingCurso = db.ranking.filter(entry => {
      const alunoRank = db.alunos.find(a => a.nome_completo === entry.aluno);
      return alunoRank && alunoRank.curso === aluno.curso;
    }).sort((a, b) => b.pontos - a.pontos).slice(0, 10);

    rankingCurso.forEach(aluno => {
          const caminhoImagem = path.join(__dirname, aluno.foto);
          const fotoConvertida = convertImageToBase64(caminhoImagem);

          aluno.foto = fotoConvertida;
    });
    
    res.status(200).json(rankingCurso);
  } else {
    res.status(404).json({ message: 'Aluno não encontrado' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

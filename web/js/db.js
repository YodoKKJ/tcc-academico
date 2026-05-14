/* ── db.js — Banco de dados SQLite via SQL.js ─────────────────────────── */

var db = null;

var SCHEMA = [
  'CREATE TABLE IF NOT EXISTS series (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL)',
  'CREATE TABLE IF NOT EXISTS turmas (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, serie_id INTEGER NOT NULL, ano_letivo INTEGER NOT NULL)',
  'CREATE TABLE IF NOT EXISTS alunos (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, matricula TEXT, data_nascimento TEXT, nome_pai TEXT, nome_mae TEXT, telefone TEXT, email TEXT)',
  'CREATE TABLE IF NOT EXISTS professores (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, especialidade TEXT, email TEXT, telefone TEXT)',
  'CREATE TABLE IF NOT EXISTS materias (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL)',
  'CREATE TABLE IF NOT EXISTS aluno_turma (aluno_id INTEGER NOT NULL, turma_id INTEGER NOT NULL, PRIMARY KEY (aluno_id, turma_id))',
  'CREATE TABLE IF NOT EXISTS prof_turma_materia (id INTEGER PRIMARY KEY AUTOINCREMENT, professor_id INTEGER NOT NULL, turma_id INTEGER NOT NULL, materia_id INTEGER NOT NULL)',
  'CREATE TABLE IF NOT EXISTS avaliacoes (id INTEGER PRIMARY KEY AUTOINCREMENT, turma_id INTEGER NOT NULL, materia_id INTEGER NOT NULL, tipo TEXT NOT NULL, descricao TEXT, data_aplicacao TEXT, peso REAL NOT NULL DEFAULT 1, bimestre INTEGER NOT NULL)',
  'CREATE TABLE IF NOT EXISTS notas (id INTEGER PRIMARY KEY AUTOINCREMENT, avaliacao_id INTEGER NOT NULL, aluno_id INTEGER NOT NULL, valor REAL NOT NULL, UNIQUE(avaliacao_id, aluno_id))',
  'CREATE TABLE IF NOT EXISTS presencas (id INTEGER PRIMARY KEY AUTOINCREMENT, turma_id INTEGER NOT NULL, materia_id INTEGER NOT NULL, aluno_id INTEGER NOT NULL, data TEXT NOT NULL, presente INTEGER NOT NULL DEFAULT 1, UNIQUE(turma_id, materia_id, aluno_id, data))'
];

/* Inicializa o banco de dados */
function initDB() {
  return initSqlJs({
    locateFile: function(file) {
      return 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/' + file;
    }
  }).then(function(SQL) {
    var saved = localStorage.getItem('academico_db_v2');
    if (saved) {
      try {
        db = new SQL.Database(new Uint8Array(JSON.parse(saved)));
      } catch(e) {
        db = new SQL.Database();
      }
    } else {
      db = new SQL.Database();
    }
    SCHEMA.forEach(function(sql) { db.run(sql); });
    saveDB();
    return db;
  });
}

function saveDB() {
  if (!db) return;
  try {
    var data = db.export();
    localStorage.setItem('academico_db_v2', JSON.stringify(Array.from(data)));
  } catch(e) { /* localStorage cheio */ }
}

/* ── Helpers internos ─────────────────────────────────────────────────── */
function query(sql, params) {
  var stmt = db.prepare(sql);
  stmt.bind(params || []);
  var rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function run(sql, params) {
  db.run(sql, params || []);
  saveDB();
}

function one(sql, params) {
  return query(sql, params)[0] || null;
}

function lastId() {
  return db.exec('SELECT last_insert_rowid()')[0].values[0][0];
}

/* ── API pública do banco ──────────────────────────────────────────────── */
var DB = {

  /* ── Séries ─────────────────────────────────────────────────────────── */
  getSeries: function() { return query('SELECT * FROM series ORDER BY nome'); },
  createSerie: function(nome) { run('INSERT INTO series (nome) VALUES (?)', [nome]); return lastId(); },
  updateSerie: function(id, nome) { run('UPDATE series SET nome=? WHERE id=?', [nome, id]); },
  deleteSerie: function(id) { run('DELETE FROM series WHERE id=?', [id]); },

  /* ── Turmas ──────────────────────────────────────────────────────────── */
  getTurmas: function() {
    return query('SELECT t.*, s.nome as serie_nome FROM turmas t LEFT JOIN series s ON s.id=t.serie_id ORDER BY t.nome');
  },
  createTurma: function(nome, serieId, anoLetivo) {
    run('INSERT INTO turmas (nome, serie_id, ano_letivo) VALUES (?,?,?)', [nome, serieId, anoLetivo]);
    return lastId();
  },
  updateTurma: function(id, nome, serieId, anoLetivo) {
    run('UPDATE turmas SET nome=?, serie_id=?, ano_letivo=? WHERE id=?', [nome, serieId, anoLetivo, id]);
  },
  deleteTurma: function(id) { run('DELETE FROM turmas WHERE id=?', [id]); },

  /* ── Alunos ──────────────────────────────────────────────────────────── */
  getAlunos: function(busca) {
    if (busca && busca.trim()) return query('SELECT * FROM alunos WHERE nome LIKE ? ORDER BY nome', ['%' + busca.trim() + '%']);
    return query('SELECT * FROM alunos ORDER BY nome');
  },
  getAluno: function(id) { return one('SELECT * FROM alunos WHERE id=?', [id]); },
  createAluno: function(f) {
    run('INSERT INTO alunos (nome,matricula,data_nascimento,nome_pai,nome_mae,telefone,email) VALUES (?,?,?,?,?,?,?)',
      [f.nome, f.matricula||null, f.dataNascimento||null, f.nomePai||null, f.nomeMae||null, f.telefone||null, f.email||null]);
    return lastId();
  },
  updateAluno: function(id, f) {
    run('UPDATE alunos SET nome=?,matricula=?,data_nascimento=?,nome_pai=?,nome_mae=?,telefone=?,email=? WHERE id=?',
      [f.nome, f.matricula||null, f.dataNascimento||null, f.nomePai||null, f.nomeMae||null, f.telefone||null, f.email||null, id]);
  },
  deleteAluno: function(id) { run('DELETE FROM alunos WHERE id=?', [id]); },

  /* ── Professores ─────────────────────────────────────────────────────── */
  getProfessores: function() { return query('SELECT * FROM professores ORDER BY nome'); },
  createProfessor: function(f) {
    run('INSERT INTO professores (nome,especialidade,email,telefone) VALUES (?,?,?,?)',
      [f.nome, f.especialidade||null, f.email||null, f.telefone||null]);
    return lastId();
  },
  updateProfessor: function(id, f) {
    run('UPDATE professores SET nome=?,especialidade=?,email=?,telefone=? WHERE id=?',
      [f.nome, f.especialidade||null, f.email||null, f.telefone||null, id]);
  },
  deleteProfessor: function(id) { run('DELETE FROM professores WHERE id=?', [id]); },

  /* ── Matérias ────────────────────────────────────────────────────────── */
  getMaterias: function() { return query('SELECT * FROM materias ORDER BY nome'); },
  createMateria: function(nome) { run('INSERT INTO materias (nome) VALUES (?)', [nome]); return lastId(); },
  updateMateria: function(id, nome) { run('UPDATE materias SET nome=? WHERE id=?', [nome, id]); },
  deleteMateria: function(id) { run('DELETE FROM materias WHERE id=?', [id]); },

  /* ── Vínculos aluno-turma ────────────────────────────────────────────── */
  getAlunosDaTurma: function(turmaId) {
    return query('SELECT a.* FROM alunos a JOIN aluno_turma at ON at.aluno_id=a.id WHERE at.turma_id=? ORDER BY a.nome', [turmaId]);
  },
  vincularAluno: function(alunoId, turmaId) {
    run('INSERT OR IGNORE INTO aluno_turma (aluno_id,turma_id) VALUES (?,?)', [alunoId, turmaId]);
  },
  desvincularAluno: function(alunoId, turmaId) {
    run('DELETE FROM aluno_turma WHERE aluno_id=? AND turma_id=?', [alunoId, turmaId]);
  },

  /* ── Vínculos professor-turma-matéria ───────────────────────────────── */
  getPTMsDaTurma: function(turmaId) {
    return query('SELECT ptm.id, p.nome as prof_nome, m.nome as mat_nome FROM prof_turma_materia ptm JOIN professores p ON p.id=ptm.professor_id JOIN materias m ON m.id=ptm.materia_id WHERE ptm.turma_id=?', [turmaId]);
  },
  vincularPTM: function(profId, turmaId, matId) {
    run('INSERT INTO prof_turma_materia (professor_id,turma_id,materia_id) VALUES (?,?,?)', [profId, turmaId, matId]);
  },
  desvincularPTM: function(id) { run('DELETE FROM prof_turma_materia WHERE id=?', [id]); },

  /* ── Avaliações ──────────────────────────────────────────────────────── */
  getAvaliacoes: function(turmaId, materiaId) {
    var sql = 'SELECT a.*, t.nome as turma_nome, s.nome as serie_nome, m.nome as materia_nome FROM avaliacoes a JOIN turmas t ON t.id=a.turma_id JOIN series s ON s.id=t.serie_id JOIN materias m ON m.id=a.materia_id WHERE 1=1';
    var p = [];
    if (turmaId)   { sql += ' AND a.turma_id=?';   p.push(turmaId); }
    if (materiaId) { sql += ' AND a.materia_id=?';  p.push(materiaId); }
    sql += ' ORDER BY a.data_aplicacao DESC, a.id DESC';
    return query(sql, p);
  },
  createAvaliacao: function(f) {
    run('INSERT INTO avaliacoes (turma_id,materia_id,tipo,descricao,data_aplicacao,peso,bimestre) VALUES (?,?,?,?,?,?,?)',
      [f.turmaId, f.materiaId, f.tipo, f.descricao||null, f.dataAplicacao||null, f.peso, f.bimestre]);
  },
  deleteAvaliacao: function(id) { run('DELETE FROM avaliacoes WHERE id=?', [id]); },

  /* ── Notas ───────────────────────────────────────────────────────────── */
  getNotasDaAvaliacao: function(avalId) {
    return query('SELECT n.*, a.nome as aluno_nome FROM notas n JOIN alunos a ON a.id=n.aluno_id WHERE n.avaliacao_id=?', [avalId]);
  },
  lancarNota: function(avalId, alunoId, valor) {
    run('INSERT OR REPLACE INTO notas (avaliacao_id,aluno_id,valor) VALUES (?,?,?)', [avalId, alunoId, valor]);
  },

  /* ── Presenças ───────────────────────────────────────────────────────── */
  getPresencas: function(turmaId, matId, data) {
    return query('SELECT * FROM presencas WHERE turma_id=? AND materia_id=? AND data=?', [turmaId, matId, data]);
  },
  lancarPresenca: function(turmaId, matId, alunoId, data, presente) {
    run('INSERT OR REPLACE INTO presencas (turma_id,materia_id,aluno_id,data,presente) VALUES (?,?,?,?,?)',
      [turmaId, matId, alunoId, data, presente ? 1 : 0]);
  },

  /* ── Dashboard ───────────────────────────────────────────────────────── */
  getDashboard: function() {
    return {
      totalAlunos:      one('SELECT COUNT(*) as n FROM alunos').n,
      totalProfessores: one('SELECT COUNT(*) as n FROM professores').n,
      totalTurmas:      one('SELECT COUNT(*) as n FROM turmas').n,
      totalMaterias:    one('SELECT COUNT(*) as n FROM materias').n,
      totalAvaliacoes:  one('SELECT COUNT(*) as n FROM avaliacoes').n
    };
  },

  /* ── Boletim ─────────────────────────────────────────────────────────── */
  getBoletim: function(alunoId, turmaId) {
    var materias = query(
      'SELECT DISTINCT m.id, m.nome FROM materias m JOIN prof_turma_materia ptm ON ptm.materia_id=m.id WHERE ptm.turma_id=? ORDER BY m.nome',
      [turmaId]
    );

    return materias.map(function(mat) {
      var bimestres = [1, 2, 3, 4].map(function(num) {
        var notas = query(
          'SELECT n.valor, a.descricao, a.tipo, a.peso FROM notas n JOIN avaliacoes a ON a.id=n.avaliacao_id WHERE n.aluno_id=? AND a.turma_id=? AND a.materia_id=? AND a.bimestre=?',
          [alunoId, turmaId, mat.id, num]
        );
        var media = null;
        if (notas.length > 0) {
          var tp = notas.reduce(function(s, n) { return s + n.peso; }, 0);
          if (tp > 0) media = notas.reduce(function(s, n) { return s + n.valor * n.peso; }, 0) / tp;
        }
        return {
          numero: num, media: media,
          notas: notas.map(function(n) { return { desc: n.descricao || n.tipo, valor: n.valor }; })
        };
      });

      var allNotas = query(
        'SELECT n.valor, a.peso FROM notas n JOIN avaliacoes a ON a.id=n.avaliacao_id WHERE n.aluno_id=? AND a.turma_id=? AND a.materia_id=?',
        [alunoId, turmaId, mat.id]
      );
      var mediaAnual = null;
      if (allNotas.length > 0) {
        var tp2 = allNotas.reduce(function(s, n) { return s + n.peso; }, 0);
        if (tp2 > 0) mediaAnual = allNotas.reduce(function(s, n) { return s + n.valor * n.peso; }, 0) / tp2;
      }

      var totalAulas = (one('SELECT COUNT(*) as n FROM presencas WHERE turma_id=? AND materia_id=? AND aluno_id=?', [turmaId, mat.id, alunoId]) || {n:0}).n;
      var presentes  = (one('SELECT COUNT(*) as n FROM presencas WHERE turma_id=? AND materia_id=? AND aluno_id=? AND presente=1', [turmaId, mat.id, alunoId]) || {n:0}).n;
      var frequencia = totalAulas > 0 ? Math.round(presentes / totalAulas * 100) : 100;

      return {
        materiaId: mat.id, materiaNome: mat.nome,
        bimestres: bimestres, mediaAnual: mediaAnual,
        frequencia: frequencia,
        situacao: mediaAnual !== null ? (mediaAnual >= 5 ? 'APROVADO' : 'REPROVADO') : '—'
      };
    });
  }
};

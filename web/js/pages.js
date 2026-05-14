/* ── pages.js — Todas as páginas da aplicação ───────────────────────────── */

var Pages = {};

/* ── Utilitários compartilhados ──────────────────────────────────────────── */
var AVATAR_COLORS = ['c1','c2','c3','c4','c5','c6','c7','c8'];
function avatarColor(id) { return AVATAR_COLORS[Math.abs(Number(id)||0) % 8]; }
function iniciais(nome) {
  var p = (nome||'').trim().split(/\s+/);
  return ((p[0]||'')[0]||'').toUpperCase() + ((p.length>1?(p[p.length-1]||'')[0]:'') || '').toUpperCase() || '?';
}
function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function notaColor(n) {
  if (n==null) return 'var(--ink-3)';
  if (n>=7) return 'var(--ok)';
  if (n>=5) return 'var(--warn)';
  return 'var(--bad)';
}
function fmtNota(n) { return n!=null ? Number(n).toFixed(1) : '—'; }

function showModal(html) {
  var root = document.getElementById('modal-root');
  root.innerHTML = html;
  var overlay = root.querySelector('.modal-overlay');
  if (overlay) overlay.addEventListener('click', function(e){ if(e.target===overlay) closeModal(); });
}
function closeModal() { document.getElementById('modal-root').innerHTML=''; }

function toast(msg, type) {
  var root = document.getElementById('toast-root');
  var el = document.createElement('div');
  el.className = 'toast ' + (type||'ok');
  el.textContent = msg;
  root.appendChild(el);
  setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 3000);
}

function emptyState(t, s) {
  return '<div class="empty"><div class="t">'+esc(t)+'</div><div class="s">'+esc(s)+'</div></div>';
}

function buildSelect(items, valueKey, labelFn, selectedVal, placeholder) {
  var opts = '<option value="">'+esc(placeholder||'Selecionar…')+'</option>';
  items.forEach(function(it) {
    var sel = String(it[valueKey]) === String(selectedVal) ? ' selected' : '';
    opts += '<option value="'+esc(it[valueKey])+'"'+sel+'>'+esc(labelFn(it))+'</option>';
  });
  return opts;
}

/* ═══════════════════════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════════════════════ */
Pages.dashboard = function(c) {
  var d = DB.getDashboard();
  var metrics = [
    {key:'totalAlunos',      label:'Alunos',      icon:'users'},
    {key:'totalProfessores', label:'Professores',  icon:'school'},
    {key:'totalTurmas',      label:'Turmas',       icon:'turmas'},
    {key:'totalMaterias',    label:'Matérias',     icon:'materias'},
    {key:'totalAvaliacoes',  label:'Avaliações',   icon:'avaliacoes'}
  ];

  var cards = metrics.map(function(m) {
    return '<div class="card kpi">'
      + '<div class="label">'+esc(m.label)+'</div>'
      + '<div class="value">'+esc(d[m.key]||'0')+'</div>'
      + '<div class="delta">'+icon(m.icon,11)+' cadastrados no sistema</div>'
      + '</div>';
  }).join('');

  c.innerHTML = ''
    + '<div class="page-header">'
    +   '<div>'
    +     '<div class="page-eyebrow">Sistema Acadêmico</div>'
    +     '<h1 class="page-title">Dashboard</h1>'
    +     '<div class="page-subtitle">Visão geral da instituição de ensino</div>'
    +   '</div>'
    + '</div>'
    + '<div class="grid g-4 mb-4" style="grid-template-columns:repeat(5,1fr)">'+cards+'</div>'
    + '<div class="card">'
    +   '<div class="card-header"><div class="card-title">Como começar</div></div>'
    +   '<ol>'
    +     '<li>Cadastre as <strong>Séries</strong> (ex: 1º Ano, 2º Ano)</li>'
    +     '<li>Crie as <strong>Turmas</strong> vinculadas às séries</li>'
    +     '<li>Cadastre as <strong>Matérias</strong> do currículo</li>'
    +     '<li>Cadastre <strong>Alunos</strong> e <strong>Professores</strong></li>'
    +     '<li>Use <strong>Vínculos</strong> para matricular alunos e atribuir professores</li>'
    +     '<li>Crie <strong>Avaliações</strong> e lance as <strong>Notas</strong></li>'
    +     '<li>Registre a <strong>Chamada</strong> diária e consulte o <strong>Boletim</strong></li>'
    +   '</ol>'
    + '</div>';
};

/* ═══════════════════════════════════════════════════════════════════════════
   ALUNOS
═══════════════════════════════════════════════════════════════════════════ */
Pages.alunos = function(c) {
  var busca = '';

  function render() {
    var items = DB.getAlunos(busca);
    var rows = items.map(function(r) {
      var av = avatarColor(r.id);
      return '<tr>'
        + '<td><span class="row"><span class="avatar sm '+av+'">'+esc(iniciais(r.nome))+'</span>'
        + '<span class="strong">'+esc(r.nome)+'</span></span></td>'
        + '<td class="num">'+esc(r.matricula||'—')+'</td>'
        + '<td>'+esc(r.email||'—')+'</td>'
        + '<td>'+esc(r.telefone||'—')+'</td>'
        + '<td><span class="row">'
        +   '<button class="icon-btn btn-edit" data-id="'+r.id+'" title="Editar">'+icon('edit')+'</button>'
        +   '<button class="icon-btn btn-del" data-id="'+r.id+'" style="color:var(--bad)" title="Excluir">'+icon('trash')+'</button>'
        + '</span></td>'
        + '</tr>';
    }).join('');

    var tbl = items.length === 0
      ? emptyState('Nenhum aluno cadastrado','CLIQUE EM "NOVO ALUNO" PARA COMEÇAR')
      : '<table class="table"><thead><tr><th>Aluno</th><th>Matrícula</th><th>E-mail</th><th>Telefone</th><th style="width:80px"></th></tr></thead><tbody>'+rows+'</tbody></table>';

    c.innerHTML = ''
      + '<div class="page-header">'
      +   '<div><div class="page-eyebrow">Pessoas · Alunos</div>'
      +   '<h1 class="page-title">Alunos</h1>'
      +   '<div class="page-subtitle">'+items.length+' aluno'+(items.length!==1?'s':'')+' cadastrado'+(items.length!==1?'s':'')+'</div></div>'
      +   '<button class="btn accent" id="btn-novo">'+icon('plus')+' Novo aluno</button>'
      + '</div>'
      + '<div class="filter-row"><div class="search-wrap">'+icon('search')
      +   '<input class="input" id="input-busca" placeholder="Buscar por nome…" value="'+esc(busca)+'">'
      + '</div></div>'
      + '<div class="card overflow-hidden" style="padding:0">'+tbl+'</div>';

    c.querySelector('#btn-novo').onclick = function() { openModal(null); };
    c.querySelector('#input-busca').oninput = function(e) { busca = e.target.value; render(); };

    c.querySelectorAll('.btn-edit').forEach(function(btn) {
      btn.onclick = function() { openModal(DB.getAluno(Number(this.dataset.id))); };
    });
    c.querySelectorAll('.btn-del').forEach(function(btn) {
      btn.onclick = function() {
        if (!confirm('Excluir este aluno?')) return;
        DB.deleteAluno(Number(this.dataset.id));
        render();
      };
    });
  }

  function openModal(item) {
    var f = item || {};
    showModal(''
      + '<div class="modal-overlay"><form class="modal" id="modal-form">'
      + '<div class="modal-header"><div>'
      +   '<div class="card-eyebrow">'+(item?'Editar aluno':'Novo aluno')+'</div>'
      +   '<div class="modal-title">'+(item?esc(item.nome):'Cadastrar aluno')+'</div>'
      + '</div><button type="button" class="icon-btn" id="btn-close">'+icon('x')+'</button></div>'
      + '<div class="modal-body">'
      +   '<div class="field"><label>Nome completo *</label>'
      +     '<input class="input" name="nome" required placeholder="Nome do aluno" value="'+esc(f.nome||'')+'"></div>'
      +   '<div class="form-grid">'
      +     '<div class="field"><label>Matrícula</label><input class="input" name="matricula" placeholder="Ex: 2024001" value="'+esc(f.matricula||'')+'"></div>'
      +     '<div class="field"><label>Data de nascimento</label><input class="input" type="date" name="dataNascimento" value="'+esc(f.data_nascimento||'')+'"></div>'
      +     '<div class="field"><label>Nome do pai</label><input class="input" name="nomePai" value="'+esc(f.nome_pai||'')+'"></div>'
      +     '<div class="field"><label>Nome da mãe</label><input class="input" name="nomeMae" value="'+esc(f.nome_mae||'')+'"></div>'
      +     '<div class="field"><label>Telefone</label><input class="input" name="telefone" value="'+esc(f.telefone||'')+'"></div>'
      +     '<div class="field"><label>E-mail</label><input class="input" type="email" name="email" value="'+esc(f.email||'')+'"></div>'
      +   '</div>'
      +   '<div class="erro" id="modal-erro"></div>'
      + '</div>'
      + '<div class="modal-footer">'
      +   '<button type="button" class="btn" id="btn-cancel">Cancelar</button>'
      +   '<button type="submit" class="btn accent">'+(item?'Salvar alterações':'Criar aluno')+'</button>'
      + '</div></form></div>'
    );
    document.getElementById('btn-close').onclick = closeModal;
    document.getElementById('btn-cancel').onclick = closeModal;
    document.getElementById('modal-form').onsubmit = function(e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      var data = { nome:fd.get('nome'), matricula:fd.get('matricula'), dataNascimento:fd.get('dataNascimento'), nomePai:fd.get('nomePai'), nomeMae:fd.get('nomeMae'), telefone:fd.get('telefone'), email:fd.get('email') };
      if (!data.nome.trim()) { document.getElementById('modal-erro').textContent='Informe o nome.'; return; }
      if (item) DB.updateAluno(item.id, data); else DB.createAluno(data);
      closeModal(); render();
      toast(item?'Aluno atualizado!':'Aluno criado!');
    };
  }

  render();
};

/* ═══════════════════════════════════════════════════════════════════════════
   PROFESSORES
═══════════════════════════════════════════════════════════════════════════ */
Pages.professores = function(c) {
  function render() {
    var items = DB.getProfessores();
    var rows = items.map(function(r) {
      var av = avatarColor(r.id);
      return '<tr>'
        + '<td><span class="row"><span class="avatar sm '+av+'">'+esc(iniciais(r.nome))+'</span>'
        + '<span class="strong">'+esc(r.nome)+'</span></span></td>'
        + '<td>'+esc(r.especialidade||'—')+'</td>'
        + '<td>'+esc(r.email||'—')+'</td>'
        + '<td>'+esc(r.telefone||'—')+'</td>'
        + '<td><span class="row">'
        +   '<button class="icon-btn btn-edit" data-id="'+r.id+'">'+icon('edit')+'</button>'
        +   '<button class="icon-btn btn-del" data-id="'+r.id+'" style="color:var(--bad)">'+icon('trash')+'</button>'
        + '</span></td></tr>';
    }).join('');

    var tbl = items.length===0
      ? emptyState('Nenhum professor cadastrado','CLIQUE EM "NOVO PROFESSOR" PARA COMEÇAR')
      : '<table class="table"><thead><tr><th>Professor</th><th>Especialidade</th><th>E-mail</th><th>Telefone</th><th style="width:80px"></th></tr></thead><tbody>'+rows+'</tbody></table>';

    c.innerHTML = ''
      + '<div class="page-header"><div>'
      +   '<div class="page-eyebrow">Pessoas · Professores</div>'
      +   '<h1 class="page-title">Professores</h1>'
      +   '<div class="page-subtitle">'+items.length+' professor'+(items.length!==1?'es':'')+' no corpo docente</div>'
      + '</div><button class="btn accent" id="btn-novo">'+icon('plus')+' Novo professor</button></div>'
      + '<div class="card overflow-hidden" style="padding:0">'+tbl+'</div>';

    c.querySelector('#btn-novo').onclick = function() { openModal(null); };
    c.querySelectorAll('.btn-edit').forEach(function(btn) {
      btn.onclick = function() {
        var all = DB.getProfessores(); var id = Number(this.dataset.id);
        openModal(all.find(function(x){return x.id===id;})||null);
      };
    });
    c.querySelectorAll('.btn-del').forEach(function(btn) {
      btn.onclick = function() {
        if (!confirm('Excluir este professor?')) return;
        DB.deleteProfessor(Number(this.dataset.id)); render();
      };
    });
  }

  function openModal(item) {
    var f = item||{};
    showModal(''
      + '<div class="modal-overlay"><form class="modal" id="modal-form">'
      + '<div class="modal-header"><div>'
      +   '<div class="card-eyebrow">'+(item?'Editar professor':'Novo professor')+'</div>'
      +   '<div class="modal-title">'+(item?esc(item.nome):'Cadastrar professor')+'</div>'
      + '</div><button type="button" class="icon-btn" id="btn-close">'+icon('x')+'</button></div>'
      + '<div class="modal-body">'
      +   '<div class="field"><label>Nome completo *</label><input class="input" name="nome" required value="'+esc(f.nome||'')+'" placeholder="Nome do professor"></div>'
      +   '<div class="field"><label>Especialidade</label><input class="input" name="especialidade" value="'+esc(f.especialidade||'')+'" placeholder="Ex: Matemática"></div>'
      +   '<div class="form-grid">'
      +     '<div class="field"><label>E-mail</label><input class="input" type="email" name="email" value="'+esc(f.email||'')+'"></div>'
      +     '<div class="field"><label>Telefone</label><input class="input" name="telefone" value="'+esc(f.telefone||'')+'"></div>'
      +   '</div>'
      +   '<div class="erro" id="modal-erro"></div>'
      + '</div>'
      + '<div class="modal-footer">'
      +   '<button type="button" class="btn" id="btn-cancel">Cancelar</button>'
      +   '<button type="submit" class="btn accent">'+(item?'Salvar alterações':'Criar professor')+'</button>'
      + '</div></form></div>'
    );
    document.getElementById('btn-close').onclick = closeModal;
    document.getElementById('btn-cancel').onclick = closeModal;
    document.getElementById('modal-form').onsubmit = function(e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      var data = { nome:fd.get('nome'), especialidade:fd.get('especialidade'), email:fd.get('email'), telefone:fd.get('telefone') };
      if (!data.nome.trim()) { document.getElementById('modal-erro').textContent='Informe o nome.'; return; }
      if (item) DB.updateProfessor(item.id, data); else DB.createProfessor(data);
      closeModal(); render();
      toast(item?'Professor atualizado!':'Professor criado!');
    };
  }

  render();
};

/* ═══════════════════════════════════════════════════════════════════════════
   SÉRIES
═══════════════════════════════════════════════════════════════════════════ */
Pages.series = function(c) {
  function render() {
    var items = DB.getSeries();
    var rows = items.map(function(r) {
      return '<tr><td class="num" style="color:var(--ink-4)">'+r.id+'</td>'
        + '<td class="strong">'+esc(r.nome)+'</td>'
        + '<td><span class="row">'
        +   '<button class="icon-btn btn-edit" data-id="'+r.id+'" data-nome="'+esc(r.nome)+'">'+icon('edit')+'</button>'
        +   '<button class="icon-btn btn-del" data-id="'+r.id+'" style="color:var(--bad)">'+icon('trash')+'</button>'
        + '</span></td></tr>';
    }).join('');

    var tbl = items.length===0
      ? emptyState('Nenhuma série cadastrada','EX: 1º ANO, 2º ANO, 3º ANO')
      : '<table class="table"><thead><tr><th style="width:60px">#</th><th>Nome</th><th style="width:80px"></th></tr></thead><tbody>'+rows+'</tbody></table>';

    c.innerHTML = ''
      + '<div class="page-header"><div>'
      +   '<div class="page-eyebrow">Acadêmico · Séries</div>'
      +   '<h1 class="page-title">Séries</h1>'
      +   '<div class="page-subtitle">Níveis de ensino da instituição</div>'
      + '</div><button class="btn accent" id="btn-novo">'+icon('plus')+' Nova série</button></div>'
      + '<div class="card overflow-hidden" style="padding:0">'+tbl+'</div>';

    c.querySelector('#btn-novo').onclick = function() { openModal(null, ''); };
    c.querySelectorAll('.btn-edit').forEach(function(btn) {
      btn.onclick = function() { openModal(Number(this.dataset.id), this.dataset.nome); };
    });
    c.querySelectorAll('.btn-del').forEach(function(btn) {
      btn.onclick = function() {
        if (!confirm('Excluir esta série?')) return;
        DB.deleteSerie(Number(this.dataset.id)); render();
      };
    });
  }

  function openModal(id, nomeAtual) {
    showModal(''
      + '<div class="modal-overlay"><form class="modal" id="modal-form" style="width:420px">'
      + '<div class="modal-header"><div>'
      +   '<div class="card-eyebrow">'+(id?'Editar série':'Nova série')+'</div>'
      +   '<div class="modal-title">'+(id?esc(nomeAtual):'Cadastrar série')+'</div>'
      + '</div><button type="button" class="icon-btn" id="btn-close">'+icon('x')+'</button></div>'
      + '<div class="modal-body">'
      +   '<div class="field"><label>Nome da série *</label>'
      +   '<input class="input" name="nome" required placeholder="Ex: 1º Ano" autofocus value="'+esc(nomeAtual||'')+'"></div>'
      +   '<div class="erro" id="modal-erro"></div>'
      + '</div>'
      + '<div class="modal-footer">'
      +   '<button type="button" class="btn" id="btn-cancel">Cancelar</button>'
      +   '<button type="submit" class="btn accent">'+(id?'Salvar':'Criar série')+'</button>'
      + '</div></form></div>'
    );
    document.getElementById('btn-close').onclick = closeModal;
    document.getElementById('btn-cancel').onclick = closeModal;
    document.getElementById('modal-form').onsubmit = function(e) {
      e.preventDefault();
      var nome = new FormData(e.target).get('nome').trim();
      if (!nome) { document.getElementById('modal-erro').textContent='Informe o nome.'; return; }
      if (id) DB.updateSerie(id, nome); else DB.createSerie(nome);
      closeModal(); render();
      toast(id?'Série atualizada!':'Série criada!');
    };
  }

  render();
};

/* ═══════════════════════════════════════════════════════════════════════════
   TURMAS
═══════════════════════════════════════════════════════════════════════════ */
Pages.turmas = function(c) {
  function render() {
    var items = DB.getTurmas();
    var rows = items.map(function(r) {
      var av = avatarColor(r.id);
      return '<tr>'
        + '<td><span class="row"><span class="avatar sm '+av+'">'+esc((r.nome||'?')[0].toUpperCase())+'</span>'
        + '<span class="strong">'+esc(r.nome)+'</span></span></td>'
        + '<td>'+esc(r.serie_nome||'—')+'</td>'
        + '<td class="num">'+esc(r.ano_letivo||'—')+'</td>'
        + '<td><span class="row">'
        +   '<button class="icon-btn btn-edit" data-id="'+r.id+'">'+icon('edit')+'</button>'
        +   '<button class="icon-btn btn-del" data-id="'+r.id+'" style="color:var(--bad)">'+icon('trash')+'</button>'
        + '</span></td></tr>';
    }).join('');

    var tbl = items.length===0
      ? emptyState('Nenhuma turma cadastrada','CRIE SÉRIES PRIMEIRO, DEPOIS AS TURMAS')
      : '<table class="table"><thead><tr><th>Turma</th><th>Série</th><th>Ano letivo</th><th style="width:80px"></th></tr></thead><tbody>'+rows+'</tbody></table>';

    c.innerHTML = ''
      + '<div class="page-header"><div>'
      +   '<div class="page-eyebrow">Acadêmico · Turmas</div>'
      +   '<h1 class="page-title">Turmas</h1>'
      +   '<div class="page-subtitle">'+items.length+' turma'+(items.length!==1?'s':'')+' cadastrada'+(items.length!==1?'s':'')+'</div>'
      + '</div><button class="btn accent" id="btn-novo">'+icon('plus')+' Nova turma</button></div>'
      + '<div class="card overflow-hidden" style="padding:0">'+tbl+'</div>';

    c.querySelector('#btn-novo').onclick = function() { openModal(null); };
    c.querySelectorAll('.btn-edit').forEach(function(btn) {
      btn.onclick = function() {
        var id = Number(this.dataset.id);
        var t = items.find(function(x){return x.id===id;});
        if (t) openModal(t);
      };
    });
    c.querySelectorAll('.btn-del').forEach(function(btn) {
      btn.onclick = function() {
        if (!confirm('Excluir esta turma?')) return;
        DB.deleteTurma(Number(this.dataset.id)); render();
      };
    });
  }

  function openModal(item) {
    var series = DB.getSeries();
    var anoAtual = new Date().getFullYear();
    var f = item||{};
    showModal(''
      + '<div class="modal-overlay"><form class="modal" id="modal-form">'
      + '<div class="modal-header"><div>'
      +   '<div class="card-eyebrow">'+(item?'Editar turma':'Nova turma')+'</div>'
      +   '<div class="modal-title">'+(item?esc(item.nome):'Cadastrar turma')+'</div>'
      + '</div><button type="button" class="icon-btn" id="btn-close">'+icon('x')+'</button></div>'
      + '<div class="modal-body">'
      +   '<div class="field"><label>Nome da turma *</label><input class="input" name="nome" required value="'+esc(f.nome||'')+'" placeholder="Ex: 3º A"></div>'
      +   '<div class="form-grid">'
      +     '<div class="field"><label>Série *</label><select class="select" name="serieId" required>'
      +       buildSelect(series,'id',function(s){return s.nome;}, f.serie_id,'Selecionar…')
      +     '</select></div>'
      +     '<div class="field"><label>Ano letivo *</label><input class="input" type="number" name="anoLetivo" required value="'+esc(f.ano_letivo||anoAtual)+'"></div>'
      +   '</div>'
      +   '<div class="erro" id="modal-erro"></div>'
      + '</div>'
      + '<div class="modal-footer">'
      +   '<button type="button" class="btn" id="btn-cancel">Cancelar</button>'
      +   '<button type="submit" class="btn accent">'+(item?'Salvar alterações':'Criar turma')+'</button>'
      + '</div></form></div>'
    );
    document.getElementById('btn-close').onclick = closeModal;
    document.getElementById('btn-cancel').onclick = closeModal;
    document.getElementById('modal-form').onsubmit = function(e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      var nome = fd.get('nome').trim();
      var serieId = fd.get('serieId');
      var anoLetivo = fd.get('anoLetivo');
      if (!nome) { document.getElementById('modal-erro').textContent='Informe o nome.'; return; }
      if (!serieId) { document.getElementById('modal-erro').textContent='Selecione a série.'; return; }
      if (item) DB.updateTurma(item.id, nome, Number(serieId), Number(anoLetivo));
      else DB.createTurma(nome, Number(serieId), Number(anoLetivo));
      closeModal(); render();
      toast(item?'Turma atualizada!':'Turma criada!');
    };
  }

  render();
};

/* ═══════════════════════════════════════════════════════════════════════════
   MATÉRIAS
═══════════════════════════════════════════════════════════════════════════ */
Pages.materias = function(c) {
  function render() {
    var items = DB.getMaterias();
    var rows = items.map(function(r) {
      return '<tr><td class="num" style="color:var(--ink-4)">'+r.id+'</td>'
        + '<td class="strong">'+esc(r.nome)+'</td>'
        + '<td><span class="row">'
        +   '<button class="icon-btn btn-edit" data-id="'+r.id+'" data-nome="'+esc(r.nome)+'">'+icon('edit')+'</button>'
        +   '<button class="icon-btn btn-del" data-id="'+r.id+'" style="color:var(--bad)">'+icon('trash')+'</button>'
        + '</span></td></tr>';
    }).join('');

    var tbl = items.length===0
      ? emptyState('Nenhuma matéria cadastrada','EX: MATEMÁTICA, PORTUGUÊS, CIÊNCIAS')
      : '<table class="table"><thead><tr><th style="width:60px">#</th><th>Nome</th><th style="width:80px"></th></tr></thead><tbody>'+rows+'</tbody></table>';

    c.innerHTML = ''
      + '<div class="page-header"><div>'
      +   '<div class="page-eyebrow">Acadêmico · Matérias</div>'
      +   '<h1 class="page-title">Matérias</h1>'
      +   '<div class="page-subtitle">Disciplinas do currículo escolar</div>'
      + '</div><button class="btn accent" id="btn-novo">'+icon('plus')+' Nova matéria</button></div>'
      + '<div class="card overflow-hidden" style="padding:0">'+tbl+'</div>';

    c.querySelector('#btn-novo').onclick = function() { openModal(null, ''); };
    c.querySelectorAll('.btn-edit').forEach(function(btn) {
      btn.onclick = function() { openModal(Number(this.dataset.id), this.dataset.nome); };
    });
    c.querySelectorAll('.btn-del').forEach(function(btn) {
      btn.onclick = function() {
        if (!confirm('Excluir esta matéria?')) return;
        DB.deleteMateria(Number(this.dataset.id)); render();
      };
    });
  }

  function openModal(id, nomeAtual) {
    showModal(''
      + '<div class="modal-overlay"><form class="modal" id="modal-form" style="width:420px">'
      + '<div class="modal-header"><div>'
      +   '<div class="card-eyebrow">'+(id?'Editar matéria':'Nova matéria')+'</div>'
      +   '<div class="modal-title">'+(id?esc(nomeAtual):'Cadastrar matéria')+'</div>'
      + '</div><button type="button" class="icon-btn" id="btn-close">'+icon('x')+'</button></div>'
      + '<div class="modal-body">'
      +   '<div class="field"><label>Nome da matéria *</label>'
      +   '<input class="input" name="nome" required placeholder="Ex: Matemática" value="'+esc(nomeAtual||'')+'"></div>'
      +   '<div class="erro" id="modal-erro"></div>'
      + '</div>'
      + '<div class="modal-footer">'
      +   '<button type="button" class="btn" id="btn-cancel">Cancelar</button>'
      +   '<button type="submit" class="btn accent">'+(id?'Salvar':'Criar matéria')+'</button>'
      + '</div></form></div>'
    );
    document.getElementById('btn-close').onclick = closeModal;
    document.getElementById('btn-cancel').onclick = closeModal;
    document.getElementById('modal-form').onsubmit = function(e) {
      e.preventDefault();
      var nome = new FormData(e.target).get('nome').trim();
      if (!nome) { document.getElementById('modal-erro').textContent='Informe o nome.'; return; }
      if (id) DB.updateMateria(id, nome); else DB.createMateria(nome);
      closeModal(); render();
      toast(id?'Matéria atualizada!':'Matéria criada!');
    };
  }

  render();
};

/* ═══════════════════════════════════════════════════════════════════════════
   VÍNCULOS
═══════════════════════════════════════════════════════════════════════════ */
Pages.vinculos = function(c) {
  var selTurma = '';
  var activeTab = 'aluno';
  var turmas = DB.getTurmas();
  var alunos = DB.getAlunos();
  var professores = DB.getProfessores();
  var materias = DB.getMaterias();

  function render() {
    var vincAT = selTurma ? DB.getAlunosDaTurma(Number(selTurma)) : [];
    var vincPTM = selTurma ? DB.getPTMsDaTurma(Number(selTurma)) : [];
    var alunosDisponiveis = alunos.filter(function(a) {
      return !vincAT.some(function(v){return v.id===a.id;});
    });
    var turmaSel = turmas.find(function(t){return String(t.id)===String(selTurma);});

    var turmaOpts = buildSelect(turmas,'id',function(t){return t.nome+' — '+t.serie_nome+' ('+t.ano_letivo+')';}, selTurma,'Selecione uma turma…');

    var painelAlunos = ''
      + '<div style="padding:14px;border-bottom:1px solid var(--line);display:flex;gap:8px;flex-wrap:wrap">'
      +   '<select class="select" id="sel-add-aluno" style="flex:1">'
      +     '<option value="">Adicionar aluno…</option>'
      +     alunosDisponiveis.map(function(a){return '<option value="'+a.id+'">'+esc(a.nome)+'</option>';}).join('')
      +   '</select>'
      +   '<button class="btn accent" id="btn-matricular">'+icon('plus')+' Matricular</button>'
      + '</div>';
    if (vincAT.length===0) {
      painelAlunos += '<div style="padding:24px;color:var(--ink-3);font-size:13px;text-align:center">Nenhum aluno matriculado.</div>';
    } else {
      painelAlunos += '<table class="table"><thead><tr><th>Aluno</th><th>Matrícula</th><th style="width:100px"></th></tr></thead><tbody>'
        + vincAT.map(function(a){ return '<tr><td class="strong">'+esc(a.nome)+'</td><td class="num">'+esc(a.matricula||'—')+'</td>'
          + '<td><button class="btn sm btn-desv-al" data-id="'+a.id+'" style="color:var(--bad)">'+icon('x',11)+' Remover</button></td></tr>'; }).join('')
        + '</tbody></table>';
    }

    var painelProf = ''
      + '<div style="padding:14px;border-bottom:1px solid var(--line);display:flex;gap:8px;flex-wrap:wrap">'
      +   '<select class="select" id="sel-add-prof" style="flex:1;min-width:160px">'
      +     '<option value="">Professor…</option>'
      +     professores.map(function(p){return '<option value="'+p.id+'">'+esc(p.nome)+'</option>';}).join('')
      +   '</select>'
      +   '<select class="select" id="sel-add-mat" style="flex:1;min-width:160px">'
      +     '<option value="">Matéria…</option>'
      +     materias.map(function(m){return '<option value="'+m.id+'">'+esc(m.nome)+'</option>';}).join('')
      +   '</select>'
      +   '<button class="btn accent" id="btn-vincular-ptm">'+icon('plus')+' Vincular</button>'
      + '</div>';
    if (vincPTM.length===0) {
      painelProf += '<div style="padding:24px;color:var(--ink-3);font-size:13px;text-align:center">Nenhum professor vinculado.</div>';
    } else {
      painelProf += '<table class="table"><thead><tr><th>Professor</th><th>Matéria</th><th style="width:100px"></th></tr></thead><tbody>'
        + vincPTM.map(function(v){ return '<tr><td class="strong">'+esc(v.prof_nome)+'</td><td>'+esc(v.mat_nome)+'</td>'
          + '<td><button class="btn sm btn-desv-ptm" data-id="'+v.id+'" style="color:var(--bad)">'+icon('x',11)+' Remover</button></td></tr>'; }).join('')
        + '</tbody></table>';
    }

    c.innerHTML = ''
      + '<div class="page-header"><div>'
      +   '<div class="page-eyebrow">Acadêmico · Vínculos</div>'
      +   '<h1 class="page-title">Vínculos</h1>'
      +   '<div class="page-subtitle">Matricule alunos e atribua professores às turmas</div>'
      + '</div></div>'
      + '<div class="card mb-4" style="padding:18px">'
      +   '<div class="field" style="margin:0"><label>Turma</label>'
      +   '<select class="select" id="sel-turma" style="max-width:400px">'+turmaOpts+'</select></div>'
      + '</div>';

    if (!selTurma) {
      c.innerHTML += emptyState('Selecione uma turma acima','PARA GERENCIAR ALUNOS E PROFESSORES');
    } else {
      c.innerHTML += ''
        + '<div class="card overflow-hidden" style="padding:0">'
        + '<div class="section-head"><div>'
        +   '<div class="t">'+esc(turmaSel?turmaSel.nome:'')+'</div>'
        +   '<div class="s">'+esc(turmaSel?turmaSel.serie_nome:'')+(turmaSel?' · '+turmaSel.ano_letivo:'')+'</div>'
        + '</div></div>'
        + '<div class="drawer-tabs">'
        +   '<button id="tab-aluno" class="'+(activeTab==='aluno'?'on':'')+'">Alunos matriculados ('+vincAT.length+')</button>'
        +   '<button id="tab-prof" class="'+(activeTab==='prof'?'on':'')+'">Professores / Matérias ('+vincPTM.length+')</button>'
        + '</div>'
        + (activeTab==='aluno' ? painelAlunos : painelProf)
        + '</div>';
    }

    document.getElementById('sel-turma').onchange = function() { selTurma=this.value; render(); };
    if (!selTurma) return;

    document.getElementById('tab-aluno').onclick = function() { activeTab='aluno'; render(); };
    document.getElementById('tab-prof').onclick  = function() { activeTab='prof';  render(); };

    if (activeTab==='aluno') {
      document.getElementById('btn-matricular').onclick = function() {
        var aId = document.getElementById('sel-add-aluno').value;
        if (!aId) return;
        DB.vincularAluno(Number(aId), Number(selTurma));
        render(); toast('Aluno matriculado!');
      };
      c.querySelectorAll('.btn-desv-al').forEach(function(btn){
        btn.onclick = function() { DB.desvincularAluno(Number(this.dataset.id), Number(selTurma)); render(); };
      });
    } else {
      document.getElementById('btn-vincular-ptm').onclick = function() {
        var pId = document.getElementById('sel-add-prof').value;
        var mId = document.getElementById('sel-add-mat').value;
        if (!pId||!mId) { toast('Selecione professor e matéria.','bad'); return; }
        DB.vincularPTM(Number(pId), Number(selTurma), Number(mId));
        render(); toast('Professor vinculado!');
      };
      c.querySelectorAll('.btn-desv-ptm').forEach(function(btn){
        btn.onclick = function() { DB.desvincularPTM(Number(this.dataset.id)); render(); };
      });
    }
  }

  render();
};

/* ═══════════════════════════════════════════════════════════════════════════
   AVALIAÇÕES
═══════════════════════════════════════════════════════════════════════════ */
Pages.avaliacoes = function(c) {
  var filtroTurma = '';

  var TIPO_PILL = {
    PROVA:       {cls:'info', label:'Prova'},
    TRABALHO:    {cls:'ok',   label:'Trabalho'},
    SIMULADO:    {cls:'warn', label:'Simulado'},
    RECUPERACAO: {cls:'err',  label:'Recuperação'}
  };

  function render() {
    var turmas = DB.getTurmas();
    var items = DB.getAvaliacoes(filtroTurma||null, null);
    var rows = items.map(function(r) {
      var tp = TIPO_PILL[r.tipo]||{cls:'',label:r.tipo};
      return '<tr>'
        + '<td class="strong">'+esc(r.descricao||r.tipo)+'</td>'
        + '<td><span class="pill '+tp.cls+'"><span class="dot"></span>'+tp.label+'</span></td>'
        + '<td>'+esc(r.turma_nome)+' <span style="color:var(--ink-4);font-size:11px">('+esc(r.serie_nome)+')</span></td>'
        + '<td>'+esc(r.materia_nome)+'</td>'
        + '<td class="num">'+r.bimestre+'º</td>'
        + '<td class="num">'+esc(r.data_aplicacao||'—')+'</td>'
        + '<td class="num">'+r.peso+'</td>'
        + '<td><button class="icon-btn btn-del" data-id="'+r.id+'" style="color:var(--bad)">'+icon('trash')+'</button></td>'
        + '</tr>';
    }).join('');

    var tbl = items.length===0
      ? emptyState('Nenhuma avaliação encontrada','CRIE A PRIMEIRA AVALIAÇÃO ACIMA')
      : '<table class="table"><thead><tr><th>Descrição</th><th>Tipo</th><th>Turma</th><th>Matéria</th><th>Bim.</th><th>Data</th><th>Peso</th><th style="width:60px"></th></tr></thead><tbody>'+rows+'</tbody></table>';

    var filtroOpts = '<option value="">Todas as turmas</option>'
      + turmas.map(function(t){return '<option value="'+t.id+'"'+(String(t.id)===String(filtroTurma)?' selected':'')+'>'+esc(t.nome)+' ('+esc(t.serie_nome)+')</option>';}).join('');

    c.innerHTML = ''
      + '<div class="page-header"><div>'
      +   '<div class="page-eyebrow">Lançamentos · Avaliações</div>'
      +   '<h1 class="page-title">Avaliações</h1>'
      +   '<div class="page-subtitle">Provas, trabalhos e atividades avaliativas</div>'
      + '</div><button class="btn accent" id="btn-novo">'+icon('plus')+' Nova avaliação</button></div>'
      + '<div class="filter-row"><select class="select" id="sel-filtro" style="width:auto;max-width:280px">'+filtroOpts+'</select></div>'
      + '<div class="card overflow-hidden" style="padding:0">'+tbl+'</div>';

    c.querySelector('#btn-novo').onclick = function() { openModal(); };
    c.querySelector('#sel-filtro').onchange = function() { filtroTurma=this.value; render(); };
    c.querySelectorAll('.btn-del').forEach(function(btn){
      btn.onclick = function() {
        if (!confirm('Excluir esta avaliação?')) return;
        DB.deleteAvaliacao(Number(this.dataset.id)); render();
      };
    });
  }

  function openModal() {
    var turmas = DB.getTurmas();
    var materias = DB.getMaterias();
    var hoje = new Date().toISOString().slice(0,10);
    showModal(''
      + '<div class="modal-overlay"><form class="modal wide" id="modal-form">'
      + '<div class="modal-header"><div>'
      +   '<div class="card-eyebrow">Nova avaliação</div>'
      +   '<div class="modal-title">Cadastrar avaliação</div>'
      + '</div><button type="button" class="icon-btn" id="btn-close">'+icon('x')+'</button></div>'
      + '<div class="modal-body"><div class="form-grid">'
      +   '<div class="field"><label>Turma *</label><select class="select" name="turmaId" required>'
      +     buildSelect(turmas,'id',function(t){return t.nome+' ('+t.serie_nome+')';},null)
      +   '</select></div>'
      +   '<div class="field"><label>Matéria *</label><select class="select" name="materiaId" required>'
      +     buildSelect(materias,'id',function(m){return m.nome;},null)
      +   '</select></div>'
      +   '<div class="field"><label>Tipo *</label><select class="select" name="tipo">'
      +     '<option value="PROVA">Prova</option><option value="TRABALHO">Trabalho</option>'
      +     '<option value="SIMULADO">Simulado</option><option value="RECUPERACAO">Recuperação</option>'
      +   '</select></div>'
      +   '<div class="field"><label>Bimestre *</label><select class="select" name="bimestre">'
      +     [1,2,3,4].map(function(b){return '<option value="'+b+'">'+b+'º Bimestre</option>';}).join('')
      +   '</select></div>'
      +   '<div class="field" style="grid-column:span 2"><label>Descrição</label>'
      +     '<input class="input" name="descricao" placeholder="Ex: Prova de Álgebra"></div>'
      +   '<div class="field"><label>Data de aplicação *</label>'
      +     '<input class="input" type="date" name="dataAplicacao" required value="'+hoje+'"></div>'
      +   '<div class="field"><label>Peso *</label>'
      +     '<input class="input" type="number" name="peso" min="0.1" max="10" step="0.1" required value="1"></div>'
      + '</div><div class="erro" id="modal-erro"></div></div>'
      + '<div class="modal-footer">'
      +   '<button type="button" class="btn" id="btn-cancel">Cancelar</button>'
      +   '<button type="submit" class="btn accent">Criar avaliação</button>'
      + '</div></form></div>'
    );
    document.getElementById('btn-close').onclick = closeModal;
    document.getElementById('btn-cancel').onclick = closeModal;
    document.getElementById('modal-form').onsubmit = function(e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      var f = { turmaId:fd.get('turmaId'), materiaId:fd.get('materiaId'), tipo:fd.get('tipo'), descricao:fd.get('descricao'), dataAplicacao:fd.get('dataAplicacao'), peso:Number(fd.get('peso')), bimestre:Number(fd.get('bimestre')) };
      if (!f.turmaId||!f.materiaId) { document.getElementById('modal-erro').textContent='Selecione turma e matéria.'; return; }
      DB.createAvaliacao(f);
      closeModal(); render();
      toast('Avaliação criada!');
    };
  }

  render();
};

/* ═══════════════════════════════════════════════════════════════════════════
   NOTAS
═══════════════════════════════════════════════════════════════════════════ */
Pages.notas = function(c) {
  var selTurma='', selMateria='', selAval='';
  var alunos=[], avaliacoes=[], notasMap={};

  function render() {
    var turmas  = DB.getTurmas();
    var materias = DB.getMaterias();
    var avalSel = avaliacoes.find(function(a){return String(a.id)===String(selAval);});

    var tabelaNotas = '';
    if (selAval && alunos.length>0) {
      tabelaNotas = ''
        + '<div class="card overflow-hidden mb-4" style="padding:0">'
        + '<div class="section-head"><div>'
        +   '<div class="t">'+esc(avalSel?avalSel.descricao||avalSel.tipo:'')+(avalSel?' — '+avalSel.bimestre+'º Bimestre':'')+'</div>'
        +   '<div class="s">'+esc(avalSel?'Peso: '+avalSel.peso+' · '+alunos.length+' alunos':'')+'</div>'
        + '</div>'
        + '<button class="btn accent" id="btn-salvar">'+icon('check',13)+' Salvar notas</button></div>'
        + '<table class="table"><thead><tr><th>Aluno</th><th style="width:150px;text-align:center">Nota (0–10)</th></tr></thead><tbody>'
        + alunos.map(function(a){ return '<tr><td class="strong">'+esc(a.nome)+'</td>'
          + '<td style="text-align:center"><input type="number" min="0" max="10" step="0.1" class="input nota-input" data-id="'+a.id+'" style="width:90px;text-align:center" value="'+esc(notasMap[a.id]!=null?notasMap[a.id]:'')+'" placeholder="—"></td></tr>'; }).join('')
        + '</tbody></table></div>';
    } else if (selAval && alunos.length===0) {
      tabelaNotas = emptyState('Nenhum aluno matriculado nesta turma','ACESSE VÍNCULOS PARA MATRICULAR ALUNOS');
    } else {
      tabelaNotas = emptyState('Selecione turma, matéria e avaliação','PARA LANÇAR AS NOTAS');
    }

    var avalOpts = '<option value="">Selecione…</option>'
      + avaliacoes.map(function(a){return '<option value="'+a.id+'"'+(String(a.id)===String(selAval)?' selected':'')+'>'+esc(a.descricao||a.tipo)+' — '+a.bimestre+'º Bim</option>';}).join('');

    c.innerHTML = ''
      + '<div class="page-header"><div>'
      +   '<div class="page-eyebrow">Lançamentos · Notas</div>'
      +   '<h1 class="page-title">Lançamento de Notas</h1>'
      +   '<div class="page-subtitle">Registre as notas por turma, matéria e avaliação</div>'
      + '</div></div>'
      + '<div class="card mb-4" style="padding:18px">'
      +   '<div class="row" style="gap:12px;flex-wrap:wrap;align-items:flex-end">'
      +     '<div class="field" style="margin:0;min-width:200px"><label>Turma</label>'
      +       '<select class="select" id="sel-turma"><option value="">Selecione…</option>'
      +       turmas.map(function(t){return '<option value="'+t.id+'"'+(String(t.id)===String(selTurma)?' selected':'')+'>'+esc(t.nome)+' ('+esc(t.serie_nome)+')</option>';}).join('')
      +       '</select></div>'
      +     '<div class="field" style="margin:0;min-width:180px"><label>Matéria</label>'
      +       '<select class="select" id="sel-materia"'+(selTurma?'':' disabled')+'><option value="">Selecione…</option>'
      +       materias.map(function(m){return '<option value="'+m.id+'"'+(String(m.id)===String(selMateria)?' selected':'')+'>'+esc(m.nome)+'</option>';}).join('')
      +       '</select></div>'
      +     '<div class="field" style="margin:0;min-width:220px"><label>Avaliação</label>'
      +       '<select class="select" id="sel-aval"'+(selMateria?'':' disabled')+'>'+avalOpts+'</select></div>'
      +   '</div>'
      + '</div>'
      + tabelaNotas;

    c.querySelector('#sel-turma').onchange = function() {
      selTurma=this.value; selMateria=''; selAval=''; alunos=[]; avaliacoes=[]; notasMap={};
      if (selTurma) alunos = DB.getAlunosDaTurma(Number(selTurma));
      render();
    };
    c.querySelector('#sel-materia').onchange = function() {
      selMateria=this.value; selAval=''; avaliacoes=[]; notasMap={};
      if (selTurma&&selMateria) avaliacoes = DB.getAvaliacoes(Number(selTurma), Number(selMateria));
      render();
    };
    c.querySelector('#sel-aval').onchange = function() {
      selAval=this.value; notasMap={};
      if (selAval) {
        DB.getNotasDaAvaliacao(Number(selAval)).forEach(function(n){ notasMap[n.aluno_id]=n.valor; });
      }
      render();
    };

    if (selAval && alunos.length>0) {
      c.querySelectorAll('.nota-input').forEach(function(inp){
        inp.oninput = function() { notasMap[Number(this.dataset.id)] = this.value; };
      });
      c.querySelector('#btn-salvar').onclick = function() {
        Object.keys(notasMap).forEach(function(aId) {
          var v = notasMap[aId];
          if (v!==''&&v!=null) DB.lancarNota(Number(selAval), Number(aId), Number(v));
        });
        toast('Notas salvas!');
      };
    }
  }

  render();
};

/* ═══════════════════════════════════════════════════════════════════════════
   CHAMADA
═══════════════════════════════════════════════════════════════════════════ */
Pages.chamada = function(c) {
  var selTurma='', selMateria='';
  var dataAula = new Date().toISOString().slice(0,10);
  var alunos=[], chamadaMap={};

  function render() {
    var turmas  = DB.getTurmas();
    var materias = DB.getMaterias();
    var presentes = Object.values(chamadaMap).filter(Boolean).length;
    var total = alunos.length;

    var painel = '';
    if (selTurma && selMateria && alunos.length>0) {
      painel = ''
        + '<div class="card overflow-hidden mb-4" style="padding:0">'
        + '<div class="section-head">'
        +   '<div class="row" style="gap:12px"><div class="t">Chamada — '+esc(dataAula)+'</div>'
        +     '<span class="pill ok"><span class="dot"></span>'+presentes+'/'+total+' presentes</span>'
        +   '</div>'
        +   '<div class="row" style="gap:8px">'
        +     '<button class="btn sm" id="btn-todos">'+icon('check',11)+' Todos presentes</button>'
        +     '<button class="btn sm" id="btn-nenhum" style="color:var(--bad)">'+icon('x',11)+' Todos ausentes</button>'
        +     '<button class="btn accent" id="btn-salvar">'+icon('check',13)+' Salvar chamada</button>'
        +   '</div>'
        + '</div>'
        + '<div class="chamada-grid">'
        + alunos.map(function(a){
            var pres = chamadaMap[a.id]!==false;
            return '<div class="chamada-card '+(pres?'presente':'ausente')+'" data-id="'+a.id+'">'
              + icon(pres?'check':'x',16)
              + '<span>'+esc(a.nome)+'</span></div>';
          }).join('')
        + '</div></div>';
    } else if (selTurma && selMateria && alunos.length===0) {
      painel = emptyState('Nenhum aluno matriculado nesta turma','ACESSE VÍNCULOS PARA MATRICULAR ALUNOS');
    } else {
      painel = emptyState('Selecione turma e matéria','PARA REGISTRAR A CHAMADA');
    }

    c.innerHTML = ''
      + '<div class="page-header"><div>'
      +   '<div class="page-eyebrow">Lançamentos · Chamada</div>'
      +   '<h1 class="page-title">Chamada / Frequência</h1>'
      +   '<div class="page-subtitle">Registre a presença dos alunos por aula</div>'
      + '</div></div>'
      + '<div class="card mb-4" style="padding:18px">'
      +   '<div class="row" style="gap:12px;flex-wrap:wrap;align-items:flex-end">'
      +     '<div class="field" style="margin:0;min-width:200px"><label>Turma</label>'
      +       '<select class="select" id="sel-turma"><option value="">Selecione…</option>'
      +       turmas.map(function(t){return '<option value="'+t.id+'"'+(String(t.id)===String(selTurma)?' selected':'')+'>'+esc(t.nome)+' ('+esc(t.serie_nome)+')</option>';}).join('')
      +       '</select></div>'
      +     '<div class="field" style="margin:0;min-width:180px"><label>Matéria</label>'
      +       '<select class="select" id="sel-materia"'+(selTurma?'':' disabled')+'><option value="">Selecione…</option>'
      +       materias.map(function(m){return '<option value="'+m.id+'"'+(String(m.id)===String(selMateria)?' selected':'')+'>'+esc(m.nome)+'</option>';}).join('')
      +       '</select></div>'
      +     '<div class="field" style="margin:0"><label>Data</label>'
      +       '<input class="input" type="date" id="input-data" value="'+esc(dataAula)+'" style="width:160px"></div>'
      +   '</div>'
      + '</div>'
      + painel;

    c.querySelector('#sel-turma').onchange = function() {
      selTurma=this.value; selMateria=''; alunos=[]; chamadaMap={};
      if (selTurma) {
        alunos = DB.getAlunosDaTurma(Number(selTurma));
        alunos.forEach(function(a){ chamadaMap[a.id]=true; });
      }
      render();
    };
    c.querySelector('#sel-materia').onchange = function() {
      selMateria=this.value;
      if (selTurma&&selMateria) carregarChamadaExistente();
      else render();
    };
    c.querySelector('#input-data').onchange = function() {
      dataAula=this.value;
      if (selTurma&&selMateria) carregarChamadaExistente();
      else render();
    };

    if (selTurma&&selMateria&&alunos.length>0) {
      c.querySelectorAll('.chamada-card').forEach(function(card){
        card.onclick = function() {
          var id=Number(this.dataset.id);
          chamadaMap[id] = chamadaMap[id]===false ? true : false;
          render();
        };
      });
      c.querySelector('#btn-todos').onclick  = function() { alunos.forEach(function(a){chamadaMap[a.id]=true;}); render(); };
      c.querySelector('#btn-nenhum').onclick = function() { alunos.forEach(function(a){chamadaMap[a.id]=false;}); render(); };
      c.querySelector('#btn-salvar').onclick = function() {
        alunos.forEach(function(a){ DB.lancarPresenca(Number(selTurma),Number(selMateria),a.id,dataAula,chamadaMap[a.id]!==false); });
        toast('Chamada salva!');
      };
    }
  }

  function carregarChamadaExistente() {
    var existentes = DB.getPresencas(Number(selTurma), Number(selMateria), dataAula);
    if (existentes.length>0) {
      existentes.forEach(function(r){ chamadaMap[r.aluno_id] = r.presente===1||r.presente===true; });
    }
    render();
  }

  render();
};

/* ═══════════════════════════════════════════════════════════════════════════
   BOLETIM
═══════════════════════════════════════════════════════════════════════════ */
Pages.boletim = function(c) {
  var selTurma='', selAluno='';
  var turmas=[], alunos=[], boletim=[];

  turmas = DB.getTurmas();

  function render() {
    var turmaInfo = turmas.find(function(t){return String(t.id)===String(selTurma);});
    var alunoInfo = alunos.find(function(a){return String(a.id)===String(selAluno);});

    var boletimHtml = '';
    if (selAluno && boletim.length>0) {
      boletimHtml = ''
        + '<div class="row mb-6" style="gap:14px">'
        +   '<div class="avatar '+avatarColor(selAluno)+'" style="width:44px;height:44px;font-size:15px">'+esc(iniciais(alunoInfo?alunoInfo.nome:''))+'</div>'
        +   '<div>'
        +     '<div style="font-size:18px;font-weight:600;font-family:var(--font-display);color:var(--ink)">'+esc(alunoInfo?alunoInfo.nome:'')+'</div>'
        +     '<div style="font-family:var(--font-mono);font-size:11px;color:var(--ink-3);margin-top:2px">'
        +       esc(turmaInfo?turmaInfo.nome+' — '+turmaInfo.serie_nome+' ('+turmaInfo.ano_letivo+')':'')
        +     '</div>'
        +   '</div>'
        + '</div>'
        + boletim.map(function(mat) {
            var bims = mat.bimestres.map(function(b){
              return '<div><div class="card-eyebrow" style="margin-bottom:8px">'+b.numero+'º Bimestre</div>'
                + '<div class="bim-media" style="color:'+notaColor(b.media!=null?Number(b.media):null)+'">'+fmtNota(b.media)+'</div>'
                + b.notas.map(function(n){ return '<div class="nota-row"><span class="nd">'+esc(n.desc)+'</span><span class="nv">'+fmtNota(n.valor)+'</span></div>'; }).join('')
                + '</div>';
            }).join('');
            return '<div class="card mb-4 overflow-hidden" style="padding:0">'
              + '<div class="section-head">'
              +   '<div class="row" style="gap:12px">'
              +     '<div class="t">'+esc(mat.materiaNome)+'</div>'
              +     '<span class="pill '+(mat.situacao==='APROVADO'?'ok':'err')+'"><span class="dot"></span>'+esc(mat.situacao)+'</span>'
              +   '</div>'
              +   '<div class="row" style="gap:20px">'
              +     '<div style="text-align:center"><div class="card-eyebrow" style="margin-bottom:2px">Média anual</div>'
              +       '<div style="font-family:var(--font-display);font-size:22px;line-height:1;color:'+notaColor(mat.mediaAnual!=null?Number(mat.mediaAnual):null)+'">'+fmtNota(mat.mediaAnual)+'</div></div>'
              +     '<div style="text-align:center"><div class="card-eyebrow" style="margin-bottom:2px">Frequência</div>'
              +       '<div style="font-family:var(--font-display);font-size:22px;line-height:1;color:'+(mat.frequencia>=75?'var(--ok)':'var(--bad)')+'">'+mat.frequencia+'%</div></div>'
              +   '</div>'
              + '</div>'
              + '<div class="bim-grid">'+bims+'</div>'
              + '</div>';
          }).join('');
    } else if (selAluno && boletim.length===0) {
      boletimHtml = emptyState('Sem dados para este aluno','NENHUMA MATÉRIA VINCULADA OU SEM AVALIAÇÕES');
    } else {
      boletimHtml = emptyState('Selecione turma e aluno','PARA VISUALIZAR O BOLETIM');
    }

    var alunoOpts = '<option value="">Selecione…</option>'
      + alunos.map(function(a){return '<option value="'+a.id+'"'+(String(a.id)===String(selAluno)?' selected':'')+'>'+esc(a.nome)+'</option>';}).join('');

    c.innerHTML = ''
      + '<div class="page-header"><div>'
      +   '<div class="page-eyebrow">Lançamentos · Boletim</div>'
      +   '<h1 class="page-title">Boletim Escolar</h1>'
      +   '<div class="page-subtitle">Consulte médias, frequência e situação final do aluno</div>'
      + '</div></div>'
      + '<div class="card mb-4" style="padding:18px">'
      +   '<div class="row" style="gap:12px;flex-wrap:wrap;align-items:flex-end">'
      +     '<div class="field" style="margin:0;min-width:220px"><label>Turma</label>'
      +       '<select class="select" id="sel-turma"><option value="">Selecione…</option>'
      +       turmas.map(function(t){return '<option value="'+t.id+'"'+(String(t.id)===String(selTurma)?' selected':'')+'>'+esc(t.nome)+' ('+esc(t.serie_nome)+')</option>';}).join('')
      +       '</select></div>'
      +     '<div class="field" style="margin:0;min-width:260px"><label>Aluno</label>'
      +       '<select class="select" id="sel-aluno"'+(selTurma?'':' disabled')+'>'+alunoOpts+'</select></div>'
      +   '</div>'
      + '</div>'
      + boletimHtml;

    c.querySelector('#sel-turma').onchange = function() {
      selTurma=this.value; selAluno=''; alunos=[]; boletim=[];
      if (selTurma) alunos = DB.getAlunosDaTurma(Number(selTurma));
      render();
    };
    c.querySelector('#sel-aluno').onchange = function() {
      selAluno=this.value; boletim=[];
      if (selAluno&&selTurma) boletim = DB.getBoletim(Number(selAluno), Number(selTurma));
      render();
    };
  }

  render();
};

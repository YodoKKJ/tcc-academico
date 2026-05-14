/* ── app.js — Roteador e navegação ──────────────────────────────────────── */

var NAV = [
  { route: 'dashboard',  label: 'Dashboard',   icon: 'dashboard', group: null },
  { group: 'Pessoas' },
  { route: 'alunos',     label: 'Alunos',      icon: 'alunos',     group: 'Pessoas' },
  { route: 'professores',label: 'Professores',  icon: 'professores',group: 'Pessoas' },
  { group: 'Acadêmico' },
  { route: 'series',     label: 'Séries',       icon: 'series',     group: 'Acadêmico' },
  { route: 'turmas',     label: 'Turmas',       icon: 'turmas',     group: 'Acadêmico' },
  { route: 'materias',   label: 'Matérias',     icon: 'materias',   group: 'Acadêmico' },
  { route: 'vinculos',   label: 'Vínculos',     icon: 'vinculos',   group: 'Acadêmico' },
  { group: 'Lançamentos' },
  { route: 'avaliacoes', label: 'Avaliações',   icon: 'avaliacoes', group: 'Lançamentos' },
  { route: 'notas',      label: 'Notas',        icon: 'notas',      group: 'Lançamentos' },
  { route: 'chamada',    label: 'Chamada',      icon: 'chamada',    group: 'Lançamentos' },
  { route: 'boletim',    label: 'Boletim',      icon: 'boletim',    group: 'Lançamentos' }
];

function getRoute() {
  var h = window.location.hash.replace('#','').replace('/','').trim();
  return h || 'dashboard';
}

function renderNav() {
  var current = getRoute();
  var nav = document.getElementById('sidebar-nav');
  var html = '';
  NAV.forEach(function(item) {
    if (item.group && !item.route) {
      html += '<div class="nav-group-label">'+item.group+'</div>';
    } else if (item.route) {
      var active = item.route === current ? ' active' : '';
      html += '<a class="nav-link'+active+'" href="#'+item.route+'">'
        + icon(item.icon, 14)
        + '<span>'+item.label+'</span>'
        + '</a>';
    }
  });
  nav.innerHTML = html;
}

function renderPage() {
  var route = getRoute();
  var container = document.getElementById('page');
  container.innerHTML = '';
  var fn = Pages[route];
  if (fn) {
    fn(container);
  } else {
    container.innerHTML = '<div class="page-header"><h1 class="page-title">Página não encontrada</h1></div>';
  }
  renderNav();
  window.scrollTo(0, 0);
}

/* Inicialização — chamada após o banco de dados estar pronto */
initDB().then(function() {
  document.getElementById('loading-screen').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
  renderPage();
  window.addEventListener('hashchange', renderPage);
}).catch(function(err) {
  document.getElementById('loading-screen').innerHTML =
    '<div class="loading-inner" style="color:var(--bad)">'
    + '<p>Erro ao iniciar o banco de dados.</p>'
    + '<p style="font-size:11px;margin-top:8px">'+String(err)+'</p>'
    + '<p style="font-size:11px;margin-top:4px">Verifique se há conexão com a internet (necessária para carregar o SQL.js).</p>'
    + '</div>';
});

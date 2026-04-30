const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  Header, Footer, PageNumber, LevelFormat, VerticalAlign,
} = require('docx');
const fs = require('fs');

// ──────────── helpers ────────────

const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const borders = { top: border, bottom: border, left: border, right: border };
const PAGE_W = 11906;   // A4 width  DXA
const MARGIN  = 1440;   // 1 inch each side
const CONTENT = PAGE_W - MARGIN * 2; // 9026 DXA

function cell(text, { bg, bold, width, align } = {}) {
  return new TableCell({
    borders,
    width: { size: width || 2256, type: WidthType.DXA },
    shading: bg ? { fill: bg, type: ShadingType.CLEAR } : undefined,
    margins: { top: 80, bottom: 80, left: 140, right: 140 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: align || AlignmentType.LEFT,
      children: [new TextRun({ text: String(text), bold: !!bold, size: 20, font: 'Arial' })],
    })],
  });
}

function headerRow(cols, widths) {
  return new TableRow({
    tableHeader: true,
    children: cols.map((c, i) =>
      cell(c, { bg: '1F5C99', bold: true, width: widths[i] })
    ),
  });
}

function dataRow(cols, widths, shade) {
  return new TableRow({
    children: cols.map((c, i) =>
      cell(c, { bg: shade ? 'F2F7FC' : 'FFFFFF', width: widths[i] })
    ),
  });
}

function entityTable(fields) {
  // cols: Campo | Tipo | Restrições | Descrição
  const W = [1500, 1800, 2226, 3500];
  const rows = [
    headerRow(['Campo', 'Tipo', 'Restrições', 'Descrição'], W),
    ...fields.map((f, i) => dataRow(f, W, i % 2 === 1)),
  ];
  return new Table({ width: { size: CONTENT, type: WidthType.DXA }, columnWidths: W, rows });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 },
    children: [new TextRun({ text, bold: true, size: 36, font: 'Arial', color: '1F5C99' })],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text, bold: true, size: 26, font: 'Arial', color: '2E75B6' })],
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, bold: true, size: 22, font: 'Arial', color: '2E75B6' })],
  });
}
function p(text, { bold, italic, size, color, spacing } = {}) {
  return new Paragraph({
    spacing: { before: 80, after: 80, ...(spacing || {}) },
    children: [new TextRun({ text, bold, italic, size: size || 22, font: 'Arial', color: color || '000000' })],
  });
}
function bullet(text, ref = 'bullets') {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, size: 22, font: 'Arial' })],
  });
}
function space(before = 120) {
  return new Paragraph({ spacing: { before, after: 0 }, children: [] });
}

// ──────────── entity definitions ────────────

const ENTITIES = [
  {
    title: '1. Tabela: series',
    desc: 'Armazena os níveis de ensino da instituição (ex: 1º Ano, 2º Ano, 3º Ano).',
    fields: [
      ['id',   'BIGSERIAL', 'PK, NOT NULL, AUTO', 'Identificador único gerado automaticamente'],
      ['nome', 'VARCHAR',   'NOT NULL, UNIQUE',    'Nome do nível de ensino (ex: "1º Ano")'],
    ],
  },
  {
    title: '2. Tabela: turmas',
    desc: 'Representa uma turma de alunos vinculada a uma série e a um ano letivo.',
    fields: [
      ['id',          'BIGSERIAL', 'PK, NOT NULL, AUTO',      'Identificador único'],
      ['nome',        'VARCHAR',   'NOT NULL',                 'Identificador da turma (ex: "9A", "1B")'],
      ['serie_id',    'BIGINT',    'FK → series.id, NOT NULL', 'Série à qual a turma pertence'],
      ['ano_letivo',  'INTEGER',   'NOT NULL',                 'Ano letivo (ex: 2024, 2025)'],
    ],
  },
  {
    title: '3. Tabela: materias',
    desc: 'Catálogo de disciplinas disponíveis na grade curricular.',
    fields: [
      ['id',   'BIGSERIAL', 'PK, NOT NULL, AUTO', 'Identificador único'],
      ['nome', 'VARCHAR',   'NOT NULL, UNIQUE',   'Nome da disciplina (ex: "Matemática", "Português")'],
    ],
  },
  {
    title: '4. Tabela: alunos',
    desc: 'Cadastro completo dos alunos matriculados na instituição.',
    fields: [
      ['id',               'BIGSERIAL', 'PK, NOT NULL, AUTO', 'Identificador único'],
      ['nome',             'VARCHAR',   'NOT NULL',            'Nome completo do aluno'],
      ['matricula',        'VARCHAR',   'UNIQUE',              'Código de matrícula institucional'],
      ['data_nascimento',  'DATE',      'NULL',                'Data de nascimento do aluno'],
      ['nome_pai',         'VARCHAR',   'NULL',                'Nome do pai ou responsável masculino'],
      ['nome_mae',         'VARCHAR',   'NULL',                'Nome da mãe ou responsável feminina'],
      ['telefone',         'VARCHAR',   'NULL',                'Telefone de contato'],
      ['email',            'VARCHAR',   'NULL',                'Endereço de e-mail'],
    ],
  },
  {
    title: '5. Tabela: professores',
    desc: 'Cadastro do corpo docente da instituição.',
    fields: [
      ['id',           'BIGSERIAL', 'PK, NOT NULL, AUTO', 'Identificador único'],
      ['nome',         'VARCHAR',   'NOT NULL',            'Nome completo do professor'],
      ['email',        'VARCHAR',   'NULL',                'Endereço de e-mail institucional'],
      ['telefone',     'VARCHAR',   'NULL',                'Telefone de contato'],
      ['especialidade','VARCHAR',   'NULL',                'Área de formação ou especialização'],
    ],
  },
  {
    title: '6. Tabela: aluno_turma',
    desc: 'Tabela de junção N:N que registra a matrícula de um aluno em uma turma. A chave primária é composta pelos dois campos estrangeiros.',
    fields: [
      ['aluno_id', 'BIGINT', 'PK (composta), FK → alunos.id',  'Referência ao aluno matriculado'],
      ['turma_id', 'BIGINT', 'PK (composta), FK → turmas.id',  'Referência à turma de destino'],
    ],
  },
  {
    title: '7. Tabela: professor_turma_materia',
    desc: 'Tabela de junção ternária que define qual professor leciona qual matéria em qual turma. Uma constraint UNIQUE impede duplicatas.',
    fields: [
      ['id',           'BIGSERIAL', 'PK, NOT NULL, AUTO',              'Identificador único'],
      ['professor_id', 'BIGINT',    'FK → professores.id, NOT NULL',   'Professor responsável'],
      ['turma_id',     'BIGINT',    'FK → turmas.id, NOT NULL',        'Turma onde leciona'],
      ['materia_id',   'BIGINT',    'FK → materias.id, NOT NULL',      'Disciplina lecionada'],
    ],
  },
  {
    title: '8. Tabela: avaliacoes',
    desc: 'Registra as avaliações aplicadas (provas, trabalhos, simulados e recuperações) com seus metadados.',
    fields: [
      ['id',              'BIGSERIAL',    'PK, NOT NULL, AUTO',          'Identificador único'],
      ['turma_id',        'BIGINT',       'FK → turmas.id, NOT NULL',    'Turma avaliada'],
      ['materia_id',      'BIGINT',       'FK → materias.id, NOT NULL',  'Disciplina avaliada'],
      ['tipo',            'VARCHAR',      'NOT NULL',                     'PROVA | TRABALHO | SIMULADO | RECUPERACAO'],
      ['descricao',       'VARCHAR',      'NULL',                         'Descrição livre (ex: "Prova de Álgebra")'],
      ['data_aplicacao',  'DATE',         'NOT NULL',                     'Data de aplicação da avaliação'],
      ['peso',            'NUMERIC(5,2)', 'NOT NULL',                     'Peso no cálculo da média ponderada'],
      ['bimestre',        'INTEGER',      'NOT NULL',                     'Bimestre letivo (1 a 4)'],
    ],
  },
  {
    title: '9. Tabela: notas',
    desc: 'Armazena a nota de cada aluno em cada avaliação. A constraint UNIQUE garante no máximo uma nota por aluno por avaliação.',
    fields: [
      ['id',            'BIGSERIAL',    'PK, NOT NULL, AUTO',                'Identificador único'],
      ['avaliacao_id',  'BIGINT',       'FK → avaliacoes.id, NOT NULL',      'Avaliação referenciada'],
      ['aluno_id',      'BIGINT',       'FK → alunos.id, NOT NULL',          'Aluno avaliado'],
      ['valor',         'NUMERIC(5,2)', 'NOT NULL',                          'Valor da nota (0,00 a 10,00)'],
      ['lancado_em',    'TIMESTAMP',    'NULL',                              'Data e hora do lançamento'],
    ],
  },
  {
    title: '10. Tabela: presencas',
    desc: 'Registra a frequência diária de cada aluno por matéria. A constraint UNIQUE evita duplicatas para a mesma data.',
    fields: [
      ['id',          'BIGSERIAL', 'PK, NOT NULL, AUTO',             'Identificador único'],
      ['aluno_id',    'BIGINT',    'FK → alunos.id, NOT NULL',       'Aluno referenciado'],
      ['turma_id',    'BIGINT',    'FK → turmas.id, NOT NULL',       'Turma da aula'],
      ['materia_id',  'BIGINT',    'FK → materias.id, NOT NULL',     'Disciplina da aula'],
      ['data',        'DATE',      'NOT NULL',                       'Data da aula registrada'],
      ['presente',    'BOOLEAN',   'NOT NULL',                       'TRUE = presente, FALSE = ausente'],
    ],
  },
];

// ──────────── ER diagram table ────────────

function erTable() {
  const W = [3500, 1200, 3500];
  const rows = [
    headerRow(['Entidade de Origem', 'Cardinalidade', 'Entidade de Destino'], W),
    dataRow(['series', '1 : N', 'turmas'], W, false),
    dataRow(['alunos', 'N : N  (via aluno_turma)', 'turmas'], W, true),
    dataRow(['professores', 'N : N : N  (via professor_turma_materia)', 'turmas + materias'], W, false),
    dataRow(['turmas + materias', 'N : 1', 'avaliacoes'], W, true),
    dataRow(['avaliacoes + alunos', 'N : 1', 'notas'], W, false),
    dataRow(['alunos + turmas + materias', 'N : 1', 'presencas'], W, true),
  ];
  return new Table({ width: { size: CONTENT, type: WidthType.DXA }, columnWidths: W, rows });
}

// ──────────── info box (colored paragraph) ────────────

function infoBox(lines, bg = 'EBF3FB') {
  const W = [CONTENT];
  const rows = [
    new TableRow({
      children: [
        new TableCell({
          borders,
          width: { size: CONTENT, type: WidthType.DXA },
          shading: { fill: bg, type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 200, right: 200 },
          children: lines.map(l => new Paragraph({
            spacing: { before: 40, after: 40 },
            children: [new TextRun({ text: l, size: 20, font: 'Arial', color: '1A3A5C' })],
          })),
        }),
      ],
    }),
  ];
  return new Table({ width: { size: CONTENT, type: WidthType.DXA }, columnWidths: W, rows });
}

// ──────────── document assembly ────────────

const children = [

  // ── CAPA ──
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 2880, after: 280 },
    children: [new TextRun({ text: 'Modelagem do Banco de Dados', bold: true, size: 52, font: 'Arial', color: '1F5C99' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 160 },
    children: [new TextRun({ text: 'Sistema Acadêmico Escolar', bold: true, size: 36, font: 'Arial', color: '2E75B6' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 80 },
    children: [new TextRun({ text: 'Trabalho de Conclusão de Curso', size: 24, font: 'Arial', color: '555555' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 2400 },
    children: [new TextRun({ text: `Versão 1.0  —  ${new Date().getFullYear()}`, size: 22, font: 'Arial', color: '888888', italic: true })],
  }),

  // ── 1. INTRODUÇÃO ──
  h1('1. Introdução'),
  p('O Sistema Acadêmico utiliza o PostgreSQL como sistema gerenciador de banco de dados relacional (SGBD). O mapeamento entre os objetos Java e as tabelas do banco é realizado pelo framework JPA/Hibernate, integrado ao Spring Boot 3.2.5 por meio do módulo Spring Data JPA.'),
  space(80),
  p('A criação e atualização das tabelas é feita automaticamente pelo Hibernate através da propriedade ddl-auto=update, o que significa que nenhuma ferramenta de migração manual (como Flyway ou Liquibase) é necessária: ao iniciar a aplicação, o Hibernate compara as entidades Java com o schema existente no banco e aplica as alterações necessárias.'),
  space(80),
  p('O modelo de dados foi projetado para atender aos requisitos de um sistema acadêmico escolar completo, abrangendo:'),
  bullet('Cadastro de séries, turmas, disciplinas, alunos e professores'),
  bullet('Matrícula de alunos em turmas e atribuição de professores a disciplinas'),
  bullet('Registro e controle de avaliações e notas com pesos por bimestre'),
  bullet('Controle de frequência (chamada) diária por disciplina'),
  bullet('Geração de boletim com cálculo de média ponderada e situação final'),
  space(160),

  // ── 2. VISÃO GERAL ──
  h1('2. Visão Geral do Schema'),
  p('O banco de dados é composto por 10 tabelas relacionadas entre si. A tabela a seguir resume as entidades principais e suas responsabilidades:'),
  space(80),
  (() => {
    const W = [2400, 6626];
    return new Table({
      width: { size: CONTENT, type: WidthType.DXA },
      columnWidths: W,
      rows: [
        headerRow(['Tabela', 'Responsabilidade'], W),
        dataRow(['series',                  'Níveis de ensino (1º Ano, 2º Ano, etc.)'], W, false),
        dataRow(['turmas',                  'Grupos de alunos por série e ano letivo'], W, true),
        dataRow(['materias',                'Catálogo de disciplinas do currículo'], W, false),
        dataRow(['alunos',                  'Dados cadastrais dos estudantes'], W, true),
        dataRow(['professores',             'Dados cadastrais do corpo docente'], W, false),
        dataRow(['aluno_turma',             'Matrícula de alunos em turmas (N:N)'], W, true),
        dataRow(['professor_turma_materia', 'Atribuição de professores a turmas/disciplinas (N:N:N)'], W, false),
        dataRow(['avaliacoes',              'Provas, trabalhos, simulados e recuperações'], W, true),
        dataRow(['notas',                   'Notas dos alunos em cada avaliação'], W, false),
        dataRow(['presencas',               'Registro diário de frequência por disciplina'], W, true),
      ],
    });
  })(),
  space(160),

  // ── 3. TABELAS ──
  h1('3. Descrição Detalhada das Tabelas'),

  // entidades
  ...ENTITIES.flatMap(({ title, desc, fields }) => [
    space(120),
    h3(title),
    p(desc),
    space(60),
    entityTable(fields),
  ]),
  space(160),

  // ── 4. RELACIONAMENTOS ──
  h1('4. Relacionamentos entre Tabelas'),
  p('O diagrama a seguir representa, em formato textual, os relacionamentos e cardinalidades entre as entidades do sistema:'),
  space(80),
  erTable(),
  space(120),
  p('Detalhamento dos principais relacionamentos:'),
  space(60),
  bullet('series → turmas (1:N): Uma série pode conter várias turmas, mas cada turma pertence a exatamente uma série.'),
  bullet('alunos ↔ turmas (N:N via aluno_turma): Um aluno pode estar matriculado em várias turmas (ex: turmas de anos diferentes), e uma turma possui vários alunos.'),
  bullet('professores ↔ turmas ↔ materias (N:N:N via professor_turma_materia): Um professor pode lecionar diferentes disciplinas em diferentes turmas. A tabela ternária garante que a combinação (professor, turma, matéria) seja única.'),
  bullet('turmas + materias → avaliacoes (N:1): Uma avaliação está associada a uma única turma e a uma única disciplina, mas uma turma pode ter muitas avaliações.'),
  bullet('avaliacoes + alunos → notas (N:1): Uma nota referencia exatamente uma avaliação e exatamente um aluno. A constraint UNIQUE (avaliacao_id, aluno_id) impede duplicatas.'),
  bullet('alunos + turmas + materias → presencas (N:1): Cada registro de presença é associado a um aluno, uma turma e uma disciplina em uma data específica. A constraint UNIQUE impede registros duplicados para a mesma data.'),
  space(160),

  // ── 5. LÓGICA DE NEGÓCIO ──
  h1('5. Lógica de Negócio Implementada no Backend'),
  p('Por decisão arquitetural, toda a lógica de cálculo foi implementada na camada de serviço (Java/Spring), e não no banco de dados. Essa abordagem simplifica a manutenção, facilita testes unitários e evita stored procedures difíceis de versionar.'),
  space(80),

  h2('5.1 Cálculo de Média Bimestral'),
  p('A média de cada bimestre é calculada como uma média ponderada das notas das avaliações do tipo PROVA e TRABALHO:'),
  space(60),
  infoBox([
    'Média Bimestral = Σ (valor × peso) / Σ peso',
    '',
    'Onde: valor = nota do aluno | peso = campo peso da tabela avaliacoes',
  ]),
  space(80),
  p('O tipo SIMULADO recebe tratamento especial: seu valor (entre 0 e 1) é somado diretamente à média como bônus, limitado ao máximo de +1,0 ponto, sem ultrapassar a nota 10,0.'),
  p('O tipo RECUPERACAO substitui a média bimestral caso o valor da recuperação seja superior à média original calculada.'),
  space(80),

  h2('5.2 Média Anual e Situação Final'),
  p('A média anual é calculada como a média aritmética das médias dos quatro bimestres. A situação final do aluno é determinada por duas condições simultâneas:'),
  space(60),
  infoBox([
    'Aprovado: Média Anual >= 6,0  E  Frequência >= 75%',
    'Reprovado: Média Anual < 6,0  OU  Frequência < 75%',
  ], 'FDEBD1'),
  space(80),

  h2('5.3 Cálculo de Frequência'),
  p('A frequência é calculada a partir dos registros da tabela presencas para o aluno, turma e disciplina em questão:'),
  space(60),
  infoBox([
    'Frequência (%) = (registros com presente = TRUE) / (total de registros) × 100',
    '',
    'Arredondada para 1 casa decimal.',
  ]),
  space(160),

  // ── 6. ER SIMPLIFICADO ──
  h1('6. Representação do Diagrama ER'),
  p('O diagrama Entidade-Relacionamento do sistema pode ser representado da seguinte forma. As chaves (PK/FK) e cardinalidades estão indicadas:'),
  space(80),
  infoBox([
    'series (PK: id)',
    '   └─── turmas (PK: id | FK: serie_id)',
    '',
    'alunos (PK: id)',
    '   └──< aluno_turma >── turmas',
    '         (PK composta: aluno_id + turma_id)',
    '',
    'professores (PK: id)',
    '   └──< professor_turma_materia >── turmas + materias',
    '         (PK: id | UK: professor_id + turma_id + materia_id)',
    '',
    'turmas ──┐',
    '          ├──< avaliacoes (PK: id | FK: turma_id, materia_id)',
    'materias ─┘         └──< notas (PK: id | UK: avaliacao_id + aluno_id)',
    '                           └── alunos',
    '',
    'alunos + turmas + materias ──< presencas',
    '                               (PK: id | UK: aluno_id + turma_id + materia_id + data)',
  ]),
  space(160),

  // ── 7. TECNOLOGIAS ──
  h1('7. Tecnologias e Anotações Utilizadas'),
  space(40),
  (() => {
    const W = [3000, 6026];
    return new Table({
      width: { size: CONTENT, type: WidthType.DXA },
      columnWidths: W,
      rows: [
        headerRow(['Tecnologia / Anotação', 'Função'], W),
        dataRow(['PostgreSQL 15+',        'SGBD relacional utilizado em produção e desenvolvimento'], W, false),
        dataRow(['Spring Boot 3.2.5',     'Framework principal da aplicação backend'], W, true),
        dataRow(['Spring Data JPA',       'Abstração de repositórios e integração JPA/Hibernate'], W, false),
        dataRow(['Hibernate 6 (ORM)',     'Mapeamento objeto-relacional e geração do schema (ddl-auto=update)'], W, true),
        dataRow(['@Entity / @Table',      'Marca a classe Java como entidade mapeada a uma tabela'], W, false),
        dataRow(['@Id / @GeneratedValue', 'Define a chave primária e sua estratégia de geração (IDENTITY)'], W, true),
        dataRow(['@ManyToOne / @JoinColumn', 'Define relacionamentos N:1 com chave estrangeira'], W, false),
        dataRow(['@EmbeddedId',           'Chave primária composta (usada em aluno_turma)'], W, true),
        dataRow(['@UniqueConstraint',     'Garante unicidade em combinações de campos (usado em notas, presencas, professor_turma_materia)'], W, false),
      ],
    });
  })(),
  space(160),

  // ── 8. CONCLUSÃO ──
  h1('8. Conclusão'),
  p('O modelo relacional escolhido para o Sistema Acadêmico demonstra-se adequado e robusto para os requisitos de uma instituição escolar. As principais vantagens dessa modelagem são:'),
  space(60),
  bullet('Integridade referencial: as chaves estrangeiras garantem consistência entre os dados, impedindo, por exemplo, a existência de uma nota sem uma avaliação válida ou de uma turma sem série associada.'),
  bullet('Normalização: o schema está na Terceira Forma Normal (3FN), eliminando redundâncias e anomalias de atualização.'),
  bullet('Flexibilidade: o modelo suporta múltiplos tipos de avaliação (PROVA, TRABALHO, SIMULADO, RECUPERACAO) e permite pesos diferenciados, atendendo a diferentes metodologias pedagógicas.'),
  bullet('Escalabilidade: a separação entre alunos, professores e suas atribuições facilita o crescimento do sistema sem necessidade de reestruturação do schema.'),
  bullet('Rastreabilidade: o campo lancado_em na tabela notas e o campo data na tabela presencas permitem auditoria histórica dos registros.'),
  space(80),
  p('Em conjunto com o framework Spring Boot e o ORM Hibernate, esse modelo proporciona uma base sólida para o desenvolvimento de um sistema de gestão acadêmica confiável, de fácil manutenção e pronto para evoluir conforme as necessidades da instituição.', { color: '333333' }),
];

// ──────────── build document ────────────

const doc = new Document({
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: '•',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
    ],
  },
  styles: {
    default: {
      document: { run: { font: 'Arial', size: 22 } },
    },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: 'Arial', color: '1F5C99' },
        paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 0 },
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Arial', color: '2E75B6' },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 },
      },
      {
        id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, font: 'Arial', color: '2E75B6' },
        paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 },
      },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: PAGE_W, height: 16838 },
        margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '2E75B6', space: 4 } },
          children: [new TextRun({ text: 'Sistema Acadêmico — Modelagem do Banco de Dados', size: 18, font: 'Arial', color: '888888' })],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: '2E75B6', space: 4 } },
          children: [
            new TextRun({ text: 'Página ', size: 18, font: 'Arial', color: '888888' }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, font: 'Arial', color: '888888' }),
            new TextRun({ text: ' de ', size: 18, font: 'Arial', color: '888888' }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, font: 'Arial', color: '888888' }),
          ],
        })],
      }),
    },
    children,
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('C:/Users/Admin/IdeaProjects/Java10x/tcc-academico/docs/banco_de_dados.docx', buf);
  console.log('OK: banco_de_dados.docx gerado');
}).catch(e => { console.error(e); process.exit(1); });

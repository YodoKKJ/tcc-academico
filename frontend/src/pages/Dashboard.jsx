import { useEffect, useState } from 'react'
import api from '../api.js'
import Icon from '../components/Icon.jsx'

const METRICS = [
  { key: 'totalAlunos',      label: 'Alunos',      icon: 'users' },
  { key: 'totalProfessores', label: 'Professores',  icon: 'school' },
  { key: 'totalTurmas',      label: 'Turmas',       icon: 'book' },
  { key: 'totalMaterias',    label: 'Matérias',     icon: 'clipboard' },
]

export default function Dashboard() {
  const [data, setData] = useState({})

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data)).catch(() => {})
  }, [])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Sistema Acadêmico</div>
          <h1 className="page-title">Dashboard</h1>
          <div className="page-subtitle">Visão geral da instituição de ensino</div>
        </div>
      </div>

      <div className="grid g-4 mb-4">
        {METRICS.map(m => (
          <div key={m.key} className="card kpi">
            <div className="label">{m.label}</div>
            <div className="value">{data[m.key] ?? '—'}</div>
            <div className="delta">
              <Icon name={m.icon} size={12} />
              cadastrados no sistema
            </div>
          </div>
        ))}
      </div>

      {data.totalAvaliacoes != null && (
        <div className="grid g-4 mb-4">
          <div className="card kpi">
            <div className="label">Avaliações</div>
            <div className="value">{data.totalAvaliacoes}</div>
            <div className="delta"><Icon name="chart" size={12} /> criadas</div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="card-title">Como começar</div>
        </div>
        <ol style={{ margin: 0, paddingLeft: 20, color: 'var(--ink-2)', fontSize: 13, lineHeight: 2.2 }}>
          <li>Cadastre as <strong>Séries</strong> em Acadêmico → Séries (ex: 1º Ano, 2º Ano)</li>
          <li>Crie as <strong>Turmas</strong> vinculadas às séries</li>
          <li>Cadastre as <strong>Matérias</strong> do currículo</li>
          <li>Cadastre <strong>Alunos</strong> e <strong>Professores</strong> em Pessoas</li>
          <li>Use <strong>Vínculos</strong> para matricular alunos e atribuir professores às matérias</li>
          <li>Crie <strong>Avaliações</strong> e lance as <strong>Notas</strong> em Lançamentos</li>
          <li>Registre a <strong>Chamada</strong> diária e consulte o <strong>Boletim</strong></li>
        </ol>
      </div>
    </div>
  )
}

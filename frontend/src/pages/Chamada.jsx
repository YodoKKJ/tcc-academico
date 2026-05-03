import { useEffect, useState } from 'react'
import api from '../api.js'
import Icon from '../components/Icon.jsx'

export default function Chamada() {
  const [turmas, setTurmas] = useState([])
  const [materias, setMaterias] = useState([])
  const [alunos, setAlunos] = useState([])
  const [selTurma, setSelTurma] = useState('')
  const [selMateria, setSelMateria] = useState('')
  const [data, setData] = useState(new Date().toISOString().slice(0, 10))
  const [chamada, setChamada] = useState({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    api.get('/turmas').then(r => setTurmas(r.data))
    api.get('/materias').then(r => setMaterias(r.data))
  }, [])

  const onTurmaChange = tid => {
    setSelTurma(tid); setAlunos([]); setChamada({})
    if (!tid) return
    api.get('/vinculos/aluno-turma/' + tid).then(r => {
      const als = r.data.map(v => v.aluno)
      setAlunos(als)
      const map = {}
      als.forEach(a => { map[a.id] = true })
      setChamada(map)
    })
  }

  const loadChamadaExistente = async () => {
    if (!selTurma || !selMateria || !data) return
    const res = await api.get(`/presencas/turma/${selTurma}/materia/${selMateria}`, { params: { data } })
      .then(r => r.data).catch(() => [])
    if (res.length > 0) {
      const map = {}
      res.forEach(r => { map[r.alunoId] = r.presente })
      setChamada(prev => ({ ...prev, ...map }))
    }
  }

  useEffect(() => { loadChamadaExistente() }, [selMateria, data])

  const toggle = alunoId => setChamada(p => ({ ...p, [alunoId]: !p[alunoId] }))
  const marcarTodos = v => {
    const map = {}
    alunos.forEach(a => { map[a.id] = v })
    setChamada(map)
  }

  const save = async () => {
    if (!selTurma || !selMateria || !data) return
    setSaving(true); setMsg('')
    await api.post('/presencas/lancar', {
      turmaId: Number(selTurma), materiaId: Number(selMateria), data, chamada,
    })
    setSaving(false)
    setMsg('Chamada salva!')
    setTimeout(() => setMsg(''), 3000)
  }

  const presentes = Object.values(chamada).filter(Boolean).length
  const total = alunos.length

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Lançamentos · Chamada</div>
          <h1 className="page-title">Chamada / Frequência</h1>
          <div className="page-subtitle">Registre a presença dos alunos por aula</div>
        </div>
      </div>

      <div className="card mb-4" style={{ padding: 18 }}>
        <div className="row" style={{ gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="field" style={{ margin: 0, minWidth: 200 }}>
            <label>Turma</label>
            <select className="select" value={selTurma} onChange={e => onTurmaChange(e.target.value)}>
              <option value="">Selecione…</option>
              {turmas.map(t => <option key={t.id} value={t.id}>{t.nome} ({t.serie?.nome})</option>)}
            </select>
          </div>
          <div className="field" style={{ margin: 0, minWidth: 180 }}>
            <label>Matéria</label>
            <select className="select" value={selMateria} onChange={e => setSelMateria(e.target.value)} disabled={!selTurma}>
              <option value="">Selecione…</option>
              {materias.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Data</label>
            <input className="input" type="date" value={data} onChange={e => setData(e.target.value)} style={{ width: 160 }} />
          </div>
        </div>
      </div>

      {selTurma && selMateria && alunos.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="section-head">
            <div className="row" style={{ gap: 12 }}>
              <div className="t">Chamada — {data}</div>
              <span className="pill ok">
                <span className="dot" />
                {presentes}/{total} presentes
              </span>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <button className="btn sm" type="button" onClick={() => marcarTodos(true)}>
                <Icon name="check" size={11} /> Todos presentes
              </button>
              <button className="btn sm" type="button" style={{ color: 'var(--bad)' }} onClick={() => marcarTodos(false)}>
                <Icon name="x" size={11} /> Todos ausentes
              </button>
              {msg && <span style={{ color: 'var(--ok)', fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-mono)' }}>{msg}</span>}
              <button className="btn accent" type="button" onClick={save} disabled={saving}>
                <Icon name="check" size={13} /> {saving ? 'Salvando…' : 'Salvar chamada'}
              </button>
            </div>
          </div>
          <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 }}>
            {alunos.map(aluno => {
              const presente = chamada[aluno.id] !== false
              return (
                <div
                  key={aluno.id}
                  onClick={() => toggle(aluno.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', borderRadius: 'var(--r-md)',
                    cursor: 'pointer', userSelect: 'none',
                    border: `1.5px solid ${presente ? 'var(--ok)' : 'var(--bad)'}`,
                    background: presente ? 'var(--ok-soft)' : 'var(--bad-soft)',
                    transition: 'all .12s',
                  }}
                >
                  <Icon
                    name={presente ? 'check' : 'x'}
                    size={16}
                    style={{ color: presente ? 'var(--ok)' : 'var(--bad)', flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 500, color: presente ? 'var(--ok)' : 'var(--bad)' }}>
                    {aluno.nome}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {selTurma && selMateria && alunos.length === 0 && (
        <div className="empty">
          <div className="t">Nenhum aluno matriculado nesta turma</div>
          <div className="s">ACESSE VÍNCULOS PARA MATRICULAR ALUNOS</div>
        </div>
      )}

      {(!selTurma || !selMateria) && (
        <div className="empty">
          <div className="t">Selecione turma e matéria</div>
          <div className="s">PARA REGISTRAR A CHAMADA</div>
        </div>
      )}
    </div>
  )
}

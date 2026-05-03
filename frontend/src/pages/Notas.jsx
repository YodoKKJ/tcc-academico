import { useEffect, useState } from 'react'
import api from '../api.js'
import Icon from '../components/Icon.jsx'

export default function Notas() {
  const [turmas, setTurmas] = useState([])
  const [materias, setMaterias] = useState([])
  const [avaliacoes, setAvaliacoes] = useState([])
  const [alunos, setAlunos] = useState([])
  const [notasMap, setNotasMap] = useState({})
  const [selTurma, setSelTurma] = useState('')
  const [selMateria, setSelMateria] = useState('')
  const [selAval, setSelAval] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    api.get('/turmas').then(r => setTurmas(r.data))
    api.get('/materias').then(r => setMaterias(r.data))
  }, [])

  const onTurmaChange = tid => {
    setSelTurma(tid); setSelMateria(''); setSelAval(''); setAlunos([]); setAvaliacoes([]); setNotasMap({})
    if (tid) api.get('/vinculos/aluno-turma/' + tid).then(r => setAlunos(r.data.map(v => v.aluno)))
  }

  const onMateriaChange = mid => {
    setSelMateria(mid); setSelAval(''); setNotasMap({})
    if (selTurma && mid)
      api.get('/avaliacoes', { params: { turmaId: selTurma, materiaId: mid } }).then(r => setAvaliacoes(r.data))
  }

  const onAvalChange = async avId => {
    setSelAval(avId); setNotasMap({})
    if (!avId) return
    const notas = await api.get(`/notas/avaliacao/${avId}`).then(r => r.data)
    const map = {}
    notas.forEach(n => { map[n.aluno.id] = n.valor })
    setNotasMap(map)
  }

  const save = async () => {
    if (!selAval) return
    setSaving(true); setMsg('')
    for (const [alunoId, valor] of Object.entries(notasMap)) {
      if (valor !== '' && valor !== undefined) {
        await api.post('/notas/lancar', {
          avaliacaoId: Number(selAval), alunoId: Number(alunoId), valor: Number(valor),
        })
      }
    }
    setSaving(false)
    setMsg('Notas salvas!')
    setTimeout(() => setMsg(''), 3000)
  }

  const avalSelected = avaliacoes.find(a => a.id === Number(selAval))

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Lançamentos · Notas</div>
          <h1 className="page-title">Lançamento de Notas</h1>
          <div className="page-subtitle">Registre as notas por turma, matéria e avaliação</div>
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
            <select className="select" value={selMateria} onChange={e => onMateriaChange(e.target.value)} disabled={!selTurma}>
              <option value="">Selecione…</option>
              {materias.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </div>
          <div className="field" style={{ margin: 0, minWidth: 220 }}>
            <label>Avaliação</label>
            <select className="select" value={selAval} onChange={e => onAvalChange(e.target.value)} disabled={!selMateria}>
              <option value="">Selecione…</option>
              {avaliacoes.map(a => <option key={a.id} value={a.id}>{a.descricao || a.tipo} — {a.bimestre}º Bim</option>)}
            </select>
          </div>
        </div>
      </div>

      {selAval && alunos.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="section-head">
            <div>
              <div className="t">{avalSelected?.descricao || avalSelected?.tipo} — {avalSelected?.bimestre}º Bimestre</div>
              <div className="s">Peso: {avalSelected?.peso} · {alunos.length} alunos</div>
            </div>
            <div className="row" style={{ gap: 10 }}>
              {msg && <span style={{ color: 'var(--ok)', fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-mono)' }}>{msg}</span>}
              <button className="btn accent" type="button" onClick={save} disabled={saving}>
                <Icon name="check" size={13} /> {saving ? 'Salvando…' : 'Salvar notas'}
              </button>
            </div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Aluno</th>
                <th style={{ width: 140, textAlign: 'center' }}>Nota (0 – 10)</th>
              </tr>
            </thead>
            <tbody>
              {alunos.map(aluno => (
                <tr key={aluno.id}>
                  <td className="strong">{aluno.nome}</td>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="number"
                      min="0" max="10" step="0.1"
                      className="input"
                      style={{ width: 90, textAlign: 'center' }}
                      value={notasMap[aluno.id] ?? ''}
                      onChange={e => setNotasMap(p => ({ ...p, [aluno.id]: e.target.value }))}
                      placeholder="—"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selAval && alunos.length === 0 && (
        <div className="empty">
          <div className="t">Nenhum aluno matriculado nesta turma</div>
          <div className="s">ACESSE VÍNCULOS PARA MATRICULAR ALUNOS</div>
        </div>
      )}

      {!selAval && (
        <div className="empty">
          <div className="t">Selecione turma, matéria e avaliação</div>
          <div className="s">PARA LANÇAR AS NOTAS</div>
        </div>
      )}
    </div>
  )
}

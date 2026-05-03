import { useEffect, useState } from 'react'
import api from '../api.js'
import Icon from '../components/Icon.jsx'

export default function Vinculos() {
  const [tab, setTab] = useState('aluno')
  const [turmas, setTurmas] = useState([])
  const [alunos, setAlunos] = useState([])
  const [professores, setProfessores] = useState([])
  const [materias, setMaterias] = useState([])
  const [selTurma, setSelTurma] = useState('')
  const [vincAT, setVincAT] = useState([])
  const [vincPTM, setVincPTM] = useState([])
  const [addAlunoId, setAddAlunoId] = useState('')
  const [addProfId, setAddProfId] = useState('')
  const [addMatId, setAddMatId] = useState('')
  const [busy, setBusy] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    api.get('/turmas').then(r => setTurmas(r.data))
    api.get('/alunos').then(r => setAlunos(r.data))
    api.get('/professores').then(r => setProfessores(r.data))
    api.get('/materias').then(r => setMaterias(r.data))
  }, [])

  const loadVincAT = tid => api.get(`/vinculos/aluno-turma/${tid}`).then(r => setVincAT(r.data))
  const loadVincPTM = tid => api.get(`/vinculos/professor-turma-materia/${tid}`).then(r => setVincPTM(r.data))

  const onTurmaChange = tid => {
    setSelTurma(tid); setVincAT([]); setVincPTM([]); setErro('')
    if (!tid) return
    loadVincAT(tid)
    loadVincPTM(tid)
  }

  const vincularAluno = async () => {
    if (!selTurma || !addAlunoId) return
    setBusy(true); setErro('')
    try {
      await api.post('/vinculos/aluno-turma', { alunoId: Number(addAlunoId), turmaId: Number(selTurma) })
      setAddAlunoId('')
      loadVincAT(selTurma)
    } catch (err) {
      setErro(err.response?.data || 'Erro ao vincular aluno.')
    } finally { setBusy(false) }
  }

  const desvincularAluno = async alunoId => {
    setBusy(true); setErro('')
    try {
      await api.delete('/vinculos/aluno-turma', { params: { alunoId, turmaId: selTurma } })
      loadVincAT(selTurma)
    } catch { setErro('Erro ao remover.') }
    finally { setBusy(false) }
  }

  const vincularPTM = async () => {
    if (!selTurma || !addProfId || !addMatId) return
    setBusy(true); setErro('')
    try {
      await api.post('/vinculos/professor-turma-materia', {
        professorId: Number(addProfId), turmaId: Number(selTurma), materiaId: Number(addMatId),
      })
      setAddProfId(''); setAddMatId('')
      loadVincPTM(selTurma)
    } catch (err) {
      setErro(err.response?.data || 'Erro ao vincular professor.')
    } finally { setBusy(false) }
  }

  const desvincularPTM = async id => {
    setBusy(true); setErro('')
    try {
      await api.delete(`/vinculos/professor-turma-materia/${id}`)
      loadVincPTM(selTurma)
    } catch { setErro('Erro ao remover.') }
    finally { setBusy(false) }
  }

  const alunosDisponiveis = alunos.filter(a => !vincAT.some(v => v.aluno?.id === a.id))
  const turmaSelecionada = turmas.find(t => t.id === Number(selTurma))

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Acadêmico · Vínculos</div>
          <h1 className="page-title">Vínculos</h1>
          <div className="page-subtitle">Matricule alunos e atribua professores às turmas</div>
        </div>
      </div>

      <div className="card mb-4" style={{ padding: 18 }}>
        <div className="field" style={{ margin: 0 }}>
          <label>Turma</label>
          <select className="select" style={{ maxWidth: 380 }} value={selTurma} onChange={e => onTurmaChange(e.target.value)}>
            <option value="">Selecione uma turma…</option>
            {turmas.map(t => (
              <option key={t.id} value={t.id}>{t.nome} — {t.serie?.nome} ({t.anoLetivo})</option>
            ))}
          </select>
        </div>
      </div>

      {selTurma && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="section-head">
            <div>
              <div className="t">{turmaSelecionada?.nome}</div>
              <div className="s">{turmaSelecionada?.serie?.nome} · {turmaSelecionada?.anoLetivo}</div>
            </div>
            {erro && <span style={{ fontSize: 12, color: 'var(--bad)' }}>{erro}</span>}
          </div>

          <div className="drawer-tabs">
            <button type="button" className={tab === 'aluno' ? 'on' : ''} onClick={() => setTab('aluno')}>
              Alunos matriculados ({vincAT.length})
            </button>
            <button type="button" className={tab === 'prof' ? 'on' : ''} onClick={() => setTab('prof')}>
              Professores / Matérias ({vincPTM.length})
            </button>
          </div>

          {tab === 'aluno' && (
            <>
              <div style={{ padding: 14, borderBottom: '1px solid var(--line)', display: 'flex', gap: 8 }}>
                <select className="select" style={{ flex: 1 }} value={addAlunoId} onChange={e => setAddAlunoId(e.target.value)}>
                  <option value="">Adicionar aluno…</option>
                  {alunosDisponiveis.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                </select>
                <button className="btn accent" type="button" onClick={vincularAluno} disabled={busy || !addAlunoId}>
                  <Icon name="plus" /> Matricular
                </button>
              </div>
              {vincAT.length === 0 ? (
                <div style={{ padding: '24px 18px', color: 'var(--ink-3)', fontSize: 13, textAlign: 'center' }}>Nenhum aluno matriculado.</div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Aluno</th>
                      <th>Matrícula</th>
                      <th style={{ width: 100 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {vincAT.map((v, i) => (
                      <tr key={v.aluno?.id ?? i}>
                        <td className="strong">{v.aluno?.nome}</td>
                        <td className="num">{v.aluno?.matricula || '—'}</td>
                        <td>
                          <button className="btn sm" type="button" style={{ color: 'var(--bad)' }} onClick={() => desvincularAluno(v.aluno?.id)} disabled={busy}>
                            <Icon name="x" size={11} /> Remover
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {tab === 'prof' && (
            <>
              <div style={{ padding: 14, borderBottom: '1px solid var(--line)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <select className="select" style={{ flex: 1, minWidth: 180 }} value={addProfId} onChange={e => setAddProfId(e.target.value)}>
                  <option value="">Professor…</option>
                  {professores.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
                <select className="select" style={{ flex: 1, minWidth: 180 }} value={addMatId} onChange={e => setAddMatId(e.target.value)}>
                  <option value="">Matéria…</option>
                  {materias.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                </select>
                <button className="btn accent" type="button" onClick={vincularPTM} disabled={busy || !addProfId || !addMatId}>
                  <Icon name="plus" /> Vincular
                </button>
              </div>
              {vincPTM.length === 0 ? (
                <div style={{ padding: '24px 18px', color: 'var(--ink-3)', fontSize: 13, textAlign: 'center' }}>Nenhum professor vinculado.</div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Professor</th>
                      <th>Matéria</th>
                      <th style={{ width: 100 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {vincPTM.map((v, i) => (
                      <tr key={v.id ?? i}>
                        <td className="strong">{v.professor?.nome}</td>
                        <td>{v.materia?.nome}</td>
                        <td>
                          <button className="btn sm" type="button" style={{ color: 'var(--bad)' }} onClick={() => desvincularPTM(v.id)} disabled={busy}>
                            <Icon name="x" size={11} /> Remover
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      )}

      {!selTurma && (
        <div className="empty">
          <div className="t">Selecione uma turma acima</div>
          <div className="s">PARA GERENCIAR ALUNOS E PROFESSORES</div>
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import api from '../api.js'
import Icon from '../components/Icon.jsx'

const AVATAR_COLORS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8']
const avatarColor = id => AVATAR_COLORS[Math.abs(Number(id) || 0) % AVATAR_COLORS.length]
const iniciais = nome => {
  const p = (nome || '').trim().split(/\s+/)
  return ((p[0]?.[0] || '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase() || '?'
}

function notaColor(n) {
  if (n == null) return 'var(--ink-3)'
  if (n >= 7) return 'var(--ok)'
  if (n >= 5) return 'var(--warn)'
  return 'var(--bad)'
}

export default function Boletim() {
  const [turmas, setTurmas] = useState([])
  const [alunos, setAlunos] = useState([])
  const [boletim, setBoletim] = useState([])
  const [selTurma, setSelTurma] = useState('')
  const [selAluno, setSelAluno] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { api.get('/turmas').then(r => setTurmas(r.data)) }, [])

  const onTurmaChange = tid => {
    setSelTurma(tid); setSelAluno(''); setBoletim([]); setAlunos([])
    if (tid) api.get('/vinculos/aluno-turma/' + tid).then(r => setAlunos(r.data.map(v => v.aluno)))
  }

  const onAlunoChange = async aid => {
    setSelAluno(aid); setBoletim([])
    if (!aid) return
    setLoading(true)
    const data = await api.get(`/notas/boletim/${aid}/${selTurma}`).then(r => r.data).catch(() => [])
    setBoletim(data)
    setLoading(false)
  }

  const alunoNome = alunos.find(a => a.id === Number(selAluno))?.nome || ''
  const turmaInfo = turmas.find(t => t.id === Number(selTurma))

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Lançamentos · Boletim</div>
          <h1 className="page-title">Boletim Escolar</h1>
          <div className="page-subtitle">Consulte médias, frequência e situação final do aluno</div>
        </div>
      </div>

      <div className="card mb-4" style={{ padding: 18 }}>
        <div className="row" style={{ gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="field" style={{ margin: 0, minWidth: 220 }}>
            <label>Turma</label>
            <select className="select" value={selTurma} onChange={e => onTurmaChange(e.target.value)}>
              <option value="">Selecione…</option>
              {turmas.map(t => <option key={t.id} value={t.id}>{t.nome} ({t.serie?.nome})</option>)}
            </select>
          </div>
          <div className="field" style={{ margin: 0, minWidth: 260 }}>
            <label>Aluno</label>
            <select className="select" value={selAluno} onChange={e => onAlunoChange(e.target.value)} disabled={!selTurma}>
              <option value="">Selecione…</option>
              {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="empty">
          <div className="t">Carregando boletim…</div>
        </div>
      )}

      {!loading && boletim.length > 0 && (
        <div>
          <div className="row mb-4" style={{ gap: 14 }}>
            <div className={`avatar ${avatarColor(selAluno)}`} style={{ width: 44, height: 44, fontSize: 15, flexShrink: 0 }}>
              {iniciais(alunoNome)}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>{alunoNome}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>
                {turmaInfo?.nome} — {turmaInfo?.serie?.nome} ({turmaInfo?.anoLetivo})
              </div>
            </div>
          </div>

          {boletim.map(mat => (
            <div key={mat.materiaId} className="card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
              <div className="section-head">
                <div className="row" style={{ gap: 12 }}>
                  <div className="t">{mat.materiaNome}</div>
                  <span className={`pill ${mat.situacao === 'APROVADO' ? 'ok' : 'err'}`}>
                    <span className="dot" />
                    {mat.situacao}
                  </span>
                </div>
                <div className="row" style={{ gap: 20 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div className="card-eyebrow" style={{ marginBottom: 2 }}>Média anual</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1, color: notaColor(mat.mediaAnual != null ? Number(mat.mediaAnual) : null) }}>
                      {mat.mediaAnual != null ? Number(mat.mediaAnual).toFixed(1) : '—'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div className="card-eyebrow" style={{ marginBottom: 2 }}>Frequência</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1, color: Number(mat.frequencia) >= 75 ? 'var(--ok)' : 'var(--bad)' }}>
                      {mat.frequencia}%
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: 16, gap: 16 }}>
                {mat.bimestres.map(bim => (
                  <div key={bim.numero}>
                    <div className="card-eyebrow" style={{ marginBottom: 8 }}>{bim.numero}º Bimestre</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, lineHeight: 1, color: notaColor(bim.media != null ? Number(bim.media) : null), marginBottom: 12 }}>
                      {bim.media != null ? Number(bim.media).toFixed(1) : '—'}
                    </div>
                    {bim.notas.map((n, i) => (
                      <div key={i} className="row between" style={{ padding: '3px 0', borderBottom: '1px solid var(--line)', fontSize: 11 }}>
                        <span style={{ color: 'var(--ink-3)' }}>{n.descricao}</span>
                        <span className="num" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--ink-2)' }}>
                          {n.valor != null ? Number(n.valor).toFixed(1) : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && selAluno && boletim.length === 0 && (
        <div className="empty">
          <div className="t">Sem dados para este aluno</div>
          <div className="s">NENHUMA MATÉRIA VINCULADA OU SEM AVALIAÇÕES</div>
        </div>
      )}

      {!selAluno && (
        <div className="empty">
          <div className="t">Selecione turma e aluno</div>
          <div className="s">PARA VISUALIZAR O BOLETIM</div>
        </div>
      )}
    </div>
  )
}

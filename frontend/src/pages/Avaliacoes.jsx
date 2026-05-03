import { useEffect, useState } from 'react'
import api from '../api.js'
import Icon from '../components/Icon.jsx'

const TIPO_PILL = {
  PROVA:      { cls: 'info',  label: 'Prova' },
  TRABALHO:   { cls: 'ok',    label: 'Trabalho' },
  SIMULADO:   { cls: 'warn',  label: 'Simulado' },
  RECUPERACAO:{ cls: 'bad',   label: 'Recuperação' },
}

export default function Avaliacoes() {
  const [items, setItems] = useState([])
  const [turmas, setTurmas] = useState([])
  const [materias, setMaterias] = useState([])
  const [modal, setModal] = useState(false)
  const [filtroTurma, setFiltroTurma] = useState('')

  const load = tid => {
    const params = tid ? { turmaId: tid } : {}
    api.get('/avaliacoes', { params }).then(r => setItems(r.data))
  }
  useEffect(() => {
    load('')
    api.get('/turmas').then(r => setTurmas(r.data))
    api.get('/materias').then(r => setMaterias(r.data))
  }, [])

  const del = async id => {
    if (!confirm('Excluir esta avaliação?')) return
    await api.delete(`/avaliacoes/${id}`)
    load(filtroTurma)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Lançamentos · Avaliações</div>
          <h1 className="page-title">Avaliações</h1>
          <div className="page-subtitle">Provas, trabalhos e atividades avaliativas</div>
        </div>
        <button className="btn accent" type="button" onClick={() => setModal(true)}>
          <Icon name="plus" /> Nova avaliação
        </button>
      </div>

      <div className="filter-row">
        <select
          className="select"
          style={{ width: 'auto', maxWidth: 260 }}
          value={filtroTurma}
          onChange={e => { setFiltroTurma(e.target.value); load(e.target.value) }}
        >
          <option value="">Todas as turmas</option>
          {turmas.map(t => <option key={t.id} value={t.id}>{t.nome} ({t.serie?.nome})</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {items.length === 0 ? (
          <div className="empty">
            <div className="t">Nenhuma avaliação encontrada</div>
            <div className="s">CRIE A PRIMEIRA AVALIAÇÃO ACIMA</div>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Tipo</th>
                <th>Turma</th>
                <th>Matéria</th>
                <th>Bimestre</th>
                <th>Data</th>
                <th>Peso</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map(r => {
                const tp = TIPO_PILL[r.tipo] || { cls: '', label: r.tipo }
                return (
                  <tr key={r.id}>
                    <td className="strong">{r.descricao || r.tipo}</td>
                    <td>
                      <span className={`pill ${tp.cls}`}>
                        <span className="dot" />{tp.label}
                      </span>
                    </td>
                    <td>{r.turma?.nome} <span style={{ color: 'var(--ink-4)', fontSize: 11 }}>({r.turma?.serie?.nome})</span></td>
                    <td>{r.materia?.nome}</td>
                    <td className="num">{r.bimestre}º</td>
                    <td className="num">{r.dataAplicacao || '—'}</td>
                    <td className="num">{r.peso}</td>
                    <td>
                      <button className="icon-btn" type="button" title="Excluir" style={{ color: 'var(--bad)' }} onClick={() => del(r.id)}>
                        <Icon name="trash" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <AvaliacaoModal
          turmas={turmas}
          materias={materias}
          onClose={() => setModal(false)}
          onSaved={() => { setModal(false); load(filtroTurma) }}
        />
      )}
    </div>
  )
}

function AvaliacaoModal({ turmas, materias, onClose, onSaved }) {
  const [f, setF] = useState({
    turmaId: '', materiaId: '', tipo: 'PROVA', descricao: '',
    dataAplicacao: '', peso: '1', bimestre: '1',
  })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const upd = k => e => setF(p => ({ ...p, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setErro('')
    if (!f.turmaId || !f.materiaId) return setErro('Selecione turma e matéria.')
    setSaving(true)
    try {
      await api.post('/avaliacoes', {
        ...f,
        turmaId: Number(f.turmaId),
        materiaId: Number(f.materiaId),
        peso: Number(f.peso),
        bimestre: Number(f.bimestre),
      })
      onSaved()
    } catch (err) {
      setErro(err.response?.data || 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" onClick={e => e.stopPropagation()} onSubmit={submit} style={{ width: 620 }}>
        <div className="modal-header">
          <div>
            <div className="card-eyebrow">Nova avaliação</div>
            <div className="modal-title">Cadastrar avaliação</div>
          </div>
          <button className="icon-btn" type="button" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="field">
              <label>Turma *</label>
              <select className="select" value={f.turmaId} onChange={upd('turmaId')} required>
                <option value="">Selecionar…</option>
                {turmas.map(t => <option key={t.id} value={t.id}>{t.nome} ({t.serie?.nome})</option>)}
              </select>
            </div>
            <div className="field">
              <label>Matéria *</label>
              <select className="select" value={f.materiaId} onChange={upd('materiaId')} required>
                <option value="">Selecionar…</option>
                {materias.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Tipo *</label>
              <select className="select" value={f.tipo} onChange={upd('tipo')}>
                <option value="PROVA">Prova</option>
                <option value="TRABALHO">Trabalho</option>
                <option value="SIMULADO">Simulado</option>
                <option value="RECUPERACAO">Recuperação</option>
              </select>
            </div>
            <div className="field">
              <label>Bimestre *</label>
              <select className="select" value={f.bimestre} onChange={upd('bimestre')}>
                {[1,2,3,4].map(b => <option key={b} value={b}>{b}º Bimestre</option>)}
              </select>
            </div>
            <div className="field" style={{ gridColumn: 'span 2' }}>
              <label>Descrição</label>
              <input className="input" value={f.descricao} onChange={upd('descricao')} placeholder="Ex: Prova de Álgebra" />
            </div>
            <div className="field">
              <label>Data de aplicação *</label>
              <input className="input" type="date" value={f.dataAplicacao} onChange={upd('dataAplicacao')} required />
            </div>
            <div className="field">
              <label>Peso *</label>
              <input className="input" type="number" min="0.1" max="10" step="0.1" value={f.peso} onChange={upd('peso')} required />
            </div>
          </div>
          {erro && <div style={{ color: 'var(--bad)', fontSize: 12, marginTop: 4 }}>{erro}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn" type="button" onClick={onClose}>Cancelar</button>
          <button className="btn accent" type="submit" disabled={saving}>{saving ? 'Salvando…' : 'Criar avaliação'}</button>
        </div>
      </form>
    </div>
  )
}

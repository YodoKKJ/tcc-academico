import { useEffect, useState } from 'react'
import api from '../api.js'
import Icon from '../components/Icon.jsx'

const ANO_ATUAL = new Date().getFullYear()
const AVATAR_COLORS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8']
const avatarColor = id => AVATAR_COLORS[Math.abs(Number(id) || 0) % AVATAR_COLORS.length]
const turmaInitial = t => (t?.nome || '?').trim()[0]?.toUpperCase() || '?'

export default function Turmas() {
  const [items, setItems] = useState([])
  const [series, setSeries] = useState([])
  const [modal, setModal] = useState(null)

  const load = () => api.get('/turmas').then(r => setItems(r.data))
  useEffect(() => {
    load()
    api.get('/series').then(r => setSeries(r.data))
  }, [])

  const del = async id => {
    if (!confirm('Excluir esta turma?')) return
    await api.delete(`/turmas/${id}`)
    load()
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Acadêmico · Turmas</div>
          <h1 className="page-title">Turmas</h1>
          <div className="page-subtitle">{items.length} turma{items.length !== 1 ? 's' : ''} cadastrada{items.length !== 1 ? 's' : ''}</div>
        </div>
        <button className="btn accent" type="button" onClick={() => setModal({ type: 'new' })}>
          <Icon name="plus" /> Nova turma
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {items.length === 0 ? (
          <div className="empty">
            <div className="t">Nenhuma turma cadastrada</div>
            <div className="s">CRIE SÉRIES PRIMEIRO, DEPOIS AS TURMAS</div>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Turma</th>
                <th>Série</th>
                <th>Ano letivo</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map(r => (
                <tr key={r.id}>
                  <td>
                    <span className="row">
                      <span className={`avatar sm ${avatarColor(r.id)}`}>{turmaInitial(r)}</span>
                      <span className="strong">{r.nome}</span>
                    </span>
                  </td>
                  <td>{r.serie?.nome || '—'}</td>
                  <td className="num">{r.anoLetivo || '—'}</td>
                  <td>
                    <span className="row">
                      <button className="icon-btn" type="button" title="Editar" onClick={() => setModal({ type: 'edit', item: r })}>
                        <Icon name="edit" />
                      </button>
                      <button className="icon-btn" type="button" title="Excluir" style={{ color: 'var(--bad)' }} onClick={() => del(r.id)}>
                        <Icon name="trash" />
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <TurmaModal
          item={modal.item}
          series={series}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load() }}
        />
      )}
    </div>
  )
}

function TurmaModal({ item, series, onClose, onSaved }) {
  const isEdit = !!item
  const [f, setF] = useState({
    nome: item?.nome || '',
    serieId: item?.serie?.id || '',
    anoLetivo: item?.anoLetivo || ANO_ATUAL,
  })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  const submit = async e => {
    e.preventDefault()
    setErro('')
    if (!f.nome.trim()) return setErro('Informe o nome.')
    if (!f.serieId) return setErro('Selecione a série.')
    setSaving(true)
    try {
      const payload = { nome: f.nome.trim(), serieId: Number(f.serieId), anoLetivo: Number(f.anoLetivo) }
      if (isEdit) await api.put(`/turmas/${item.id}`, payload)
      else await api.post('/turmas', payload)
      onSaved()
    } catch {
      setErro('Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" onClick={e => e.stopPropagation()} onSubmit={submit}>
        <div className="modal-header">
          <div>
            <div className="card-eyebrow">{isEdit ? 'Editar turma' : 'Nova turma'}</div>
            <div className="modal-title">{isEdit ? item.nome : 'Cadastrar turma'}</div>
          </div>
          <button className="icon-btn" type="button" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Nome da turma *</label>
            <input className="input" value={f.nome} onChange={e => set('nome', e.target.value)} required placeholder="Ex: 3º A" autoFocus />
          </div>
          <div className="form-grid">
            <div className="field">
              <label>Série *</label>
              <select className="select" value={f.serieId} onChange={e => set('serieId', e.target.value)} required>
                <option value="">Selecionar…</option>
                {series.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Ano letivo *</label>
              <input className="input" type="number" value={f.anoLetivo} onChange={e => set('anoLetivo', e.target.value)} required />
            </div>
          </div>
          {erro && <div style={{ color: 'var(--bad)', fontSize: 12, marginTop: 4 }}>{erro}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn" type="button" onClick={onClose}>Cancelar</button>
          <button className="btn accent" type="submit" disabled={saving}>{saving ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar turma'}</button>
        </div>
      </form>
    </div>
  )
}

import { useEffect, useState } from 'react'
import api from '../api.js'
import Icon from '../components/Icon.jsx'

const AVATAR_COLORS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8']
const avatarColor = id => AVATAR_COLORS[Math.abs(Number(id) || 0) % AVATAR_COLORS.length]
const iniciais = nome => {
  const p = (nome || '').trim().split(/\s+/)
  return ((p[0]?.[0] || '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase() || '?'
}

export default function Professores() {
  const [items, setItems] = useState([])
  const [modal, setModal] = useState(null)

  const load = () => api.get('/professores').then(r => setItems(r.data))
  useEffect(() => { load() }, [])

  const del = async id => {
    if (!confirm('Excluir este professor?')) return
    await api.delete(`/professores/${id}`)
    load()
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Pessoas · Professores</div>
          <h1 className="page-title">Professores</h1>
          <div className="page-subtitle">{items.length} professor{items.length !== 1 ? 'es' : ''} no corpo docente</div>
        </div>
        <button className="btn accent" type="button" onClick={() => setModal({ type: 'new' })}>
          <Icon name="plus" /> Novo professor
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {items.length === 0 ? (
          <div className="empty">
            <div className="t">Nenhum professor cadastrado</div>
            <div className="s">CLIQUE EM "NOVO PROFESSOR" PARA COMEÇAR</div>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Professor</th>
                <th>Especialidade</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map(r => (
                <tr key={r.id}>
                  <td>
                    <span className="row">
                      <span className={`avatar sm ${avatarColor(r.id)}`}>{iniciais(r.nome)}</span>
                      <span className="strong">{r.nome}</span>
                    </span>
                  </td>
                  <td>{r.especialidade || '—'}</td>
                  <td>{r.email || '—'}</td>
                  <td>{r.telefone || '—'}</td>
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
        <ProfessorModal
          item={modal.item}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load() }}
        />
      )}
    </div>
  )
}

function ProfessorModal({ item, onClose, onSaved }) {
  const isEdit = !!item
  const [f, setF] = useState({ nome: '', email: '', telefone: '', especialidade: '', ...item })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const upd = k => e => setF(p => ({ ...p, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setErro('')
    if (!f.nome.trim()) return setErro('Informe o nome.')
    setSaving(true)
    try {
      if (isEdit) await api.put(`/professores/${item.id}`, f)
      else await api.post('/professores', f)
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
            <div className="card-eyebrow">{isEdit ? 'Editar professor' : 'Novo professor'}</div>
            <div className="modal-title">{isEdit ? item.nome : 'Cadastrar professor'}</div>
          </div>
          <button className="icon-btn" type="button" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Nome completo *</label>
            <input className="input" value={f.nome} onChange={upd('nome')} required placeholder="Nome do professor" autoFocus />
          </div>
          <div className="field">
            <label>Especialidade</label>
            <input className="input" value={f.especialidade ?? ''} onChange={upd('especialidade')} placeholder="Ex: Matemática / Ciências" />
          </div>
          <div className="form-grid">
            <div className="field">
              <label>E-mail</label>
              <input className="input" type="email" value={f.email ?? ''} onChange={upd('email')} />
            </div>
            <div className="field">
              <label>Telefone</label>
              <input className="input" value={f.telefone ?? ''} onChange={upd('telefone')} />
            </div>
          </div>
          {erro && <div style={{ color: 'var(--bad)', fontSize: 12, marginTop: 4 }}>{erro}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn" type="button" onClick={onClose}>Cancelar</button>
          <button className="btn accent" type="submit" disabled={saving}>{saving ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar professor'}</button>
        </div>
      </form>
    </div>
  )
}

import { useEffect, useState } from 'react'
import api from '../api.js'
import Icon from '../components/Icon.jsx'

const AVATAR_COLORS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8']
const avatarColor = id => AVATAR_COLORS[Math.abs(Number(id) || 0) % AVATAR_COLORS.length]
const iniciais = nome => {
  const p = (nome || '').trim().split(/\s+/)
  return ((p[0]?.[0] || '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase() || '?'
}

export default function Alunos() {
  const [items, setItems] = useState([])
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState(null)

  const load = (q = '') => api.get('/alunos', { params: q ? { nome: q } : {} }).then(r => setItems(r.data))
  useEffect(() => { load() }, [])

  const del = async id => {
    if (!confirm('Excluir este aluno?')) return
    await api.delete(`/alunos/${id}`)
    load(busca)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Pessoas · Alunos</div>
          <h1 className="page-title">Alunos</h1>
          <div className="page-subtitle">{items.length} aluno{items.length !== 1 ? 's' : ''} cadastrado{items.length !== 1 ? 's' : ''}</div>
        </div>
        <button className="btn accent" type="button" onClick={() => setModal({ type: 'new' })}>
          <Icon name="plus" /> Novo aluno
        </button>
      </div>

      <div className="filter-row">
        <div style={{ position: 'relative' }}>
          <Icon name="search" size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }} />
          <input
            className="input"
            style={{ paddingLeft: 32, width: 280 }}
            placeholder="Buscar por nome…"
            value={busca}
            onChange={e => { setBusca(e.target.value); load(e.target.value) }}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {items.length === 0 ? (
          <div className="empty">
            <div className="t">Nenhum aluno cadastrado</div>
            <div className="s">CLIQUE EM "NOVO ALUNO" PARA COMEÇAR</div>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Matrícula</th>
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
                  <td className="num">{r.matricula || '—'}</td>
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
        <AlunoModal
          item={modal.item}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(busca) }}
        />
      )}
    </div>
  )
}

function AlunoModal({ item, onClose, onSaved }) {
  const isEdit = !!item
  const [f, setF] = useState({
    nome: '', matricula: '', dataNascimento: '', nomePai: '', nomeMae: '', telefone: '', email: '',
    ...item,
  })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const upd = k => e => setF(p => ({ ...p, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setErro('')
    if (!f.nome.trim()) return setErro('Informe o nome.')
    setSaving(true)
    try {
      const body = { ...f, dataNascimento: f.dataNascimento || null }
      if (isEdit) await api.put(`/alunos/${item.id}`, body)
      else await api.post('/alunos', body)
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
            <div className="card-eyebrow">{isEdit ? 'Editar aluno' : 'Novo aluno'}</div>
            <div className="modal-title">{isEdit ? item.nome : 'Cadastrar aluno'}</div>
          </div>
          <button className="icon-btn" type="button" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div className="modal-body">
          <div className="field" style={{ gridColumn: 'span 2' }}>
            <label>Nome completo *</label>
            <input className="input" value={f.nome} onChange={upd('nome')} required placeholder="Nome do aluno" autoFocus />
          </div>
          <div className="form-grid">
            <div className="field">
              <label>Matrícula</label>
              <input className="input" value={f.matricula} onChange={upd('matricula')} placeholder="Ex: 2024001" />
            </div>
            <div className="field">
              <label>Data de nascimento</label>
              <input className="input" type="date" value={f.dataNascimento ?? ''} onChange={upd('dataNascimento')} />
            </div>
            <div className="field">
              <label>Nome do pai</label>
              <input className="input" value={f.nomePai ?? ''} onChange={upd('nomePai')} />
            </div>
            <div className="field">
              <label>Nome da mãe</label>
              <input className="input" value={f.nomeMae ?? ''} onChange={upd('nomeMae')} />
            </div>
            <div className="field">
              <label>Telefone</label>
              <input className="input" value={f.telefone ?? ''} onChange={upd('telefone')} />
            </div>
            <div className="field">
              <label>E-mail</label>
              <input className="input" type="email" value={f.email ?? ''} onChange={upd('email')} />
            </div>
          </div>
          {erro && <div style={{ color: 'var(--bad)', fontSize: 12, marginTop: 4 }}>{erro}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn" type="button" onClick={onClose}>Cancelar</button>
          <button className="btn accent" type="submit" disabled={saving}>{saving ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar aluno'}</button>
        </div>
      </form>
    </div>
  )
}

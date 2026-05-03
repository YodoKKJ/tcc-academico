import { useEffect, useState } from 'react'
import api from '../api.js'
import Icon from '../components/Icon.jsx'

export default function Materias() {
  const [items, setItems] = useState([])
  const [modal, setModal] = useState(null)

  const load = () => api.get('/materias').then(r => setItems(r.data))
  useEffect(() => { load() }, [])

  const del = async id => {
    if (!confirm('Excluir esta matéria?')) return
    await api.delete(`/materias/${id}`)
    load()
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Acadêmico · Matérias</div>
          <h1 className="page-title">Matérias</h1>
          <div className="page-subtitle">Disciplinas do currículo escolar</div>
        </div>
        <button className="btn accent" type="button" onClick={() => setModal({ type: 'new' })}>
          <Icon name="plus" /> Nova matéria
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {items.length === 0 ? (
          <div className="empty">
            <div className="t">Nenhuma matéria cadastrada</div>
            <div className="s">EX: MATEMÁTICA, PORTUGUÊS, CIÊNCIAS</div>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>Nome</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map(r => (
                <tr key={r.id}>
                  <td className="num" style={{ color: 'var(--ink-4)' }}>{r.id}</td>
                  <td className="strong">{r.nome}</td>
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
        <MateriaModal
          item={modal.item}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load() }}
        />
      )}
    </div>
  )
}

function MateriaModal({ item, onClose, onSaved }) {
  const isEdit = !!item
  const [nome, setNome] = useState(item?.nome ?? '')
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')

  const submit = async e => {
    e.preventDefault()
    setErro('')
    if (!nome.trim()) return setErro('Informe o nome.')
    setSaving(true)
    try {
      if (isEdit) await api.put(`/materias/${item.id}`, { nome })
      else await api.post('/materias', { nome })
      onSaved()
    } catch {
      setErro('Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" onClick={e => e.stopPropagation()} onSubmit={submit} style={{ width: 420 }}>
        <div className="modal-header">
          <div>
            <div className="card-eyebrow">{isEdit ? 'Editar matéria' : 'Nova matéria'}</div>
            <div className="modal-title">{isEdit ? item.nome : 'Cadastrar matéria'}</div>
          </div>
          <button className="icon-btn" type="button" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Nome da matéria *</label>
            <input className="input" value={nome} onChange={e => setNome(e.target.value)} required placeholder="Ex: Matemática" autoFocus />
          </div>
          {erro && <div style={{ color: 'var(--bad)', fontSize: 12 }}>{erro}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn" type="button" onClick={onClose}>Cancelar</button>
          <button className="btn accent" type="submit" disabled={saving}>{saving ? 'Salvando…' : isEdit ? 'Salvar' : 'Criar matéria'}</button>
        </div>
      </form>
    </div>
  )
}

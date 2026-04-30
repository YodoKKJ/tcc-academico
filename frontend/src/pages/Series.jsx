import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import api from '../api.js'
import PageHeader from '../components/PageHeader.jsx'
import Table from '../components/Table.jsx'
import Modal from '../components/Modal.jsx'
import Btn from '../components/Btn.jsx'

function Form({ initial, onSave, onClose }) {
  const [nome, setNome] = useState(initial?.nome ?? '')
  const submit = async e => {
    e.preventDefault()
    if (initial?.id) await api.put(`/series/${initial.id}`, { nome })
    else await api.post('/series', { nome })
    onSave()
  }
  return (
    <form onSubmit={submit}>
      <label style={L.label}>Nome da Série *</label>
      <input style={L.input} value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: 1º Ano" required />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn>Salvar</Btn>
      </div>
    </form>
  )
}

const L = {
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5, textTransform: 'uppercase', letterSpacing: .4 },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 7, fontSize: 13.5, boxSizing: 'border-box', outline: 'none' },
}

export default function Series() {
  const [items, setItems] = useState([])
  const [modal, setModal] = useState(null)

  const load = () => api.get('/series').then(r => setItems(r.data))
  useEffect(() => { load() }, [])

  const del = async id => {
    if (!confirm('Excluir série?')) return
    await api.delete(`/series/${id}`)
    load()
  }

  const cols = [
    { key: 'id', label: '#', render: r => <span style={{ color: '#94a3b8', fontSize: 12 }}>{r.id}</span> },
    { key: 'nome', label: 'Nome' },
    { key: 'acoes', label: 'Ações', render: r => (
      <div style={{ display: 'flex', gap: 6 }}>
        <Btn size="sm" variant="ghost" onClick={() => setModal({ type: 'edit', item: r })}><Pencil size={13} />Editar</Btn>
        <Btn size="sm" variant="danger" onClick={() => del(r.id)}><Trash2 size={13} /></Btn>
      </div>
    )},
  ]

  return (
    <div>
      <PageHeader title="Séries" subtitle="Níveis de ensino (ex: 1º Ano, 2º Ano)"
        action={<Btn onClick={() => setModal({ type: 'new' })}><Plus size={14} />Nova Série</Btn>} />
      <Table columns={cols} rows={items} />
      {modal && (
        <Modal title={modal.type === 'new' ? 'Nova Série' : 'Editar Série'} onClose={() => setModal(null)}>
          <Form initial={modal.item} onSave={() => { setModal(null); load() }} onClose={() => setModal(null)} />
        </Modal>
      )}
    </div>
  )
}

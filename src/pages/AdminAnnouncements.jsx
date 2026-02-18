import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Pin, Trash2, X } from 'lucide-react'

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', is_pinned: false })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchAnnouncements() }, [])

  async function fetchAnnouncements() {
    const { data } = await supabase.from('announcements').select('*').order('is_pinned', { ascending: false }).order('created_at', { ascending: false })
    setAnnouncements(data || [])
  }

  async function save() {
    if (!form.title || !form.body) return toast.error('Completa todos los campos')
    setSaving(true)
    await supabase.from('announcements').insert({ ...form })
    toast.success('Anuncio publicado')
    setShowModal(false)
    setForm({ title: '', body: '', is_pinned: false })
    fetchAnnouncements()
    setSaving(false)
  }

  async function togglePin(a) {
    await supabase.from('announcements').update({ is_pinned: !a.is_pinned }).eq('id', a.id)
    fetchAnnouncements()
  }

  async function deleteAnn(id) {
    if (!confirm('¿Eliminar este anuncio?')) return
    await supabase.from('announcements').delete().eq('id', id)
    toast.success('Anuncio eliminado')
    fetchAnnouncements()
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('es-GT', { day:'numeric', month:'long', year:'numeric' })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Anuncios</h1>
          <p className="page-subtitle">Comunicados para todos los residentes</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={15}/> Nuevo anuncio</button>
      </div>

      {announcements.length === 0 ? (
        <div className="empty-state"><h3>No hay anuncios</h3><p>Crea el primer comunicado</p></div>
      ) : (
        announcements.map(a => (
          <div key={a.id} className={`announcement-card ${a.is_pinned ? 'pinned' : ''}`}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                  {a.is_pinned && <span className="badge badge-gold"><Pin size={10}/> Fijado</span>}
                  <h3 style={{fontFamily:'DM Serif Display',fontSize:18}}>{a.title}</h3>
                </div>
                <p style={{fontSize:14,color:'#4a4a6a',lineHeight:1.6}}>{a.body}</p>
                <p className="announcement-meta">{formatDate(a.created_at)}</p>
              </div>
              <div style={{display:'flex',gap:6,flexShrink:0}}>
                <button className={`btn btn-sm ${a.is_pinned ? 'btn-gold' : 'btn-outline'}`} onClick={() => togglePin(a)}>
                  <Pin size={13}/> {a.is_pinned ? 'Desfijar' : 'Fijar'}
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => deleteAnn(a.id)}><Trash2 size={13}/></button>
              </div>
            </div>
          </div>
        ))
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Nuevo Anuncio</h2>
              <button className="btn btn-icon btn-outline" onClick={() => setShowModal(false)}><X size={16}/></button>
            </div>
            <div className="form-group">
              <label className="form-label">Título</label>
              <input type="text" className="form-input" placeholder="Título del anuncio" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Mensaje</label>
              <textarea className="form-textarea" rows={4} placeholder="Escribe tu comunicado aquí..." value={form.body} onChange={e => setForm({...form, body: e.target.value})} />
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <input type="checkbox" id="pin" checked={form.is_pinned} onChange={e => setForm({...form, is_pinned: e.target.checked})} />
              <label htmlFor="pin" style={{fontSize:14,cursor:'pointer'}}>Fijar este anuncio arriba</label>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-gold" onClick={save} disabled={saving}>{saving ? 'Publicando...' : 'Publicar anuncio'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
